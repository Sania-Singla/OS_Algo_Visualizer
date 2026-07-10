import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PagingModule, ThrashingModule } from '../../components';

const createInitialState = () => ({
    physicalMemory: Array(8).fill(null),
    pageTable: {},
    disk: Array(128).fill(null),
    processes: [],
    nextPid: 1,
});

const moduleConfig = {
    paging: {
        label: 'Paging',
        component: PagingModule,
    },
    thrashing: {
        label: 'Thrashing',
        component: ThrashingModule,
    },
};

export default function MemoryVisualizer() {
    const [activeModule, setActiveModule] = useState('paging');

    const [memoryState, setMemoryState] = useState(createInitialState);

    const [highlightedItem, setHighlightedItem] = useState(null);

    const highlightTimerRef = useRef(null);

    const highlightItem = useCallback((item, duration = 1500) => {
        clearTimeout(highlightTimerRef.current);

        setHighlightedItem(item);

        if (item) {
            highlightTimerRef.current = setTimeout(() => {
                setHighlightedItem(null);
            }, duration);
        }
    }, []);

    /*
    onCreated is optional.

    PagingModule:
        createProcess();

    ThrashingModule:
        createProcess((pid) => highlight the new process);
    */
    const createProcess = useCallback((onCreated) => {
        setMemoryState((previous) => {
            const pid = previous.nextPid;

            // Random value from 2 to 4
            const pageCount = Math.floor(Math.random() * 3) + 2;

            const newPages = {};

            for (let pageNumber = 0; pageNumber < pageCount; pageNumber++) {
                const vpn = `${pid}-${pageNumber}`;

                newPages[vpn] = {
                    present: false,
                    ppn: null,
                    referenced: false,
                    modified: false,
                };
            }

            onCreated?.(pid);

            return {
                ...previous,

                processes: [
                    ...previous.processes,
                    {
                        pid,
                        pageCount,
                    },
                ],

                pageTable: {
                    ...previous.pageTable,
                    ...newPages,
                },

                nextPid: pid + 1,
            };
        });
    }, []);

    const killProcess = useCallback(
        (pid) => {
            setMemoryState((previous) => {
                const pageTable = {
                    ...previous.pageTable,
                };

                const physicalMemory = [...previous.physicalMemory];

                Object.keys(pageTable).forEach((vpn) => {
                    if (!vpn.startsWith(`${pid}-`)) {
                        return;
                    }

                    const entry = pageTable[vpn];

                    if (entry.present && entry.ppn !== null) {
                        physicalMemory[entry.ppn] = null;
                    }

                    delete pageTable[vpn];
                });

                return {
                    ...previous,

                    processes: previous.processes.filter(
                        (process) => process.pid !== pid
                    ),

                    pageTable,
                    physicalMemory,
                };
            });

            highlightItem(
                {
                    type: 'process-remove',
                    id: pid,
                },
                1000
            );
        },
        [highlightItem]
    );

    const resetSimulation = () => {
        clearTimeout(highlightTimerRef.current);

        setMemoryState(createInitialState());
        setHighlightedItem(null);
    };

    const sharedActions = useMemo(
        () => ({
            createProcess,
            killProcess,
            highlightItem,
        }),
        [createProcess, killProcess, highlightItem]
    );

    const ActiveComponent = moduleConfig[activeModule].component;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
            <motion.header
                initial={{
                    opacity: 0,
                    y: -20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="mb-6"
            >
                <h1 className="my-3 pb-6 text-center text-3xl font-bold text-purple-400">
                    Linux Memory Management Visualizer
                </h1>

                <nav className="mx-auto mt-4 flex max-w-4xl flex-col items-center justify-center gap-4 sm:flex-row">
                    {Object.entries(moduleConfig).map(
                        ([moduleName, module]) => (
                            <motion.button
                                key={moduleName}
                                whileHover={{
                                    scale: 1.04,
                                }}
                                whileTap={{
                                    scale: 0.96,
                                }}
                                onClick={() => setActiveModule(moduleName)}
                                className={`w-full rounded-md px-8 py-2 font-semibold transition-colors ${
                                    activeModule === moduleName
                                        ? 'border-2 border-yellow-500 bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                }`}
                            >
                                {module.label}
                            </motion.button>
                        )
                    )}

                    <motion.button
                        whileHover={{
                            scale: 1.04,
                        }}
                        whileTap={{
                            scale: 0.96,
                        }}
                        onClick={resetSimulation}
                        className="w-full rounded-md bg-red-500 px-8 py-2 font-semibold text-white hover:bg-red-600"
                    >
                        Reset
                    </motion.button>
                </nav>
            </motion.header>

            <main className="rounded-lg shadow-lg">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeModule}
                        initial={{
                            opacity: 0,
                            x: 20,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        exit={{
                            opacity: 0,
                            x: -20,
                        }}
                        transition={{
                            duration: 0.3,
                        }}
                    >
                        <ActiveComponent
                            state={memoryState}
                            setState={setMemoryState}
                            sharedActions={sharedActions}
                            highlightedItem={highlightedItem}
                        />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
