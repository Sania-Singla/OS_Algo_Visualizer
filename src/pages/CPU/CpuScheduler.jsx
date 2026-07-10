import { useEffect, useRef, useState } from 'react';
import { ControlPanel, VisualizationArea } from '../../components';
import { AIExplainButton } from '../../components';

const initialStats = {
    totalProcesses: 0,
    completedProcesses: 0,
    avgWaitTime: 0,
    avgTurnaroundTime: 0,
};

const schedulerDetails = {
    FCFS: {
        title: 'First Come, First Serve Scheduling',
        description: 'Processes execute in their order of arrival.',
    },
    SJF: {
        title: 'Shortest Job First (Non-Preemptive) Scheduling',
        description: 'The arrived process with the shortest burst runs first.',
    },
    SRTF: {
        title: 'Shortest Remaining Time First Scheduling',
        description:
            'The process with the shortest remaining time executes next.',
    },
    PRIORITY: {
        title: 'Higher Priority First (Non-Preemptive) Scheduling',
        description:
            'The highest-priority arrived process runs until completion.',
    },
    PRIORITY_PREEMPTIVE: {
        title: 'Priority (Preemptive) Scheduling',
        description:
            'A higher-priority process can preempt the currently running process.',
    },
    ROUND_ROBIN: {
        title: 'Round Robin Scheduling',
        description: 'Each process receives a fixed amount of CPU time.',
    },
};

function appendGanttSegment(previousSegments, newSegment) {
    const lastSegment = previousSegments[previousSegments.length - 1];

    if (!lastSegment) {
        return [newSegment];
    }

    const sameProcess =
        !lastSegment.isIdle &&
        !newSegment.isIdle &&
        lastSegment.pid === newSegment.pid;

    const bothIdle = lastSegment.isIdle && newSegment.isIdle;

    const segmentsTouch = lastSegment.end === newSegment.start;

    /*
    Merge consecutive units of the same process.

    For example:
    P1: 0-1, P1: 1-2, P1: 2-3
    becomes:
    P1: 0-3
    */
    if (segmentsTouch && (sameProcess || bothIdle)) {
        return [
            ...previousSegments.slice(0, -1),
            {
                ...lastSegment,
                end: newSegment.end,
            },
        ];
    }

    return [...previousSegments, newSegment];
}

