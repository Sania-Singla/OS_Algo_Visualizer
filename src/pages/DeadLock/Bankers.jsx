import { useState } from 'react';
import {
    initProcesses,
    runSafetyAlgorithm,
    requestResources,
    DEMO_DATA,
} from './bankers_algo';

export function Bankers() {
    const [noOfProcesses, setNoOfProcesses] = useState(0);
    const [noOfResources, setNoOfResources] = useState(0);
    const [processes, setProcesses] = useState([]);
    const [available, setAvailable] = useState([]);
    const [safeSequence, setSafeSequence] = useState([]);
    const [isSafe, setIsSafe] = useState(null);

    const [requestPid, setRequestPid] = useState(0);
    const [resourceRequest, setResourceRequest] = useState([]);

    const initializeProcesses = () => {
        setProcesses(initProcesses(noOfProcesses, noOfResources));
        setAvailable(Array(noOfResources).fill(0));
        setSafeSequence([]);
        setIsSafe(null);
        setResourceRequest(Array(noOfResources).fill(0));
    };

    const loadDemoData = () => {
        setNoOfProcesses(DEMO_DATA.noOfProcesses);
        setNoOfResources(DEMO_DATA.noOfResources);
        setProcesses(DEMO_DATA.processes);
        setAvailable(DEMO_DATA.available);
        setResourceRequest(Array(DEMO_DATA.noOfResources).fill(0));
        setRequestPid(0);
        setSafeSequence([]);
        setIsSafe(null);
    };

    const handleInputChange = (type, pid, rid, value) => {
        const updatedProcesses = [...processes];
        updatedProcesses[pid][type][rid] = parseInt(value);
        if (type === 'allocated' || type === 'max') {
            updatedProcesses[pid].need[rid] =
                (updatedProcesses[pid].max[rid] || 0) -
                (updatedProcesses[pid].allocated[rid] || 0);
        }
        setProcesses(updatedProcesses);
    };

    const handleAvailableChange = (rid, value) => {
        const updatedAvailable = [...available];
        updatedAvailable[rid] = parseInt(value);
        setAvailable(updatedAvailable);
    };

    const handleArrowNavigation = (e, type, pid, rid) => {
        const key = e.key;
        const inputs = document.querySelectorAll('input[data-type]');
        const index = Array.from(inputs).findIndex(
            (input) =>
                parseInt(input.dataset.pid) === pid &&
                parseInt(input.dataset.rid) === rid &&
                input.dataset.type === type
        );

        let newIndex = index;

        switch (key) {
            case 'ArrowRight':
                newIndex = index + 1;
                break;
            case 'ArrowLeft':
                newIndex = index - 1;
                break;
            case 'ArrowDown':
                newIndex = index + noOfResources * 2;
                break;
            case 'ArrowUp':
                newIndex = index - noOfResources * 2;
                break;
            default:
                return;
        }

        if (inputs[newIndex]) {
            inputs[newIndex].focus();
            e.preventDefault();
        }
    };

    const checkSafeState = () => {
        const { isSafe, sequence } = runSafetyAlgorithm(
            processes,
            available,
            noOfProcesses,
            noOfResources
        );
        setIsSafe(isSafe);
        setSafeSequence(sequence);
    };

    const handleRequestChange = (rid, value) => {
        const updatedRequest = [...resourceRequest];
        updatedRequest[rid] = parseInt(value);
        setResourceRequest(updatedRequest);
    };

    const handleResourceRequest = () => {
        const result = requestResources(
            processes,
            available,
            requestPid,
            resourceRequest,
            noOfProcesses,
            noOfResources
        );

        if (!result.granted) {
            alert(`Request cannot be granted ❌ (${result.reason})`);
            return;
        }

        setProcesses(result.updatedProcesses);
        setAvailable(result.updatedAvailable);
        setIsSafe(true);
        setSafeSequence(result.safeSequence);
        alert('Request can be granted ✅');
    };

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Banker's Algorithm
            </h1>

            <div className="flex flex-col gap-4 mb-8">
                <div className="flex gap-4 items-center flex-wrap">
                    <label>No. of Processes</label>
                    <input
                        type="number"
                        placeholder="No of Processes"
                        value={noOfProcesses}
                        onChange={(e) =>
                            setNoOfProcesses(parseInt(e.target.value))
                        }
                        className="px-4 py-2 rounded bg-gray-700 text-white"
                    />

                    <label>No. of Resources</label>
                    <input
                        type="number"
                        placeholder="No of Resources"
                        value={noOfResources}
                        onChange={(e) =>
                            setNoOfResources(parseInt(e.target.value))
                        }
                        className="px-4 py-2 rounded bg-gray-700 text-white"
                    />
                    <button
                        onClick={initializeProcesses}
                        className="px-4 py-2 bg-green-600 rounded text-white"
                    >
                        Initialize
                    </button>
                    <button
                        onClick={loadDemoData}
                        className="px-4 py-2 bg-amber-600 rounded text-white"
                    >
                        Load Demo Data
                    </button>
                </div>

                {processes.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2">PID</th>
                                    {Array.from(
                                        { length: noOfResources },
                                        (_, idx) => (
                                            <th
                                                key={`max-${idx}`}
                                                className="px-4 py-2"
                                            >
                                                Max R{idx}
                                            </th>
                                        )
                                    )}
                                    {Array.from(
                                        { length: noOfResources },
                                        (_, idx) => (
                                            <th
                                                key={`alloc-${idx}`}
                                                className="px-4 py-2"
                                            >
                                                Allocated R{idx}
                                            </th>
                                        )
                                    )}
                                    {Array.from(
                                        { length: noOfResources },
                                        (_, idx) => (
                                            <th
                                                key={`need-${idx}`}
                                                className="px-4 py-2"
                                            >
                                                Need R{idx}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {processes.map((process, pid) => (
                                    <tr
                                        key={pid}
                                        className="border-b border-gray-600"
                                    >
                                        <td className="px-4 py-2 font-bold text-center">
                                            P{pid}
                                        </td>
                                        {process.max.map((val, rid) => (
                                            <td
                                                key={`max-${pid}-${rid}`}
                                                className="px-2 py-2"
                                            >
                                                <input
                                                    type="number"
                                                    data-pid={pid}
                                                    data-rid={rid}
                                                    data-type="max"
                                                    value={val}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            'max',
                                                            pid,
                                                            rid,
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleArrowNavigation(
                                                            e,
                                                            'max',
                                                            pid,
                                                            rid
                                                        )
                                                    }
                                                    className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                                                />
                                            </td>
                                        ))}
                                        {process.allocated.map((val, rid) => (
                                            <td
                                                key={`alloc-${pid}-${rid}`}
                                                className="px-2 py-2"
                                            >
                                                <input
                                                    type="number"
                                                    data-pid={pid}
                                                    data-rid={rid}
                                                    data-type="allocated"
                                                    value={val}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            'allocated',
                                                            pid,
                                                            rid,
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleArrowNavigation(
                                                            e,
                                                            'allocated',
                                                            pid,
                                                            rid
                                                        )
                                                    }
                                                    className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                                                />
                                            </td>
                                        ))}
                                        {process.need.map((val, rid) => (
                                            <td
                                                key={`need-${pid}-${rid}`}
                                                className="px-2 py-2 text-center"
                                            >
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {processes.length > 0 && (
                    <div className="flex flex-col gap-4 mt-6">
                        <div className="flex flex-wrap gap-2 items-center">
                            <label>Available Resources:</label>
                            {available.map((val, rid) => (
                                <input
                                    key={`available-${rid}`}
                                    type="number"
                                    value={val}
                                    onChange={(e) =>
                                        handleAvailableChange(
                                            rid,
                                            e.target.value
                                        )
                                    }
                                    className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                                />
                            ))}
                        </div>
                        <button
                            onClick={checkSafeState}
                            className="px-6 py-2 bg-blue-600 rounded text-white"
                        >
                            Check Safe State
                        </button>
                    </div>
                )}

                {processes.length > 0 && (
                    <div className="flex flex-col gap-4 mt-6 p-4 border border-gray-700 rounded">
                        <h2 className="text-xl font-bold text-white">
                            Request Resources
                        </h2>
                        <div className="flex gap-2 items-center">
                            <label>Process ID:</label>
                            <input
                                type="number"
                                min="0"
                                max={noOfProcesses - 1}
                                value={requestPid}
                                onChange={(e) =>
                                    setRequestPid(parseInt(e.target.value))
                                }
                                className="w-20 px-2 py-1 bg-gray-700 text-white rounded"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            {resourceRequest.map((val, rid) => (
                                <input
                                    key={`request-${rid}`}
                                    type="number"
                                    value={val}
                                    onChange={(e) =>
                                        handleRequestChange(rid, e.target.value)
                                    }
                                    className="w-16 px-2 py-1 bg-gray-700 text-white rounded"
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleResourceRequest}
                            className="px-6 py-2 bg-purple-600 rounded text-white"
                        >
                            Submit Request
                        </button>
                    </div>
                )}
            </div>

            {isSafe !== null && (
                <div className="mt-8 text-center">
                    {isSafe ? (
                        <>
                            <h2 className="text-2xl font-bold text-green-400">
                                Safe State ✅
                            </h2>
                            <p className="mt-2">
                                Safe Sequence:{' '}
                                {safeSequence
                                    .map((pid) => `P${pid}`)
                                    .join(' → ')}
                            </p>
                        </>
                    ) : (
                        <h2 className="text-2xl font-bold text-red-400">
                            Not Safe ❌
                        </h2>
                    )}
                </div>
            )}
        </div>
    );
}
