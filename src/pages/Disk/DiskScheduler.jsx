import { useState, useEffect } from 'react';
import { DiskChart, RequestInput } from '../../components';

export default function DiskScheduler({ algorithm, algoType }) {
    const [requests, setRequests] = useState([
        98, 183, 37, 122, 14, 124, 65, 67,
    ]);
    const [head, setHead] = useState(53);
    const [totalSeek, setTotalSeek] = useState(0);
    const [headMovement, setHeadMovement] = useState([]);

    useEffect(() => {
        const result = algorithm(requests, head);
        setTotalSeek(result.totalSeek);
        setHeadMovement(result.headMovement);
    }, [requests, head]);

    return (
        <div className="px-6 md:px-10 py-8 min-h-screen bg-gray-900 text-gray-200">
            <h1 className="text-3xl font-bold text-center mb-8">
                {algoType === 'FCFS' && 'First-Come, First-Served'}
                {algoType === 'SSTF' && 'Shortest Seek Time First'}
                {algoType === 'SCAN' && 'SCAN (Elevator Algorithm)'}
                {algoType === 'CSCAN' && 'Circular SCAN'}
                {algoType === 'LOOK' && 'LOOK Algorithm'}
                {algoType === 'CLOOK' && 'Circular LOOK'}{' '}
            </h1>

            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <label>Head Start Position:</label>
                    <input
                        type="number"
                        value={head}
                        onChange={(e) => setHead(parseInt(e.target.value))}
                        className="px-3 py-2 rounded bg-gray-700 text-white"
                    />
                </div>

                <RequestInput requests={requests} setRequests={setRequests} />

                <div className="text-xl">
                    Total Seek Time:{' '}
                    <span className="font-bold text-green-400">
                        {totalSeek}
                    </span>
                </div>

                <DiskChart headMovement={headMovement} />

                <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-bold mb-2">Movement History</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                            <thead className="bg-gray-800">
                                <tr className="divide-x divide-gray-700">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Step
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Position
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {headMovement.map((pos, idx) => (
                                    <tr
                                        key={idx}
                                        className="divide-x divide-gray-700 hover:bg-gray-800 transition-colors duration-150"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">
                                            {idx + 1}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {pos}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            {idx === 0 ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500 text-blue-100">
                                                    Start
                                                </span>
                                            ) : pos ===
                                              headMovement[idx - 1] ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500 text-purple-100">
                                                    Processing
                                                </span>
                                            ) : pos > headMovement[idx - 1] ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-green-100">
                                                    Moving right →
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500 text-red-100">
                                                    Moving left ←
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
