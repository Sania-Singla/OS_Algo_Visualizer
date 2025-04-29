import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OverviewModule, ProcessModule, PagingModule, BuddyModule, SlabModule, ThrashingModule } from '../../components/Memory';

// Initial state with shared memory
const initialState = {
  physicalMemory: Array(8).fill(null),
  pageTable: {},
  disk: Array(128).fill(null),
  buddyAllocator: { tree: null },
  slabAllocators: {
    task_struct: { slabs: [] },
    inode_cache: { slabs: [] }
  },
  processes: [],
  nextPid: 1,
  allocations: [],
  nextAllocId: 1,
  accessSequence: []
};

export default function MemoryVisualizer() {
  const [activeModule, setActiveModule] = useState('overview');
  const [memoryState, setMemoryState] = useState(initialState);
  const [highlightedItem, setHighlightedItem] = useState(null);

  // Reset the entire simulation
  const resetSimulation = () => {
    setMemoryState(initialState);
    initializeBuddySystem(1024);
  };

  // Shared actions that multiple components might use
  const sharedActions = {
    createProcess: () => {
      const newPid = memoryState.nextPid;
      const pageCount = Math.floor(Math.random() * 8) + 4;
      
      const newPageTable = {};
      for (let i = 0; i < pageCount; i++) {
        const vpn = `${newPid}-${i}`;
        newPageTable[vpn] = {
          present: false,
          ppn: null,
          referenced: false,
          modified: false
        };
      }
      
      setMemoryState(prev => ({
        ...prev,
        processes: [...prev.processes, { pid: newPid, pageCount }],
        pageTable: { ...prev.pageTable, ...newPageTable },
        nextPid: prev.nextPid + 1
      }));

      return newPid;
    },
    highlightItem: (item) => {
      setHighlightedItem(item);
      setTimeout(() => setHighlightedItem(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl text-center my-3 pb-6 font-bold text-purple-400">Linux Memory Management Visualizer</h1>
        <nav className="flex space-x-4 mt-4">
          {['overview', 'process', 'paging', 'buddy', 'slab', 'thrashing'].map(module => (
            <motion.button
              key={module}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveModule(module)}
              className={`px-4 py-2 rounded-md ${
                activeModule === module 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {module.charAt(0).toUpperCase() + module.slice(1)}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetSimulation}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            Reset
          </motion.button>
        </nav>
      </motion.header>

      <main className="rounded-lg shadow-lg ">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeModule === 'overview' && (
              <OverviewModule 
                state={memoryState} 
                setState={setMemoryState} 
                sharedActions={sharedActions}
                highlightedItem={highlightedItem}
              />
            )}
            {activeModule === 'process' && (
              <ProcessModule 
                state={memoryState} 
                setState={setMemoryState} 
                sharedActions={sharedActions}
                highlightedItem={highlightedItem}
              />
            )}
            {activeModule === 'paging' && (
              <PagingModule 
                state={memoryState} 
                setState={setMemoryState} 
                sharedActions={sharedActions}
                highlightedItem={highlightedItem}
              />
            )}
            {activeModule === 'buddy' && (
              <BuddyModule 
                state={memoryState} 
                setState={setMemoryState} 
                sharedActions={sharedActions}
                highlightedItem={highlightedItem}
              />
            )}
            {activeModule === 'slab' && (
              <SlabModule 
                state={memoryState} 
                setState={setMemoryState} 
                sharedActions={sharedActions}
                highlightedItem={highlightedItem}
              />
            )}
            {activeModule === 'thrashing' && (
              <ThrashingModule 
                state={memoryState} 
                setState={setMemoryState} 
                sharedActions={sharedActions}
                highlightedItem={highlightedItem}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}