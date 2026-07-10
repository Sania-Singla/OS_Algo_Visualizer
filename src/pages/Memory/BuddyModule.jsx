import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MIN_SIZE = 1;
const MAX_SIZE = 128;

function createBlock(id, size) {
    return {
        id,
        size,
        allocated: false,
        requestedSize: null,
        left: null,
        right: null,
    };
}

function isSplit(block) {
    return block.left !== null && block.right !== null;
}

/*
Returns:
{
    tree: updated tree,
    allocatedBlock: allocated block or null
}
*/
function allocateBlock(block, requestedSize) {
    if (block.allocated) {
        return {
            tree: block,
            allocatedBlock: null,
        };
    }

    // Search already-split children from left to right
    if (isSplit(block)) {
        const leftResult = allocateBlock(block.left, requestedSize);

        if (leftResult.allocatedBlock) {
            return {
                tree: {
                    ...block,
                    left: leftResult.tree,
                },
                allocatedBlock: leftResult.allocatedBlock,
            };
        }

        const rightResult = allocateBlock(block.right, requestedSize);

        return {
            tree: {
                ...block,
                right: rightResult.tree,
            },
            allocatedBlock: rightResult.allocatedBlock,
        };
    }

    // Current block cannot satisfy the request
    if (block.size < requestedSize) {
        return {
            tree: block,
            allocatedBlock: null,
        };
    }

    /*
    Split while one half can still hold the request.

    Example:
    Request = 20 KB
    128 -> 64 -> 32
    32 cannot split into 16 because 16 < 20.
    */
    if (block.size / 2 >= requestedSize) {
        const halfSize = block.size / 2;

        const left = createBlock(`${block.id}-L`, halfSize);

        const right = createBlock(`${block.id}-R`, halfSize);

        const splitBlock = {
            ...block,
            left,
            right,
        };

        return allocateBlock(splitBlock, requestedSize);
    }

    const allocatedBlock = {
        ...block,
        allocated: true,
        requestedSize,
    };

    return {
        tree: allocatedBlock,
        allocatedBlock,
    };
}

/*
Returns:
{
    tree: updated tree,
    found: whether the block was found
}
*/
function freeBlock(block, blockId) {
    if (block.id === blockId && block.allocated) {
        return {
            tree: {
                ...block,
                allocated: false,
                requestedSize: null,
            },
            found: true,
        };
    }

    if (!isSplit(block)) {
        return {
            tree: block,
            found: false,
        };
    }

    const leftResult = freeBlock(block.left, blockId);

    let updatedBlock = block;
    let found = leftResult.found;

    if (leftResult.found) {
        updatedBlock = {
            ...block,
            left: leftResult.tree,
        };
    } else {
        const rightResult = freeBlock(block.right, blockId);

        found = rightResult.found;

        if (rightResult.found) {
            updatedBlock = {
                ...block,
                right: rightResult.tree,
            };
        }
    }

    if (!found) {
        return {
            tree: block,
            found: false,
        };
    }

    /*
    Merge the children when both buddies are:
    - not allocated
    - not further split
    */
    const leftIsFree =
        !updatedBlock.left.allocated && !isSplit(updatedBlock.left);

    const rightIsFree =
        !updatedBlock.right.allocated && !isSplit(updatedBlock.right);

    if (leftIsFree && rightIsFree) {
        return {
            tree: {
                ...updatedBlock,
                left: null,
                right: null,
            },
            found: true,
        };
    }

    return {
        tree: updatedBlock,
        found: true,
    };
}

function getAllocations(block, result = []) {
    if (block.allocated) {
        result.push({
            blockId: block.id,
            requestedSize: block.requestedSize,
            blockSize: block.size,
        });

        return result;
    }

    if (isSplit(block)) {
        getAllocations(block.left, result);
        getAllocations(block.right, result);
    }

    return result;
}

