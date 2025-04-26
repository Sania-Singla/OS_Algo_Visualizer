import { useRef, useState, useEffect } from 'react';
import { PROCESSES } from '../../constants/processes';

export default function ControlPanel({
    speed,
    setSpeed,
    isRunning,
    setIsRunning,
    processes,
    stats,
    setStats,
    setProcesses,
    setCurrentTime,
    setGanttChart,
    currentTime,
    animationRef,
}) {
    const [autoGenerate, setAutoGenerate] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(5);
    const [nextPid, setNextPid] = useState(
        Math.max(...PROCESSES.map((p) => p.pid)) + 1
    );
    const autoGenRef = useRef();

    const resetSimulation = () => {
        setIsRunning(false);
        setAutoGenerate(false);
        clearTimeout(animationRef.current);
        clearTimeout(autoGenRef.current); // Clear auto-generation timeout
        setProcesses(PROCESSES.map((p) => ({ ...p, isExecuting: false })));
        setGanttChart([]);
        setCurrentTime(0);
        setStats({
            totalProcesses: PROCESSES.length,
            completedProcesses: 0,
            avgWaitTime: 0,
            avgTurnaroundTime: 0,
        });
        setNextPid(Math.max(...processes.map((p) => p.pid)) + 1);
    };

    const generateRandomProcess = () => {
        const burstTime = Math.floor(Math.random() * 5) + 1; // 1-5
        const priority = Math.floor(Math.random() * 3) + 1; // 1-3
        const arrivalTime = currentTime + Math.floor(Math.random() * 3); // Current time to +2

        return {
            pid: nextPid,
            arrivalTime,
            burstTime,
            priority,
            remainingTime: burstTime,
            waitingTime: 0,
            isExecuting: false,
        };
    };

    const addRandomProcess = () => {
        const newProcess = generateRandomProcess();
        setProcesses((prev) => [...prev, newProcess]);
        setStats((prev) => ({
            ...prev,
            totalProcesses: prev.totalProcesses + 1,
        }));
        setNextPid(Math.max(...processes.map((p) => p.pid)) + 1);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:block gap-4 w-full lg:w-1/3 bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-700">
            {/* Control Panel */}
            <div className="h-fit sm:h-full lg:h-fit mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-100 flex items-center">
                        <svg
                            className="w-5 h-5 mr-2 text-blue-400"
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
                        <span className="text-sm mr-2 text-gray-400">
                            Speed:
                        </span>
                        <select
                            value={speed}
                            onChange={(e) =>
                                setSpeed(parseFloat(e.target.value))
                            }
                            className="text-sm border rounded-md px-2 py-1 bg-gray-700 text-gray-100"
                        >
                            <option value={0.25}>0.25x</option>
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={3}>3x</option>
                        </select>
                    </div>
                </div>

                {/* Start/Pause & Reset */}
                <div className="flex gap-3 mb-6 justify-evenly flex-col lg:flex-row">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`w-full text-white font-medium shadow-md hover:shadow-lg rounded-lg h-[50px] flex items-center justify-center transition-all
                        ${isRunning ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-green-600 to-green-700'}`}
                    >
                        <svg
                            className="size-11"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isRunning ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                />
                            )}
                        </svg>
                        {isRunning ? 'Pause' : 'Start'}
                    </button>
                    <button
                        onClick={resetSimulation}
                        className="w-full h-[50px] bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg text-white font-medium shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                        <svg
                            className="size-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Reset
                    </button>
                </div>
            </div>

            <div className="h-fit sm:h-full lg:h-fit mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
                <h3 className="font-medium text-lg mb-3 flex items-center text-gray-100">
                    <svg
                        className="w-5 h-5 mr-2 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Process Generation
                </h3>

                <button
                    onClick={addRandomProcess}
                    className="w-full mb-3 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-white font-medium shadow-md hover:shadow-lg flex items-center justify-center"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    Add Random Process
                </button>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={autoGenerate}
                                onChange={() => setAutoGenerate(!autoGenerate)}
                            />
                            <div
                                className={`block w-10 h-6 rounded-full ${autoGenerate ? 'bg-blue-600' : 'bg-gray-600'}`}
                            ></div>
                            <div
                                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${autoGenerate ? 'transform translate-x-4' : ''}`}
                            ></div>
                        </div>
                        <div className="ml-3 text-sm font-medium text-gray-300">
                            Auto Generate
                        </div>
                    </label>

                    {autoGenerate && (
                        <div className="flex items-center">
                            <span className="text-sm mr-2 text-gray-400">
                                Every:
                            </span>
                            <select
                                value={autoGenerateInterval}
                                onChange={(e) =>
                                    setAutoGenerateInterval(
                                        parseInt(e.target.value)
                                    )
                                }
                                className="text-sm border rounded-md px-2 py-1 bg-gray-700 text-gray-100"
                            >
                                <option value={3}>3s</option>
                                <option value={5}>5s</option>
                                <option value={8}>8s</option>
                                <option value={10}>10s</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-fit sm:h-full lg:h-fit mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
                <h3 className="font-medium text-lg mb-3 flex items-center text-gray-100">
                    <svg
                        className="w-5 h-5 mr-2 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    Simulation Time:{' '}
                    <span className="ml-2 text-blue-600">{currentTime}s</span>
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="bg-blue-800 p-3 rounded-lg border border-blue-600">
                        <div className="text-sm text-blue-300">
                            Total Processes
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                            {stats.totalProcesses}
                        </div>
                    </div>
                    <div className="bg-green-800 p-3 rounded-lg border border-green-600">
                        <div className="text-sm text-green-300">Completed</div>
                        <div className="text-2xl font-bold text-green-400">
                            {stats.completedProcesses}
                        </div>
                    </div>
                    <div className="bg-yellow-800 p-3 rounded-lg border border-yellow-600">
                        <div className="text-sm text-yellow-300">
                            Avg Wait Time
                        </div>
                        <div className="text-2xl font-bold text-yellow-400">
                            {stats.avgWaitTime}s
                        </div>
                    </div>
                    <div className="bg-purple-800 p-3 rounded-lg border border-purple-600">
                        <div className="text-sm text-purple-300">
                            Avg Turnaround
                        </div>
                        <div className="text-2xl font-bold text-purple-400">
                            {stats.avgTurnaroundTime}s
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-fit sm:h-full lg:h-fit bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
                <h3 className="font-medium text-lg mb-3 text-gray-100">
                    Active Processes
                </h3>
                <div className="space-y-2">
                    {processes.length > 0 && isRunning ? (
                        processes
                            .filter((p) => p.remainingTime > 0)
                            .map((p) => (
                                <div
                                    key={p.pid}
                                    className={`flex justify-between items-center p-3 rounded-lg border transition-all
                                        ${p.isExecuting ? 'border-blue-500 bg-blue-900' : 'border-gray-700'}`}
                                >
                                    <span
                                        className={`font-medium ${p.isExecuting ? 'text-blue-400' : 'text-gray-300'}`}
                                    >
                                        P{p.pid}
                                    </span>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-400">
                                            <span className="font-medium">
                                                RT:
                                            </span>{' '}
                                            {p.remainingTime}/{p.burstTime}
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            <span className="font-medium">
                                                WT:
                                            </span>{' '}
                                            {p.waitingTime}
                                        </span>
                                        {p.isExecuting && (
                                            <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                                        )}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p className="text-gray-500">No active processes</p>
                    )}
                </div>
            </div>
        </div>
    );
}
