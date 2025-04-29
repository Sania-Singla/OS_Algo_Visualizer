import { motion, AnimatePresence } from 'framer-motion';

export default function ProcessModule({
    state,
    setState,
    sharedActions,
    highlightedItem,
}) {
    const createProcess = () => {
        const pid = sharedActions.createProcess();
        sharedActions.highlightItem({ type: 'process', id: pid });
    };

    const terminateProcess = (pid) => {
        const process = state.processes.find((p) => p.pid === pid);
        if (!process) return;

        setState((prev) => ({
            ...prev,
            processes: prev.processes.filter((p) => p.pid !== pid),
        }));

        sharedActions.highlightItem({ type: 'process-remove', id: pid });

        setTimeout(() => {
            setState((prev) => {
                const newPageTable = { ...prev.pageTable };
                const newPhysicalMemory = [...prev.physicalMemory];

                Object.keys(newPageTable).forEach((vpn) => {
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
                    physicalMemory: newPhysicalMemory,
                };
            });
        }, 500);
    };

    return (
        <div className="text-white px-2 pb-6">
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold mb-4"
            >
                Process Creation & Virtual Memory
            </motion.h2>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createProcess}
                className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
                Create New Process (PID: {state.nextPid})
            </motion.button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Process List */}
                <motion.div
                    layout
                    className="bg-gray-800 rounded-lg p-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                >
                    <h3 className="font-bold mb-2">Processes</h3>
                    {state.processes.length === 0 ? (
                        <p className="text-gray-400">
                            No processes created yet
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            <AnimatePresence>
                                {state.processes.map((proc) => (
                                    <motion.li
                                        key={proc.pid}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            backgroundColor:
                                                highlightedItem?.type ===
                                                    'process' &&
                                                highlightedItem.id === proc.pid
                                                    ? 'rgba(34, 197, 94, 0.2)' // green highlight
                                                    : highlightedItem?.type ===
                                                            'process-remove' &&
                                                        highlightedItem.id ===
                                                            proc.pid
                                                      ? 'rgba(239, 68, 68, 0.2)' // red highlight
                                                      : 'rgba(55, 65, 81, 0.3)', // default
                                        }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 28,
                                        }}
                                        className="flex justify-between items-center p-2 rounded"
                                    >
                                        <span className="text-sm font-mono">
                                            PID: {proc.pid} &nbsp;|&nbsp; Pages:{' '}
                                            {proc.pageCount} &nbsp;|&nbsp;
                                            {(
                                                proc.pageCount * 4
                                            ).toLocaleString()}
                                            KB
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                terminateProcess(proc.pid)
                                            }
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Terminate
                                        </motion.button>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                    )}
                </motion.div>

                {/* Page Table Visualization */}
                <div className="bg-gray-800 rounded-lg p-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <h3 className="font-bold mb-3 text-lg">Page Table</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-gray-200">
                            <thead>
                                <tr className="border-b border-gray-700 text-gray-400">
                                    <th className="p-2 text-left">VPN</th>
                                    <th className="p-2 text-left">PPN</th>
                                    <th className="p-2 text-left">Present</th>
                                    <th className="p-2 text-left">
                                        Referenced
                                    </th>
                                    <th className="p-2 text-left">Modified</th>
                                    <th className="p-2 text-left">
                                        Protection
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(state.pageTable)
                                    .filter(([vpn]) =>
                                        highlightedItem?.type === 'process'
                                            ? vpn.startsWith(
                                                  `${highlightedItem.id}-`
                                              )
                                            : true
                                    )
                                    .map(([vpn, entry]) => (
                                        <motion.tr
                                            key={vpn}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-gray-700 hover:bg-gray-700/40"
                                        >
                                            <td className="p-2 font-mono text-gray-100">
                                                {vpn}
                                            </td>
                                            <td className="p-2 font-mono text-green-300">
                                                {entry.present
                                                    ? `0x${entry.ppn.toString(16).padStart(4, '0')}`
                                                    : '-'}
                                            </td>
                                            <td className="p-2">
                                                {entry.present ? '✓' : '✗'}
                                            </td>
                                            <td className="p-2">
                                                {entry.referenced ? '✓' : '✗'}
                                            </td>
                                            <td className="p-2">
                                                {entry.modified ? '✓' : '✗'}
                                            </td>
                                            <td className="p-2 text-yellow-300">
                                                rw-
                                            </td>
                                        </motion.tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
