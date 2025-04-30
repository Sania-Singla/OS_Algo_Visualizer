import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BuddyModule() {
  const minBlockSize = 1;
  const maxBlockSize = 128;

  const [tree, setTree] = useState(() => ({
    id: 'root',
    size: maxBlockSize,
    isSplit: false,
    allocated: false,
    parent: null,
    left: null,
    right: null,
  }));
  const [requestSize, setRequestSize] = useState(minBlockSize);
  const [manualSize, setManualSize] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [highlightedBlock, setHighlightedBlock] = useState(null);

  const deepClone = (obj, map = new WeakMap()) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (map.has(obj)) return map.get(obj);
    const clone = Array.isArray(obj) ? [] : {};
    map.set(obj, clone);
    Object.keys(obj).forEach(key => {
      clone[key] = deepClone(obj[key], map);
    });
    return clone;
  };

  const findBlock = (node, size) => {
    if (!node) return null;
    if (node.isSplit) {
      return findBlock(node.left, size) || findBlock(node.right, size);
    } else {
      if (!node.allocated && node.size >= size) return node;
      return null;
    }
  };

  const allocateMemory = (size) => {
    if (size < minBlockSize || size > maxBlockSize) {
      alert(`Size must be between ${minBlockSize} and ${maxBlockSize}`);
      return;
    }

    const newTree = deepClone(tree);
    let block = findBlock(newTree, size);

    if (!block) {
      alert('Not enough contiguous free memory for this request');
      return;
    }

    setHighlightedBlock({ id: block.id, action: 'splitting' });

    setTimeout(() => {
      const splitAndAllocate = (block, size) => {
        while (block.size / 2 >= size) {
          block.isSplit = true;
          block.left = {
            id: `${block.id}-left`,
            size: block.size / 2,
            isSplit: false,
            allocated: false,
            parent: block,
            left: null,
            right: null,
          };
          block.right = {
            id: `${block.id}-right`,
            size: block.size / 2,
            isSplit: false,
            allocated: false,
            parent: block,
            left: null,
            right: null,
          };
          setHighlightedBlock({ id: block.left.id, action: 'splitting' });
          block = block.left;
        }
        block.allocated = true;
        setHighlightedBlock({ id: block.id, action: 'allocated' });
        const allocId = `alloc-${Date.now()}`;
        setAllocations(prev => [...prev, { id: allocId, size: block.size, blockId: block.id }]);
        return block;
      };

      splitAndAllocate(block, size);
      setTree(newTree);
    }, 500);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const size = Number(manualSize);
    if (!isNaN(size)) allocateMemory(size);
  };

  const freeMemory = (allocId) => {
    const allocation = allocations.find(a => a.id === allocId);
    if (!allocation) return;
    const newTree = deepClone(tree);
    const block = findBlockById(newTree, allocation.blockId);
    if (block) {
      setHighlightedBlock({ id: block.id, action: 'freeing' });
      setTimeout(() => {
        block.allocated = false;
        const tryMerge = (node) => {
          if (!node.parent) return;
          const parent = node.parent;
          const buddy = parent.left === node ? parent.right : parent.left;
          if (buddy && !buddy.allocated && !buddy.isSplit) {
            parent.isSplit = false;
            parent.left = null;
            parent.right = null;
            setHighlightedBlock({ id: parent.id, action: 'merged' });
            tryMerge(parent);
          }
        };
        tryMerge(block);
        setTree(newTree);
        setAllocations(prev => prev.filter(a => a.id !== allocId));
      }, 500);
    }
  };

  const findBlockById = (node, id) => {
    if (!node) return null;
    if (node.id === id) return node;
    return findBlockById(node.left, id) || findBlockById(node.right, id);
  };

  const calculateUsage = () => {
    let used = 0;
    allocations.forEach(a => used += a.size);
    return { used, percent: (used / maxBlockSize) * 100 };
  };

  const { used, percent } = calculateUsage();

  return (
    <div className="text-white bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Buddy Memory Allocator
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Allocate Memory</h2>

          <label className="block text-sm mb-2">Select Size ({requestSize} KB)</label>
          <input
            type="range"
            min={minBlockSize}
            max={maxBlockSize}
            value={requestSize}
            onChange={(e) => setRequestSize(Number(e.target.value))}
            className="w-full mb-4"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => allocateMemory(requestSize)}
            className="w-full py-2 mb-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
          >
            Allocate Memory
          </motion.button>

          <form onSubmit={handleManualSubmit} className="mb-4">
            <label className="block text-sm mb-2">Manual Size Input (KB)</label>
            <input
              type="number"
              value={manualSize}
              onChange={(e) => setManualSize(e.target.value)}
              className="w-full px-3 py-2 text-white border-gray-500 border-1 rounded mb-2"
            />
            <button
              type="submit"
              className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
            >
              Manual Allocate
            </button>
          </form>

          <h3 className="font-semibold mb-2">Active Allocations</h3>
          <AnimatePresence>
            {allocations.map((alloc) => (
              <motion.div
                key={alloc.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-between items-center p-2 bg-gray-700/50 rounded mb-2"
              >
                <span className="text-sm">{alloc.size} KB</span>
                <button
                  onClick={() => freeMemory(alloc.id)}
                  className="text-red-400 hover:text-red-300 text-xs px-2"
                >
                  Free
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="md:col-span-1 lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Memory Tree</h2>
            <div className="text-sm">Used: {used} KB / {maxBlockSize} KB</div>
          </div>
          <div className="h-3 w-full bg-gray-700 rounded-full mb-4">
            <div
              className="h-3 bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="overflow-x-auto">
            {renderBlock(tree)}
          </div>
        </div>
      </div>
    </div>
  );

  function renderBlock(block, depth = 0) {
    if (!block) return null;
    const isHighlighted = highlightedBlock?.id === block.id;
    const highlightColor = {
      splitting: 'bg-blue-500/30',
      allocated: 'bg-green-500/30',
      freeing: 'bg-red-500/30',
      merged: 'bg-purple-500/30',
    }[highlightedBlock?.action] || '';

    return (
      <motion.div
        key={block.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`p-2 m-1 rounded border text-center text-xs font-mono shadow-md ${
          block.allocated ? 'border-green-500 bg-green-900/30' : 'border-gray-600 bg-gray-800/20'
        } ${isHighlighted ? highlightColor : ''}`}
        style={{ minWidth: `${Math.max(60, 120 - depth * 20)}px` }}
      >
        <div>{block.size} KB</div>
        <div className="text-[10px]">
          {block.allocated ? 'Allocated' : 'Free'}
        </div>
        {isHighlighted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-2 -right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full"
          >
            {highlightedBlock.action}
          </motion.div>
        )}
        {block.isSplit && (
          <div className="flex justify-center gap-2 mt-2">
            {renderBlock(block.left, depth + 1)}
            {renderBlock(block.right, depth + 1)}
          </div>
        )}
      </motion.div>
    );
  }
}