export function CPUScheduler({ algoType, algorithm, usesQuantum = false }) {
    const [processes, setProcesses] = useState([]);
    const [ganttChart, setGanttChart] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(1);

    // Mainly required by Round Robin
    const [quantum, setQuantum] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [stats, setStats] = useState(initialStats);

    const animationRef = useRef(null);

    const updateStats = (updatedProcesses) => {
        const completedProcesses = updatedProcesses.filter(
            (process) => process.remainingTime === 0
        );

        const completedCount = completedProcesses.length;

        if (completedCount === 0) {
            setStats({
                ...initialStats,
                totalProcesses: updatedProcesses.length,
            });
            return;
        }

        const totalWaitingTime = completedProcesses.reduce(
            (sum, process) => sum + process.waitingTime,
            0
        );

        const totalTurnaroundTime = completedProcesses.reduce(
            (sum, process) => sum + process.turnaroundTime,
            0
        );

        setStats({
            totalProcesses: updatedProcesses.length,
            completedProcesses: completedCount,
            avgWaitTime: Number((totalWaitingTime / completedCount).toFixed(2)),
            avgTurnaroundTime: Number(
                (totalTurnaroundTime / completedCount).toFixed(2)
            ),
        });
    };

    const executeScheduler = () => {
        if (processes.length === 0) {
            setIsRunning(false);
            return;
        }

        const allCompleted = processes.every(
            (process) => process.remainingTime === 0
        );

        if (allCompleted) {
            setIsRunning(false);
            updateStats(processes);
            return;
        }

        const arrivedProcesses = processes.filter(
            (process) =>
                process.arrivalTime <= currentTime && process.remainingTime > 0
        );

        if (arrivedProcesses.length === 0) {
            const idleSegment = {
                start: currentTime,
                end: currentTime + 1,
                isIdle: true,
            };

            setGanttChart((previous) =>
                appendGanttSegment(previous, idleSegment)
            );

            setCurrentTime((previous) => previous + 1);
            return;
        }

        const result = algorithm({
            processes,
            arrivedProcesses,
            currentTime,
            currentIndex,
            quantum,
        });

        if (!result?.process) {
            setCurrentTime((previous) => previous + 1);
            return;
        }

        const { process: selectedProcess, executionTime, nextIndex } = result;

        const endTime = currentTime + executionTime;

        const newProcesses = processes.map((process) => {
            if (process.pid === selectedProcess.pid) {
                const newRemainingTime = Math.max(
                    0,
                    process.remainingTime - executionTime
                );

                if (newRemainingTime === 0) {
                    const completionTime = endTime;
                    const turnaroundTime = completionTime - process.arrivalTime;
                    const waitingTime = turnaroundTime - process.burstTime;

                    return {
                        ...process,
                        remainingTime: 0,
                        completionTime,
                        turnaroundTime,
                        waitingTime,
                    };
                }

                return {
                    ...process,
                    remainingTime: newRemainingTime,
                };
            }

            /*
            A process may arrive while a non-preemptive process is
            executing.

            Example:
            Current process runs from time 2 to 7.
            Another process arrives at time 5.

            It waits for 7 - 5 = 2 units, not the full 5 units.
            */
            if (process.remainingTime > 0) {
                const waitingStart = Math.max(currentTime, process.arrivalTime);

                const additionalWaitingTime = Math.max(
                    0,
                    endTime - waitingStart
                );

                return {
                    ...process,
                    waitingTime:
                        (process.waitingTime ?? 0) + additionalWaitingTime,
                };
            }

            return process;
        });

        const ganttSegment = {
            pid: selectedProcess.pid,
            start: currentTime,
            end: endTime,
            isIdle: false,
        };

        setGanttChart((previous) => appendGanttSegment(previous, ganttSegment));

        setProcesses(newProcesses);
        setCurrentTime(endTime);

        if (typeof nextIndex === 'number') {
            setCurrentIndex(nextIndex);
        }

        updateStats(newProcesses);

        const simulationCompleted = newProcesses.every(
            (process) => process.remainingTime === 0
        );

        if (simulationCompleted) {
            setIsRunning(false);
        }
    };

    const resetSimulation = () => {
        clearTimeout(animationRef.current);

        setIsRunning(false);
        setProcesses([]);
        setGanttChart([]);
        setCurrentTime(0);
        setCurrentIndex(0);

        setStats(initialStats);
    };

    useEffect(() => {
        if (isRunning) {
            animationRef.current = setTimeout(executeScheduler, 1000 / speed);
        }

        return () => {
            clearTimeout(animationRef.current);
        };
    }, [
        isRunning,
        currentTime,
        processes,
        speed,
        quantum,
        currentIndex,
        algorithm,
    ]);

    useEffect(() => {
        setStats((previous) => ({
            ...previous,
            totalProcesses: processes.length,
        }));
    }, [processes.length]);

    const details = schedulerDetails[algoType];

    return (
        <div className="px-6 md:px-10 py-8 min-h-screen bg-gray-900 text-gray-200">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    {details?.title ?? algoType}
                    {usesQuantum && ` (Quantum: ${quantum})`}
                </h1>

                <p className="text-gray-400">{details?.description}</p>
            </div>

            {usesQuantum && (
                <div className="items-center lg:absolute lg:top-10 lg:right-6 flex flex-col gap-1">
                    <label
                        className="text-gray-300 text-lg font-medium"
                        htmlFor="quantum-size"
                    >
                        Quantum Size
                    </label>

                    <input
                        id="quantum-size"
                        type="number"
                        min="1"
                        value={quantum}
                        disabled={isRunning}
                        onChange={(event) => {
                            const value = Number.parseInt(
                                event.target.value,
                                10
                            );

                            setQuantum(
                                Number.isNaN(value) ? 1 : Math.max(1, value)
                            );
                        }}
                        className="w-32 px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                </div>
            )}

            <div
                className={`flex flex-col lg:flex-row gap-8 ${
                    usesQuantum ? 'mt-16' : ''
                }`}
            >
                <ControlPanel
                    speed={speed}
                    setSpeed={setSpeed}
                    isRunning={isRunning}
                    setIsRunning={setIsRunning}
                    processes={processes}
                    stats={stats}
                    setProcesses={setProcesses}
                    setCurrentTime={setCurrentTime}
                    setGanttChart={setGanttChart}
                    currentTime={currentTime}
                    animationRef={animationRef}
                    resetSimulation={resetSimulation}
                />

                <div className="w-full">
                    <VisualizationArea
                        ganttChart={ganttChart}
                        processes={processes}
                        currentTime={currentTime}
                    />

                    <AIExplainButton
                        algorithm={algorithm}
                        processes={processes}
                        result={ganttChart}
                    />
                </div>
            </div>
        </div>
    );
}
