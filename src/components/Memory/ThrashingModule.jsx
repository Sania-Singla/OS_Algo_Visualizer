import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ThrashingModule({ state, setState, sharedActions, highlightedItem }) {
  const [thrashing, setThrashing] = useState(false);

  const createProcess = () => {
    const newPid = sharedActions.createProcess();
    sharedActions.highlightItem({ type: 'process', id: newPid });

    const totalDemand = (state.processes.length + 1) * 8;
    if (totalDemand > state.physicalMemory.length * 1.5) {
      setThrashing(true);
      sharedActions.highlightItem({ type: 'thrashing-start' });
    }
  };

  const killProcess = (pid) => {
    setState(prev => ({
      ...prev,
      processes: prev.processes.filter(p => p.pid !== pid)
    }));

    sharedActions.highlightItem({ type: 'process-remove', id: pid });

    setTimeout(() => {
      setState(prev => {
        const newPageTable = { ...prev.pageTable };
        const newPhysicalMemory = [...prev.physicalMemory];

        Object.keys(newPageTable).forEach(vpn => {
          if (vpn.startsWith(`${pid}-`)) {
            if (newPageTable[vpn].present) {
              newPhysicalMemory[newPageTable[vpn].ppn] = null;
            }
            delete newPageTable[vpn];
          }
        });

        return {
          ...prev,
          pageTable: newPageTable,
          physicalMemory: newPhysicalMemory
        };
      });

      const totalDemand = (state.processes.length - 1) * 8;
      if (totalDemand <= state.physicalMemory.length * 1.5) {
        setThrashing(false);
        sharedActions.highlightItem({ type: 'thrashing-end' });
      }
    }, 500);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-900 text-white rounded-lg">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold mb-6"
      >
        Thrashing Condition
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Process Controls */}
        <motion.div layout className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Processes</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createProcess}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Add Process
            </motion.button>
          </div>

          {state.processes.length === 0 ? (
            <p className="text-gray-400">No processes running</p>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence>
                {state.processes.map(proc => (
                  <motion.li
                    key={proc.pid}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale:
                        highlightedItem?.type === 'process' && highlightedItem.id === proc.pid ? 1.05 : 1,
                      backgroundColor:
                        highlightedItem?.type === 'process' && highlightedItem.id === proc.pid
                          ? 'rgba(34,197,94,0.2)'
                          : highlightedItem?.type === 'process-remove' && highlightedItem.id === proc.pid
                            ? 'rgba(239,68,68,0.2)'
                            : 'rgba(31,41,55,0.6)'
                    }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="flex justify-between items-center p-2 rounded"
                  >
                    <span>PID: {proc.pid} (Pages: 8)</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => killProcess(proc.pid)}
                      className="text-red-400 hover:text-red-500"
                    >
                      Kill
                    </motion.button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.div>

        {/* Thrashing Visualization */}
        <motion.div
          layout
          className="border rounded-lg p-5"
          animate={{
            backgroundColor:
              highlightedItem?.type === 'thrashing-start' ? 'rgba(239,68,68,0.2)' :
              highlightedItem?.type === 'thrashing-end' ? 'rgba(34,197,94,0.2)' :
              thrashing ? 'rgba(239,68,68,0.1)' : 'rgba(31,41,55,1)'
          }}
        >
          <h3 className="font-bold text-lg mb-2">System Status</h3>

          <motion.div
            animate={{
              scale:
                highlightedItem?.type === 'thrashing-start' || highlightedItem?.type === 'thrashing-end' ? 1.05 : 1
            }}
            className={`p-4 rounded-lg mb-4 border ${
              thrashing ? 'bg-red-800/30 border-red-500' : 'bg-green-800/30 border-green-500'
            }`}
          >
            <div className="font-semibold">
              {thrashing ? 'THRASHING DETECTED!' : 'System Normal'}
            </div>
            <div className="text-sm mt-1 text-gray-300">
              {thrashing
                ? 'Too many processes competing for limited memory'
                : 'Adequate memory available'}
            </div>
          </motion.div>

          <div className="space-y-2 text-sm text-gray-300">
            <div>
              <span className="font-medium text-white">Physical Pages:</span> {state.physicalMemory.length}
            </div>
            <div>
              <span className="font-medium text-white">Pages Demanded:</span> {state.processes.length * 8}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
              <motion.div
                className="bg-blue-500 h-4 rounded-full"
                animate={{
                  width: `${Math.min(100, (state.processes.length * 8 / state.physicalMemory.length) * 100)}%`
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Explanation */}
      <motion.div layout className="border rounded-lg p-5 bg-yellow-900/20 text-yellow-100">
        <h3 className="font-bold mb-2 text-lg">What is Thrashing?</h3>
        <p className="text-sm">
          Thrashing occurs when the system spends more time handling page faults than executing
          actual process code. This happens when the total memory demand exceeds physical memory
          capacity, causing constant page replacement.
        </p>
        {thrashing && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm mt-2 text-red-300 font-medium"
          >
            Currently experiencing thrashing! Try terminating some processes.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
