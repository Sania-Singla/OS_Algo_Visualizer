import React, { useState } from 'react';

export default function RequestInput({ requests, setRequests }) {
    const [input, setInput] = useState('');

    const addRequests = () => {
        if (input.trim() !== '') {
            // Split input by commas or spaces, clean and parse numbers
            const newRequests = input
                .split(/[\s,]+/) // split by commas or spaces
                .map((val) => parseInt(val))
                .filter((val) => !isNaN(val));

            setRequests([...requests, ...newRequests]);
            setInput('');
        }
    };

    const randomize = () => {
        const randomRequests = Array.from({ length: 8 }, () =>
            Math.floor(Math.random() * 200)
        );
        setRequests(randomRequests);
    };

    const clear = () => {
        setRequests([]);
    };

    const remove = (index) => {
        const newRequests = [...requests];
        newRequests.splice(index, 1);
        setRequests(newRequests);
    };

    return (
        <div className="mb-6">
            <div className="flex gap-2 mb-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Enter requests (e.g., 98, 183, 37)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 min-w-[250px] px-4 py-2 rounded bg-gray-700 text-white"
                />
                <button
                    onClick={addRequests}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                >
                    Add
                </button>
                <button
                    onClick={randomize}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Randomize
                </button>
                <button
                    onClick={clear}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                >
                    Clear
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {requests.map((req, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded"
                    >
                        <span>{req}</span>
                        <button
                            onClick={() => remove(idx)}
                            className="text-red-400"
                        >
                            x
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
