import { useState } from 'react';
import { useLocation } from 'react-router-dom';

function StatCard({ label, value, className }) {
    return (
        <div className={`rounded-lg border p-3 ${className}`}>
            <div className="text-sm opacity-80">{label}</div>

            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}

export default function ControlPanel({
    speed,
    setSpeed,
    isRunning,
    setIsRunning,
    processes,
    stats,
    setProcesses,
    setCurrentTime,
    setGanttChart,
    currentTime,
    animationRef,
    resetSimulation: parentResetSimulation,
}) {
    const { pathname } = useLocation();

    const [arrivalTime, setArrivalTime] = useState('');
    const [burstTime, setBurstTime] = useState('');
    const [priority, setPriority] = useState('');
    const [nextPid, setNextPid] = useState(1);

    const requiresPriority = pathname.includes('priority');

    const resetSimulation = () => {
        /*
        Use the scheduler's reset function when supplied.
        This is especially useful for Round Robin because
        CPUScheduler also resets currentIndex.
        */
        if (parentResetSimulation) {
            parentResetSimulation();
        } else {
            clearTimeout(animationRef.current);
            setIsRunning(false);
            setProcesses([]);
            setGanttChart([]);
            setCurrentTime(0);
        }

        setNextPid(1);
        setArrivalTime('');
        setBurstTime('');
        setPriority('');
    };

    const generateRandomProcess = () => {
        const randomBurstTime = Math.floor(Math.random() * 5) + 1;

        const randomPriority = Math.floor(Math.random() * 3) + 1;

        const randomArrivalTime = currentTime + Math.floor(Math.random() * 5);

        return {
            pid: nextPid,
            arrivalTime: randomArrivalTime,
            burstTime: randomBurstTime,
            priority: randomPriority,
            remainingTime: randomBurstTime,
            waitingTime: 0,
            turnaroundTime: 0,
            completionTime: null,
            isExecuting: false,
        };
    };

    const addRandomProcess = () => {
        const newProcess = generateRandomProcess();

        /*
        Each setter is called separately.
        Nothing is nested inside setProcesses().
        */
        setProcesses([...processes, newProcess]);

        setNextPid((previousPid) => previousPid + 1);
    };

    const addManualProcess = () => {
        if (
            arrivalTime === '' ||
            burstTime === '' ||
            (requiresPriority && priority === '')
        ) {
            alert('Please fill all required fields.');
            return;
        }

        const parsedArrivalTime = Number(arrivalTime);

        const parsedBurstTime = Number(burstTime);

        const parsedPriority = Number(priority || 1);

        if (!Number.isInteger(parsedArrivalTime) || parsedArrivalTime < 0) {
            alert('Arrival time must be a non-negative integer.');
            return;
        }

        if (!Number.isInteger(parsedBurstTime) || parsedBurstTime <= 0) {
            alert('Burst time must be a positive integer.');
            return;
        }

        if (
            requiresPriority &&
            (!Number.isInteger(parsedPriority) || parsedPriority <= 0)
        ) {
            alert('Priority must be a positive integer.');
            return;
        }

        const newProcess = {
            pid: nextPid,
            arrivalTime: parsedArrivalTime,
            burstTime: parsedBurstTime,
            priority: parsedPriority,
            remainingTime: parsedBurstTime,
            waitingTime: 0,
            turnaroundTime: 0,
            completionTime: null,
            isExecuting: false,
        };

        setProcesses([...processes, newProcess]);

        setNextPid((previousPid) => previousPid + 1);

        setArrivalTime('');
        setBurstTime('');
        setPriority('');
    };

    return (
        <div className="lg:max-w-[500px] space-y-6 rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-xl w-full h-fit flex flex-col items-center">
            {/* Controls */}
            <div className="w-fit lg:w-full h-fit rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-6">
                    <h2 className="flex items-center text-xl font-semibold text-gray-100">
                        <svg
                            className="mr-2 h-5 w-5 text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Control Panel
                    </h2>

                    <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-400">
                            Speed:
                        </span>

                        <select
                            value={speed}
                            disabled={isRunning}
                            onChange={(event) =>
                                setSpeed(Number(event.target.value))
                            }
                            className="cursor-pointer rounded-md border bg-gray-700 px-2 py-1 text-sm text-gray-100 disabled:opacity-50"
                        >
                            <option value={0.25}>0.25x</option>
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={3}>3x</option>
                        </select>
                    </div>
                </div>

                <div className="mb-0.5 flex flex-col justify-evenly gap-3 lg:flex-row">
                    <button
                        onClick={() => setIsRunning((previous) => !previous)}
                        disabled={processes.length === 0}
                        className={`flex h-[40px] w-full cursor-pointer items-center justify-center rounded-lg font-medium text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${
                            isRunning
                                ? 'bg-gradient-to-r from-red-600 to-red-700'
                                : 'bg-gradient-to-r from-green-600 to-green-700'
                        }`}
                    >
                        {isRunning ? 'Pause' : 'Start'}
                    </button>

                    <button
                        onClick={resetSimulation}
                        className="flex h-[40px] w-full cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 font-medium text-white shadow-md hover:from-gray-700 hover:to-gray-800 hover:shadow-lg"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="w-full sm:flex space-y-6 sm:space-y-0 gap-6 lg:flex-col">
                {/* Process creation */}
                <div className="w-full h-fit rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-sm">
                    <h3 className="mb-3 text-lg font-medium text-gray-100">
                        Process Generation
                    </h3>

                    <div className="mb-3 h-fit rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-sm">
                        <h3 className="mb-3 text-lg font-medium text-gray-100">
                            Manual Process Creation
                        </h3>

                        <div className="mb-4 flex flex-col gap-3">
                            <label
                                htmlFor="arrival-time"
                                className="text-sm font-medium text-gray-300"
                            >
                                Arrival Time
                            </label>

                            <input
                                id="arrival-time"
                                type="number"
                                min="0"
                                value={arrivalTime}
                                disabled={isRunning}
                                onChange={(event) =>
                                    setArrivalTime(event.target.value)
                                }
                                placeholder="Arrival Time"
                                className="rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            />

                            <label
                                htmlFor="burst-time"
                                className="text-sm font-medium text-gray-300"
                            >
                                Burst Time
                            </label>

                            <input
                                id="burst-time"
                                type="number"
                                min="1"
                                value={burstTime}
                                disabled={isRunning}
                                onChange={(event) =>
                                    setBurstTime(event.target.value)
                                }
                                placeholder="Burst Time"
                                className="rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            />

                            {requiresPriority && (
                                <>
                                    <label
                                        htmlFor="priority"
                                        className="text-sm font-medium text-gray-300"
                                    >
                                        Priority
                                    </label>

                                    <input
                                        id="priority"
                                        type="number"
                                        min="1"
                                        value={priority}
                                        disabled={isRunning}
                                        onChange={(event) =>
                                            setPriority(event.target.value)
                                        }
                                        placeholder="Priority"
                                        className="rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    />
                                </>
                            )}
                        </div>

                        <button
                            onClick={addManualProcess}
                            disabled={isRunning}
                            className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 py-2 font-medium text-white shadow-md hover:from-purple-700 hover:to-purple-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Add Manual Process
                        </button>
                    </div>

                    <button
                        onClick={addRandomProcess}
                        disabled={isRunning}
                        className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2 font-medium text-white shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Add Random Process
                    </button>
                </div>

                {/* Statistics */}
                <div className="w-full mb- h-fit rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-sm sm:h-full lg:h-fit">
                    <h3 className="mb-3 text-lg font-medium text-gray-100">
                        Simulation Time:{' '}
                        <span className="ml-2 text-blue-400">
                            {currentTime}s
                        </span>
                    </h3>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <StatCard
                            label="Total Processes"
                            value={stats.totalProcesses}
                            className="border-blue-600 bg-blue-800 text-blue-400"
                        />

                        <StatCard
                            label="Completed"
                            value={stats.completedProcesses}
                            className="border-green-600 bg-green-800 text-green-400"
                        />

                        <StatCard
                            label="Avg Wait Time"
                            value={`${stats.avgWaitTime}s`}
                            className="border-yellow-600 bg-yellow-800 text-yellow-400"
                        />

                        <StatCard
                            label="Avg Turnaround"
                            value={`${stats.avgTurnaroundTime}s`}
                            className="border-purple-600 bg-purple-800 text-purple-400"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
