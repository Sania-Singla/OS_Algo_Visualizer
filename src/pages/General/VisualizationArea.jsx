import { useEffect, useState } from 'react';
import { ProcessVisualization, GanttBar } from '../../pages/General';

export default function VisualizationArea({
    ganttChart,
    processes,
    currentTime,
}) {
    // Filter processes to only show those that have arrived (arrivalTime <= currentTime)
    const [arrivedProcesses, setArrivedProcesses] = useState([]);
    useEffect(() => {
        setArrivedProcesses(
            processes.filter((process) => process.arrivalTime <= currentTime)
        );
    }, [currentTime, processes]);

    return (
        <div className="w-full lg:w-2/3 space-y-6">
            {/* Process Queue Visualization */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                    <svg
                        className="w-5 h-5 mr-2 text-purple-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Process Queue (Current Time: {currentTime}s)
                </h2>
                <div className="flex flex-wrap justify-center">
                    {arrivedProcesses.length > 0 ? (
                        arrivedProcesses.map((process) => (
                            <ProcessVisualization
                                key={process.pid}
                                process={process}
                            />
                        ))
                    ) : (
                        <div className="text-gray-400 italic">
                            No processes have arrived yet
                        </div>
                    )}
                </div>
            </div>

            {/* Gantt Chart Visualization */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                    <svg
                        className="w-5 h-5 mr-2 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Execution Timeline
                </h2>
                <div className="flex items-center flex-wrap gap-3 py-4 px-2">
                    {ganttChart.length === 0 ? (
                        <div className="w-full text-center py-8 text-gray-400">
                            <svg
                                className="w-12 h-12 mx-auto mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <p>Press Start to begin the simulation</p>
                        </div>
                    ) : (
                        ganttChart.map((item, index) => (
                            <GanttBar
                                key={index}
                                pid={item.pid}
                                start={item.start}
                                end={item.end}
                                isIdle={item.isIdle}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
