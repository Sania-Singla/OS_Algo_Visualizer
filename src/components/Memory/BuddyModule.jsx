import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
////PENDING🔴
export default function BuddyModule({
    state,
    setState,
    sharedActions,
    highlightedItem,
}) {
    const [allocations, setAllocations] = useState([]);
    const [nextAllocId, setNextAllocId] = useState(1);
    const [operations, setOperations] = useState([]);
    const [totalMemory] = useState(1024); // Total memory size in bytes

    // Initialize with a single root block
    useEffect(() => {
        if (!state.buddyAllocator.tree) {
            setState((prev) => ({
                ...prev,
                buddyAllocator: {
                    tree: {
                        id: 'root',
                        size: totalMemory,
                        isFree: true,
                        allocatedTo: null,
                        level: 0,
                        left: null,
                        right: null,
                    },
                },
            }));
        }
    }, [state.buddyAllocator.tree, totalMemory, setState]);

    const allocateMemory = (size) => {
        const allocSize = Math.pow(2, Math.ceil(Math.log2(Math.max(16, size))));

        // Check if we have enough free memory
        const totalAllocated = allocations.reduce(
            (sum, alloc) => sum + alloc.size,
            0
        );
        if (totalAllocated + allocSize > totalMemory) {
            alert(
                `Cannot allocate ${size} bytes (${allocSize} after rounding). Not enough free memory!`
            );
            return;
        }

        const doAllocation = (node) => {
            if (!node || !node.isFree || node.size < allocSize) return false;

            // Exact fit at a leaf
            if (!node.left && !node.right && node.size === allocSize) {
                node.isFree = false;
                node.allocatedTo = `A${nextAllocId}`;
                setAllocations((prev) => [
                    ...prev,
                    { id: `A${nextAllocId}`, size: allocSize },
                ]);
                setNextAllocId((prev) => prev + 1);

                setOperations((prev) => [
                    {
                        type: 'alloc',
                        blockId: node.id,
                        allocId: `A${nextAllocId - 1}`,
                        size: allocSize,
                        time: Date.now(),
                    },
                    ...prev,
                ]);

                sharedActions.highlightItem({
                    type: 'buddy-alloc',
                    id: node.id,
                });

                return true;
            }

            // Split only if children don't exist
            if (!node.left && !node.right) {
                if (node.size / 2 < 16) return false; // Cannot split smaller than min

                node.left = {
                    id: `${node.id}-L`,
                    size: node.size / 2,
                    isFree: true,
                    allocatedTo: null,
                    level: node.level + 1,
                    parent: node,
                    left: null,
                    right: null,
                };
                node.right = {
                    id: `${node.id}-R`,
                    size: node.size / 2,
                    isFree: true,
                    allocatedTo: null,
                    level: node.level + 1,
                    parent: node,
                    left: null,
                    right: null,
                };
                node.isFree = false;

                setOperations((prev) => [
                    {
                        type: 'split',
                        parentId: node.id,
                        leftId: node.left.id,
                        rightId: node.right.id,
                        size: node.size / 2,
                        time: Date.now(),
                    },
                    ...prev,
                ]);

                sharedActions.highlightItem({
                    type: 'buddy-split',
                    id: node.id,
                });
            }

            // Allocation must try left first, then right only if left failed
            // Ensure not to retry into already allocated branches
            const allocatedLeft = node.left ? doAllocation(node.left) : false;
            if (allocatedLeft) return true;

            const allocatedRight = node.right
                ? doAllocation(node.right)
                : false;
            if (allocatedRight) return true;

            return false;
        };

        const success = doAllocation(state.buddyAllocator.tree);
        if (!success) {
            alert(
                `Couldn't allocate ${size} bytes (needed ${allocSize} bytes)`
            );
        } else {
            setState((prev) => ({ ...prev })); // Trigger re-render
        }
    };

    const deallocateMemory = (allocId) => {
        const findAndFree = (node) => {
            if (!node) return false;

            if (node.allocatedTo === allocId) {
                node.isFree = true;
                node.allocatedTo = null;
                setAllocations((prev) => prev.filter((a) => a.id !== allocId));

                setOperations((prev) => [
                    {
                        type: 'free',
                        blockId: node.id,
                        allocId,
                        size: node.size,
                        time: Date.now(),
                    },
                    ...prev,
                ]);

                sharedActions.highlightItem({
                    type: 'buddy-free',
                    id: node.id,
                });

                // Try to merge with buddy if possible
                const tryMerge = (n) => {
                    if (!n.parent) return;

                    const buddy =
                        n.parent.left === n ? n.parent.right : n.parent.left;

                    if (
                        buddy &&
                        buddy.isFree &&
                        !buddy.allocatedTo &&
                        !buddy.left &&
                        !buddy.right
                    ) {
                        // We can merge with buddy
                        const parent = n.parent;

                        setOperations((prev) => [
                            {
                                type: 'merge',
                                parentId: parent.id,
                                leftId: parent.left.id,
                                rightId: parent.right.id,
                                size: parent.size / 2,
                                time: Date.now(),
                            },
                            ...prev,
                        ]);

                        sharedActions.highlightItem({
                            type: 'buddy-merge',
                            id: parent.id,
                        });

                        // Remove the children
                        parent.left = null;
                        parent.right = null;
                        parent.isFree = true;

                        // Try merging up the tree
                        tryMerge(parent);
                    }
                };

                tryMerge(node);
                return true;
            }

            return findAndFree(node.left) || findAndFree(node.right);
        };

        const didFree = findAndFree(state.buddyAllocator.tree);
        if (didFree) {
            setState((prev) => ({ ...prev }));
        }
    };

    const renderBuddyTree = (node) => {
        if (!node) return null;

        const isHighlighted = highlightedItem?.id === node.id;
        let highlightClass = '';
        let highlightText = '';

        if (isHighlighted) {
            switch (highlightedItem.type) {
                case 'buddy-alloc':
                    highlightClass = 'bg-green-900/50';
                    highlightText = 'Allocated';
                    break;
                case 'buddy-free':
                    highlightClass = 'bg-red-900/50';
                    highlightText = 'Freed';
                    break;
                case 'buddy-split':
                    highlightClass = 'bg-blue-900/50';
                    highlightText = 'Split';
                    break;
                case 'buddy-merge':
                    highlightClass = 'bg-purple-900/50';
                    highlightText = 'Merged';
                    break;
            }
        }

        return (
            <motion.div
                layout
                className="ml-4 border-l-2 border-gray-600 pl-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    layout
                    className={`p-2 rounded mb-1 ${highlightClass} ${
                        node.isFree ? 'bg-gray-800/50' : 'bg-red-800/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-mono text-sm">
                                Size: {node.size}B
                            </div>
                            {node.allocatedTo && (
                                <div className="text-xs">
                                    Alloc: {node.allocatedTo}
                                </div>
                            )}
                        </div>
                        {isHighlighted && (
                            <div className="text-xs bg-black/30 px-1.5 py-0.5 rounded">
                                {highlightText}
                            </div>
                        )}
                    </div>
                </motion.div>
                <div className="flex">
                    {node.left && renderBuddyTree(node.left)}
                    {node.right && renderBuddyTree(node.right)}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">Buddy Allocator</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Allocation Controls */}
                <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="font-bold mb-4">Allocate Memory</h3>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {[16, 32, 64, 128, 256, 512].map((size) => (
                            <motion.button
                                key={size}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => allocateMemory(size)}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                            >
                                Alloc {size}B
                            </motion.button>
                        ))}
                    </div>

                    <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2">
                            Current Allocations
                        </h4>
                        {allocations.length > 0 ? (
                            <div className="space-y-1">
                                <AnimatePresence>
                                    {allocations.map((alloc) => (
                                        <motion.div
                                            key={alloc.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex justify-between items-center p-2 bg-gray-700/50 rounded"
                                        >
                                            <span className="text-sm">
                                                {alloc.id}: {alloc.size}B
                                            </span>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() =>
                                                    deallocateMemory(alloc.id)
                                                }
                                                className="text-red-400 hover:text-red-300 text-xs"
                                            >
                                                Free
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-gray-500 italic text-sm">
                                No active allocations
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">
                            Memory Usage
                        </h4>
                        <div className="h-2 bg-gray-700 rounded-full mb-1">
                            <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                    width: `${(allocations.reduce((sum, alloc) => sum + alloc.size, 0) / totalMemory) * 100}%`,
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-xs">
                            <span>
                                Used:{' '}
                                {allocations.reduce(
                                    (sum, alloc) => sum + alloc.size,
                                    0
                                )}
                                B
                            </span>
                            <span>
                                Free:{' '}
                                {totalMemory -
                                    allocations.reduce(
                                        (sum, alloc) => sum + alloc.size,
                                        0
                                    )}
                                B
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tree Visualization */}
                <div className="bg-gray-800 rounded-xl p-6 lg:col-span-2 overflow-x-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Memory Tree</h3>
                        <div className="text-xs text-gray-400">
                            Total: {totalMemory}B • Min Block: 16B
                        </div>
                    </div>

                    {state.buddyAllocator.tree ? (
                        <div className="bg-gray-900/30 rounded-lg p-4">
                            {renderBuddyTree(state.buddyAllocator.tree)}
                        </div>
                    ) : (
                        <div className="text-gray-500 italic">
                            Buddy system not initialized
                        </div>
                    )}

                    <div className="mt-4 bg-gray-900/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">
                            Recent Operations
                        </h4>
                        <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                            {operations.slice(0, 5).map((op, i) => (
                                <div
                                    key={i}
                                    className={`p-1.5 rounded ${
                                        op.type === 'alloc'
                                            ? 'bg-green-900/30'
                                            : op.type === 'free'
                                              ? 'bg-red-900/30'
                                              : op.type === 'split'
                                                ? 'bg-blue-900/30'
                                                : 'bg-purple-900/30'
                                    }`}
                                >
                                    {op.type === 'alloc' &&
                                        `Allocated ${op.size}B as ${op.allocId}`}
                                    {op.type === 'free' &&
                                        `Freed ${op.allocId} (${op.size}B)`}
                                    {op.type === 'split' &&
                                        `Split block ${op.parentId} into ${op.leftId} and ${op.rightId}`}
                                    {op.type === 'merge' &&
                                        `Merged blocks ${op.leftId} and ${op.rightId} into ${op.parentId}`}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