export default function BuddyModule() {
    const [tree, setTree] = useState(() => createBlock('root', MAX_SIZE));

    const [requestSize, setRequestSize] = useState(MIN_SIZE);

    const [manualSize, setManualSize] = useState('');

    const [highlight, setHighlight] = useState(null);

    const allocations = useMemo(() => getAllocations(tree), [tree]);

    const usedMemory = allocations.reduce(
        (sum, allocation) => sum + allocation.blockSize,
        0
    );

    const requestedMemory = allocations.reduce(
        (sum, allocation) => sum + allocation.requestedSize,
        0
    );

    const usagePercent = (usedMemory / MAX_SIZE) * 100;

    const handleAllocate = (size) => {
        const numericSize = Number(size);

        if (
            !Number.isInteger(numericSize) ||
            numericSize < MIN_SIZE ||
            numericSize > MAX_SIZE
        ) {
            alert(
                `Size must be an integer between ${MIN_SIZE} and ${MAX_SIZE} KB`
            );
            return;
        }

        const result = allocateBlock(tree, numericSize);

        if (!result.allocatedBlock) {
            alert('No suitable contiguous memory block is available');
            return;
        }

        setTree(result.tree);

        setHighlight({
            id: result.allocatedBlock.id,
            action: 'allocated',
        });

        setTimeout(() => {
            setHighlight(null);
        }, 800);
    };

    const handleManualSubmit = (event) => {
        event.preventDefault();

        handleAllocate(manualSize);
        setManualSize('');
    };

    const handleFree = (blockId) => {
        const result = freeBlock(tree, blockId);

        if (!result.found) {
            return;
        }

        setTree(result.tree);

        setHighlight({
            id: blockId,
            action: 'freed',
        });

        setTimeout(() => {
            setHighlight(null);
        }, 800);
    };

    const resetMemory = () => {
        setTree(createBlock('root', MAX_SIZE));
        setHighlight(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
            <h1 className="mb-12 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-center text-3xl font-bold text-transparent">
                Buddy Memory Allocator
            </h1>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <section className="rounded-xl bg-gray-800 p-6 shadow-lg">
                    <h2 className="mb-4 text-xl font-semibold">
                        Allocate Memory
                    </h2>

                    <label
                        htmlFor="request-size"
                        className="mb-2 block text-sm"
                    >
                        Selected size: {requestSize} KB
                    </label>

                    <input
                        id="request-size"
                        type="range"
                        min={MIN_SIZE}
                        max={MAX_SIZE}
                        value={requestSize}
                        onChange={(event) =>
                            setRequestSize(Number(event.target.value))
                        }
                        className="mb-4 w-full"
                    />

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAllocate(requestSize)}
                        className="mb-4 w-full rounded-lg bg-blue-600 py-2 font-medium hover:bg-blue-700"
                    >
                        Allocate Memory
                    </motion.button>

                    <form onSubmit={handleManualSubmit} className="mb-6">
                        <label
                            htmlFor="manual-size"
                            className="mb-2 block text-sm"
                        >
                            Manual size
                        </label>

                        <input
                            id="manual-size"
                            type="number"
                            min={MIN_SIZE}
                            max={MAX_SIZE}
                            value={manualSize}
                            onChange={(event) =>
                                setManualSize(event.target.value)
                            }
                            placeholder="Enter size in KB"
                            className="mb-2 w-full rounded border border-gray-500 bg-gray-700 px-3 py-2 text-white"
                        />

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-green-600 py-2 font-medium hover:bg-green-700"
                        >
                            Manual Allocate
                        </button>
                    </form>

                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold">Active Allocations</h3>

                        <button
                            onClick={resetMemory}
                            className="text-xs text-gray-400 hover:text-white"
                        >
                            Reset
                        </button>
                    </div>

                    <AnimatePresence>
                        {allocations.length === 0 && (
                            <p className="text-sm text-gray-400">
                                No active allocations
                            </p>
                        )}

                        {allocations.map((allocation) => (
                            <motion.div
                                key={allocation.blockId}
                                layout
                                initial={{
                                    opacity: 0,
                                    y: -5,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    x: -10,
                                }}
                                className="mb-2 flex items-center justify-between rounded bg-gray-700/50 p-2"
                            >
                                <div className="text-sm">
                                    <div>
                                        Requested: {allocation.requestedSize} KB
                                    </div>

                                    <div className="text-xs text-gray-400">
                                        Block: {allocation.blockSize} KB
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        handleFree(allocation.blockId)
                                    }
                                    className="px-2 text-xs text-red-400 hover:text-red-300"
                                >
                                    Free
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </section>

                <section className="rounded-xl bg-gray-800 p-6 shadow-lg md:col-span-1 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Memory Tree</h2>

                        <div className="text-right text-sm">
                            <div>
                                Reserved: {usedMemory} KB / {MAX_SIZE} KB
                            </div>

                            <div className="text-xs text-gray-400">
                                Requested: {requestedMemory} KB
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 h-3 w-full rounded-full bg-gray-700">
                        <div
                            className="h-3 rounded-full bg-blue-500 transition-all duration-500"
                            style={{
                                width: `${usagePercent}%`,
                            }}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <MemoryBlock block={tree} highlight={highlight} />
                    </div>
                </section>
            </div>
        </div>
    );
}

function MemoryBlock({ block, highlight, depth = 0 }) {
    const split = isSplit(block);
    const isHighlighted = highlight?.id === block.id;

    return (
        <motion.div
            layout
            initial={{
                opacity: 0,
                scale: 0.95,
            }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
            className={`relative m-1 rounded border p-2 text-center font-mono text-xs shadow-md ${
                block.allocated
                    ? 'border-green-500 bg-green-900/30'
                    : 'border-gray-600 bg-gray-800/20'
            } ${isHighlighted ? 'ring-2 ring-blue-400' : ''}`}
            style={{
                minWidth: `${Math.max(65, 120 - depth * 15)}px`,
            }}
        >
            <div>{block.size} KB</div>

            <div className="text-[10px]">
                {block.allocated
                    ? `Allocated (${block.requestedSize} KB)`
                    : split
                      ? 'Split'
                      : 'Free'}
            </div>

            {isHighlighted && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -right-2 -top-2 rounded-full bg-black px-2 py-0.5 text-[10px]"
                >
                    {highlight.action}
                </motion.span>
            )}

            {split && (
                <div className="mt-2 flex justify-center gap-2">
                    <MemoryBlock
                        block={block.left}
                        highlight={highlight}
                        depth={depth + 1}
                    />

                    <MemoryBlock
                        block={block.right}
                        highlight={highlight}
                        depth={depth + 1}
                    />
                </div>
            )}
        </motion.div>
    );
}
