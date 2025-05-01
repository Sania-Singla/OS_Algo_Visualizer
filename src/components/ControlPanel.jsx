import { useState } from 'react';
import { useLocation } from 'react-router-dom';

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
    const { pathname } = useLocation();
    const [arrivalTime, setArrivalTime] = useState('');
    const [burstTime, setBurstTime] = useState('');
    const [priority, setPriority] = useState('');
    const [nextPid, setNextPid] = useState(
        processes.length > 0 ? Math.max(...processes.map((p) => p.pid)) + 1 : 1
    );

    const resetSimulation = () => {
        setIsRunning(false);
        clearTimeout(animationRef.current);
        setProcesses([]);
        setGanttChart([]);
        setCurrentTime(0);
        setStats({
            totalProcesses: processes.length,
            completedProcesses: 0,
            avgWaitTime: 0,
            avgTurnaroundTime: 0,
        });
        setNextPid(1);
    };

    const generateRandomProcess = (currentTime, nextPid) => {
        const burstTime = Math.floor(Math.random() * 5) + 1; // 1-5
        const priority = Math.floor(Math.random() * 3) + 1; // 1-3
        const arrivalTime = currentTime + Math.floor(Math.random() * 5);

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
        setProcesses((prevProcesses) => {
            const newProcess = generateRandomProcess(currentTime, nextPid);
            const updatedProcesses = [...prevProcesses, newProcess];

            setStats((prevStats) => ({
                ...prevStats,
                totalProcesses: updatedProcesses.length,
            }));

            setNextPid((prevPid) => prevPid + 1);
            return updatedProcesses;
        });
    };

    const addManualProcess = () => {
        if (arrivalTime === '' || burstTime === '') {
            if (pathname.includes('priority') && priority === '') {
                alert('Please fill all fields.');
                return;
            }
        }

        const newProcess = {
            pid: nextPid,
            arrivalTime: parseInt(arrivalTime),
            burstTime: parseInt(burstTime),
            priority: parseInt(priority || 1),
            remainingTime: parseInt(burstTime),
            waitingTime: 0,
            isExecuting: false,
        };

        setProcesses((prevProcesses) => {
            const updatedProcesses = [...prevProcesses, newProcess];

            setStats((prevStats) => ({
                ...prevStats,
                totalProcesses: updatedProcesses.length,
            }));

            setNextPid((prevPid) => prevPid + 1);

            console.log(newProcess);
            return updatedProcesses;
        });

        // Reset form
        setArrivalTime('');
        setBurstTime('');
        setPriority('');
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 space-y-6 lg:block w-full lg:w-1/3 bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-700">
            {/* Control Panel */}
            <div className="h-fit sm:h-full lg:h-fit bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
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
                            className="cursor-pointer text-sm border rounded-md px-2 py-1 bg-gray-700 text-gray-100"
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
                        className={`cursor-pointer w-full text-white font-medium shadow-md hover:shadow-lg rounded-lg h-[40px] flex items-center justify-center transition-all
                        ${isRunning ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-green-600 to-green-700'}`}
                    >
                        <svg
                            className={isRunning ? 'size-5 mr-2' : 'size-11'}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isRunning ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
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
                        className="cursor-pointer w-full h-[40px] bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg text-white font-medium shadow-md hover:shadow-lg flex items-center justify-center"
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

            <div className="h-fit sm:h-full lg:h-fit bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
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

                <div className="h-fit mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
                    <h3 className="font-medium text-lg mb-3 flex items-center text-gray-100">
                        Manual Process Creation
                    </h3>

                    <div className="flex flex-col gap-3 mb-4">
                        <label
                            className="text-gray-300 text-sm font-medium"
                            htmlFor="arrival-time"
                        >
                            Arrival Time
                        </label>
                        <input
                            id="arrival-time"
                            type="number"
                            placeholder="Arrival Time"
                            value={arrivalTime}
                            onChange={(e) => setArrivalTime(e.target.value)}
                            className="px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <label
                            className="text-gray-300 text-sm font-medium"
                            htmlFor="burst-time"
                        >
                            Burst Time
                        </label>
                        <input
                            id="burst-time"
                            type="number"
                            placeholder="Burst Time"
                            value={burstTime}
                            onChange={(e) => setBurstTime(e.target.value)}
                            className="px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <label
                            className="text-gray-300 text-sm font-medium"
                            htmlFor="priority"
                        >
                            Priority
                        </label>
                        <input
                            id="priority"
                            type="number"
                            placeholder="Priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={addManualProcess}
                        className="cursor-pointer w-full mb-3 mt-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-white font-medium shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                        Add Manual Process
                    </button>
                </div>
                <button
                    onClick={addRandomProcess}
                    className="cursor-pointer w-full mb-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-white font-medium shadow-md hover:shadow-lg flex items-center justify-center"
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
        </div>
    );
}
