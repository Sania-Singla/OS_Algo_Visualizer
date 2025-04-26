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
        <div className="px-6 py-8 min-h-screen bg-gray-900 text-gray-200">
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
                    <div className="max-h-40 overflow-y-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-2">Step</th>
                                    <th className="text-left py-2">Position</th>
                                    <th className="text-left py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {headMovement.map((pos, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-gray-700"
                                    >
                                        <td className="py-2">{idx + 1}</td>
                                        <td className="py-2">{pos}</td>
                                        <td className="py-2">
                                            {idx === 0
                                                ? 'Start'
                                                : pos === headMovement[idx - 1]
                                                  ? 'Processing'
                                                  : pos > headMovement[idx - 1]
                                                    ? 'Moving right'
                                                    : 'Moving left'}
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
