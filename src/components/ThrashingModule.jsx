import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ThrashingModule({
    state,
    sharedActions,
    highlightedItem,
}) {
    const [thrashing, setThrashing] =
        useState(false);

    const previousThrashingRef = useRef(false);

    const pageDemand = useMemo(
        () =>
            state.processes.reduce(
                (total, process) =>
                    total + process.pageCount,
                0
            ),
        [state.processes]
    );

    const physicalPageCount =
        state.physicalMemory.length;

    const utilization =
        physicalPageCount === 0
            ? 0
            : (pageDemand / physicalPageCount) * 100;

    /*
    This demo considers the system to be thrashing when
    demand is greater than 150% of physical memory.
    */
    useEffect(() => {
        const isThrashing =
            pageDemand > physicalPageCount * 1.5;

        setThrashing(isThrashing);

        if (
            previousThrashingRef.current !==
            isThrashing
        ) {
            sharedActions.highlightItem({
                type: isThrashing
                    ? 'thrashing-start'
                    : 'thrashing-end',
            });

            previousThrashingRef.current =
                isThrashing;
        }
    }, [
        pageDemand,
        physicalPageCount,
        sharedActions,
    ]);

    const handleCreateProcess = () => {
        sharedActions.createProcess((pid) => {
            sharedActions.highlightItem({
                type: 'process',
                id: pid,
            });
        });
    };

    const requiredExtraPages = Math.max(
        0,
        pageDemand - physicalPageCount
    );

    const availablePages = Math.max(
        0,
        physicalPageCount - pageDemand
    );

    return (
        <div className="rounded-lg bg-gray-900 p-4 text-white md:p-8">
            <motion.h2
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1,
                }}
                className="mb-6 text-2xl font-bold"
            >
                Thrashing Condition
            </motion.h2>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <motion.section
                    layout
                    className="rounded-lg border border-gray-700 bg-gray-800 p-5"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold">
                            Processes
                        </h3>

                        <motion.button
                            whileHover={{
                                scale: 1.05,
                            }}
                            whileTap={{
                                scale: 0.95,
                            }}
                            onClick={
                                handleCreateProcess
                            }
                            className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                        >
                            Add Process
                        </motion.button>
                    </div>

                    {state.processes.length === 0 ? (
                        <p className="text-gray-400">
                            No processes running
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            <AnimatePresence>
                                {state.processes.map(
                                    (process) => {
                                        const isNew =
                                            highlightedItem?.type ===
                                                'process' &&
                                            highlightedItem.id ===
                                                process.pid;

                                        return (
                                            <motion.li
                                                key={
                                                    process.pid
                                                }
                                                layout
                                                initial={{
                                                    opacity: 0,
                                                    y: 20,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: isNew
                                                        ? 1.04
                                                        : 1,
                                                    backgroundColor:
                                                        isNew
                                                            ? 'rgba(34, 197, 94, 0.20)'
                                                            : 'rgba(31, 41, 55, 0.60)',
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    x: -80,
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 400,
                                                    damping: 30,
                                                }}
                                                className="flex items-center justify-between rounded p-2"
                                            >
                                                <span>
                                                    PID:{' '}
                                                    {
                                                        process.pid
                                                    }{' '}
                                                    (Pages:{' '}
                                                    {
                                                        process.pageCount
                                                    }
                                                    )
                                                </span>

                                                <motion.button
                                                    whileHover={{
                                                        scale: 1.1,
                                                    }}
                                                    whileTap={{
                                                        scale: 0.9,
                                                    }}
                                                    onClick={() =>
                                                        sharedActions.killProcess(
                                                            process.pid
                                                        )
                                                    }
                                                    className="text-red-400 hover:text-red-500"
                                                >
                                                    Kill
                                                </motion.button>
                                            </motion.li>
                                        );
                                    }
                                )}
                            </AnimatePresence>
                        </ul>
                    )}
                </motion.section>

                <motion.section
                    layout
                    animate={{
                        backgroundColor: thrashing
                            ? 'rgba(127, 29, 29, 0.25)'
                            : 'rgba(31, 41, 55, 1)',
                    }}
                    className="rounded-lg border border-gray-700 p-5"
                >
                    <h3 className="mb-2 text-lg font-bold">
                        Memory Status
                    </h3>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-300">
                                Physical Pages
                            </div>

                            <div className="font-mono text-xl">
                                {
                                    physicalPageCount
                                }
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-gray-300">
                                Pages Demanded
                            </div>

                            <div className="font-mono text-xl">
                                {pageDemand}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 h-4 w-full rounded-full bg-gray-700">
                        <motion.div
                            className={`h-4 rounded-full ${
                                thrashing
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                            }`}
                            animate={{
                                width: `${Math.min(
                                    100,
                                    utilization
                                )}%`,
                            }}
                            transition={{
                                duration: 0.5,
                            }}
                        />
                    </div>

                    <div
                        className={`rounded-lg border p-3 ${
                            thrashing
                                ? 'border-red-500 bg-red-800/30'
                                : 'border-green-500 bg-green-800/30'
                        }`}
                    >
                        <div className="flex items-center font-semibold">
                            <span
                                className={
                                    thrashing
                                        ? 'text-red-400'
                                        : 'text-green-400'
                                }
                            >
                                {thrashing
                                    ? 'THRASHING DETECTED!'
                                    : 'System Normal'}
                            </span>

                            <span
                                className={`ml-2 rounded px-2 py-1 text-xs ${
                                    thrashing
                                        ? 'bg-red-500/20'
                                        : 'bg-green-500/20'
                                }`}
                            >
                                {Math.round(
                                    utilization
                                )}
                                %{' '}
                                {thrashing
                                    ? 'demand'
                                    : 'utilization'}
                            </span>
                        </div>

                        <div className="mt-1 text-sm text-gray-300">
                            {thrashing
                                ? `System needs ${requiredExtraPages} more physical pages`
                                : `${availablePages} physical pages available`}
                        </div>
                    </div>
                </motion.section>
            </div>

            <motion.section
                layout
                className="rounded-lg border bg-yellow-900/20 p-5 text-yellow-100"
            >
                <h3 className="mb-2 text-lg font-bold">
                    What is Thrashing?
                </h3>

                <p className="text-sm">
                    Thrashing happens when a system
                    spends more time moving pages
                    between memory and disk than
                    executing processes. It usually
                    occurs when the combined working
                    sets of active processes are much
                    larger than physical memory.
                </p>

                {thrashing && (
                    <motion.p
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        className="mt-2 text-sm font-medium text-red-300"
                    >
                        The system is currently
                        experiencing thrashing. Kill
                        some processes to reduce
                        memory demand.
                    </motion.p>
                )}
            </motion.section>
        </div>
    );
}