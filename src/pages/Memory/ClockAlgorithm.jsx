import React, { useState, useEffect } from 'react';
//Clock hand
const ClockAlgorithm = () => {
    // Simulation state
    const [frames, setFrames] = useState([]);
    const [pages, setPages] = useState([]);
    const [handPosition, setHandPosition] = useState(0);
    const [moveCount, setMoveCount] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [stats, setStats] = useState({ hits: 0, misses: 0 });
    const [accessHistory, setAccessHistory] = useState([]);
    const [algorithmSteps, setAlgorithmSteps] = useState([]);
    const [activeRequest, setActiveRequest] = useState(null);
    const [swapAnimation, setSwapAnimation] = useState(null);
    const [settings, setSettings] = useState({
        frameCount: 3,
        initialized: false,
    });
    const [pageInput, setPageInput] = useState('');

    // Colors for visualization
    const pageColors = [
        'bg-red-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500',
    ];

    // Initialize simulation
    const initializeSimulation = () => {
        const newFrames = Array.from(
            { length: settings.frameCount },
            (_, i) => ({
                id: i,
                page: null,
                referenceBit: 0,
                isActive: false,
            })
        );

        setFrames(newFrames);
        setPages([]);
        setHandPosition(0);
        setMoveCount(0);
        setStats({ hits: 0, misses: 0 });
        setAccessHistory([]);
        setAlgorithmSteps([]);
        setIsRunning(false);
        setSettings({ ...settings, initialized: true });
    };

    // Add a new page
    const addPage = () => {
        const newPage = {
            id: pages.length + 1,
            content: `Page ${pages.length + 1}`,
            color: pageColors[pages.length % pageColors.length],
            accessed: false,
        };
        setPages([...pages, newPage]);
    };

    // Access a page
    const accessPage = (pageNum) => {
        if (!settings.initialized) return;

        const page = pages.find((p) => p.id === pageNum);
        if (!page) return;

        setActiveRequest(page);

        setTimeout(() => {
            const updatedPages = pages.map((p) =>
                p.id === pageNum ? { ...p, accessed: true } : p
            );
            setPages(updatedPages);

            // Check for hit
            const frameIndex = frames.findIndex((f) => f.page?.id === pageNum);

            if (frameIndex >= 0) {
                // Page hit
                const updatedFrames = frames.map((f, i) =>
                    i === frameIndex
                        ? {
                              ...f,
                              referenceBit: 1,
                              isActive: true,
                          }
                        : f
                );

                setFrames(updatedFrames);
                setStats((prev) => ({ ...prev, hits: prev.hits + 1 }));

                setAlgorithmSteps((prev) => [
                    ...prev,
                    `Hit: Page ${pageNum} found in frame ${frameIndex}, reference bit set to 1`,
                ]);

                setTimeout(() => {
                    setFrames((frames) =>
                        frames.map((f) => ({ ...f, isActive: false }))
                    );
                    setActiveRequest(null);
                    setHandPosition((frameIndex + 1) % frames.length);
                }, 500);
            } else {
                // Page miss - replacement needed
                setStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
                replacePage(pageNum);
            }

            setAccessHistory((prev) => [
                ...prev.slice(-9),
                {
                    pageId: pageNum,
                    time: new Date().toLocaleTimeString(),
                    hit: frameIndex >= 0,
                    frame: frameIndex >= 0 ? frameIndex : 'Disk',
                },
            ]);
        }, 300);
    };

    // Update the sleep function to respect speed
    const sleep = (ms) =>
        new Promise((resolve) => setTimeout(resolve, ms / speed));

    // Update the replacePage function to use the speed-adjusted sleep
    const replacePage = async (newPageId) => {
        let updatedFrames = [...frames];
        let steps = [
            `Miss: Page ${newPageId} not found, starting replacement from frame ${handPosition}`,
        ];

        const newPage = pages.find((p) => p.id === newPageId);
        let current = handPosition;

        while (true) {
            setFrames((frames) =>
                frames.map((f, i) =>
                    i === current
                        ? { ...f, isActive: true }
                        : { ...f, isActive: false }
                )
            );

            await sleep(500); // This will now respect the speed setting

            const frame = updatedFrames[current];

            if (frame.referenceBit === 0) {
                steps.push(
                    `Frame ${current} has reference bit 0 - Replacing page ${frame.page?.id ?? 'Empty'}`
                );

                const pos = getClockPosition(current, frames.length);

                // Animate old page out
                setSwapAnimation({
                    type: 'out',
                    frameIndex: current,
                    page: frame.page,
                    color: frame.page?.color || 'bg-gray-400',
                    startX: pos.x,
                    startY: pos.y,
                });
                await sleep(400);

                setSwapAnimation(null);
                await sleep(100);

                // Animate new page in
                setSwapAnimation({
                    type: 'in',
                    frameIndex: current,
                    page: newPage,
                    color: newPage.color,
                    endX: pos.x,
                    endY: pos.y,
                });
                await sleep(400);

                updatedFrames[current] = {
                    ...updatedFrames[current],
                    page: newPage,
                    referenceBit: 1,
                    isActive: false,
                };

                setFrames([...updatedFrames]);
                setSwapAnimation(null);
                setHandPosition((current + 1) % frames.length);
                setMoveCount((prev) => prev + 1);
                setActiveRequest(null);
                break;
            } else {
                steps.push(
                    `Frame ${current} has reference bit 1 - Second Chance given!`
                );

                const pos = getClockPosition(current, frames.length);

                setSwapAnimation({
                    type: 'secondChance',
                    frameIndex: current,
                    page: frame.page,
                    color: frame.page?.color || 'bg-yellow-500',
                    x: pos.x,
                    y: pos.y,
                });

                await sleep(400);

                updatedFrames[current].referenceBit = 0;
                setFrames([...updatedFrames]);
                setSwapAnimation(null);

                current = (current + 1) % frames.length;
                setHandPosition(current);
                setMoveCount((prev) => prev + 1);
            }
        }

        setAlgorithmSteps((prev) => [...prev, ...steps]);
    };


    // Update the clock hand transition duration
    <div
        className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-orange-500 origin-left z-0"
        style={{
            transform: `rotate(${moveCount * (360 / frames.length) - 90}deg)`,
            transition: `transform ${0.5 / speed}s ease-in-out`, // Speed-adjusted transition
        }}
    />;

    // Calculate positions for clock visualization
    const getClockPosition = (index, total) => {
        const angle = index * (360 / total) - 90; // Start from top (-90 degrees)
        const radius = 40; // Percentage from center
        const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
        const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
        return { x, y, angle };
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Clock Page Replacement Algorithm
                </h1>

                {/* Configuration */}
                {!settings.initialized ? (
                    <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">
                            Configuration
                        </h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm mb-2">
                                    Number of Frames
                                </label>
                                <select
                                    value={settings.frameCount}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            frameCount: Number(e.target.value),
                                        })
                                    }
                                    className="w-full bg-gray-700 rounded px-3 py-2"
                                >
                                    {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                                        <option key={num} value={num}>
                                            {num} frames
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={initializeSimulation}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium w-full md:w-auto"
                                >
                                    Initialize Simulation
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Controls */}
                        <div className="bg-gray-800 rounded-xl p-6 mb-4 shadow-lg">
                            {/* Top Controls */}
                            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                                {/* Start, Reset, Add Page */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={initializeSimulation}
                                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium text-sm"
                                    >
                                        🔄 Reset
                                    </button>
                                    <button
                                        onClick={addPage}
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50"
                                    >
                                        ➕ Add
                                    </button>
                                </div>

                                {/* Speed + Hits + Misses */}
                                <div className="flex items-center gap-4">
                                    {/* Hits and Misses */}
                                    <div className="flex  gap-2">
                                        <div className="bg-blue-900/30 px-6 py-1 rounded-lg text-center">
                                            <div className="font-bold text-md opacity-70">
                                                Hits
                                            </div>
                                            <div className="text-sm font-bold">
                                                {stats.hits}
                                            </div>
                                        </div>
                                        <div className="bg-red-900/30 px-4 py-1 rounded-lg text-center">
                                            <div className="font-bold text-md opacity-70">
                                                Misses
                                            </div>
                                            <div className="text-sm font-bold">
                                                {stats.misses}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Speed */}
                                    <div>
                                        <label className="block text-xs mb-1">
                                            Speed
                                        </label>
                                        <select
                                            value={speed}
                                            onChange={(e) =>
                                                setSpeed(Number(e.target.value))
                                            }
                                            className="bg-gray-700 rounded px-2 py-1 text-xs"
                                        >
                                            <option value={0.5}>0.5x</option>
                                            <option value={1}>1x</option>
                                            <option value={1.5}>1.5x</option>
                                            <option value={2}>2x</option>
                                            <option value={2.5}>2.5x</option>
                                            <option value={3}>3x</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Page Pool */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-md font-semibold">
                                        Page Pool
                                    </h2>
                                    <span className="text-xs text-gray-400">
                                        {pages.length} pages - Click to access
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2 min-h-12">
                                    {pages.length > 0 ? (
                                        pages.map((page) => (
                                            <button
                                                key={page.id}
                                                onClick={() =>
                                                    accessPage(page.id)
                                                }
                                                className={`px-3 py-2 rounded-md font-medium text-xs text-white ${page.color} ${
                                                    page.accessed
                                                        ? 'opacity-100'
                                                        : 'opacity-70'
                                                } hover:opacity-100 transition-opacity`}
                                                disabled={isRunning}
                                            >
                                                {page.content}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-gray-500 italic text-xs">
                                            No pages available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Visualization */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                            {/* Clock Visualization */}
                            <div className="relative w-full aspect-square max-w-xs mx-auto">
                                {/* Clock Face */}
                                <div className="absolute inset-0 rounded-full border-2 border-blue-500/50 flex items-center justify-center">
                                    {/* Swap Animations */}
                                    {swapAnimation && (
                                        <div
                                            className={`absolute w-12 h-12 rounded-md flex flex-col items-center justify-center text-[10px] z-50 transition-all duration-400 ${
                                                swapAnimation.color
                                            } ${
                                                swapAnimation.type === 'out'
                                                    ? 'animate-ping opacity-50' // Outgoing page with fade out effect
                                                    : swapAnimation.type ===
                                                        'secondChance'
                                                      ? 'animate-bounce scale-110' // Emphasize second chance
                                                      : ''
                                            }`}
                                            style={{
                                                left: `${swapAnimation.type === 'in' ? '50%' : swapAnimation.startX || swapAnimation.x}%`,
                                                top: `${swapAnimation.type === 'in' ? '50%' : swapAnimation.startY || swapAnimation.y}%`,
                                                transform: `translate(-50%, -50%) ${
                                                    swapAnimation.type === 'in'
                                                        ? `translate(${swapAnimation.endX - 50}%, ${swapAnimation.endY - 50}%) scale(1.2)` // Incoming page zoom effect
                                                        : swapAnimation.type ===
                                                            'out'
                                                          ? 'scale(1.2)' // Outgoing page with zoom out effect
                                                          : ''
                                                }`,
                                            }}
                                        >
                                            {swapAnimation.page?.content ||
                                                'Empty'}
                                            {swapAnimation.type ===
                                                'secondChance' && (
                                                <div className="mt-0.5 text-[9px] bg-black/30 px-1 rounded">
                                                    Second Chance!
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Frames */}
                                    {frames.map((frame, index) => {
                                        const pos = getClockPosition(
                                            index,
                                            frames.length
                                        );
                                        return (
                                            <div
                                                key={frame.id}
                                                className={`absolute w-12 h-12 rounded-md flex flex-col items-center justify-center text-[10px] transition-all duration-300 z-10
                        ${frame.page ? frame.page.color : 'bg-gray-700'}
                        ${frame.isActive ? 'ring-2 ring-yellow-400 scale-105' : ''}
                        ${handPosition === index ? 'ring-2 ring-orange-400' : ''}`}
                                                style={{
                                                    left: `${pos.x}%`,
                                                    top: `${pos.y}%`,
                                                    transform: `translate(-50%, -50%)`,
                                                }}
                                            >
                                                {frame.page
                                                    ? frame.page.content
                                                    : 'Empty'}
                                                <div className="mt-0.5 text-[9px] bg-black/30 px-1 rounded">
                                                    R:{frame.referenceBit}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Clock Hand - Fixed positioning */}
                                    <div
                                        className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-orange-500 origin-left z-0 transition-transform duration-500 ease-in-out"
                                        style={{
                                            transform: `rotate(${moveCount * (360 / frames.length) - 90}deg)`, // Add 90 to start at top (90 degrees)
                                        }}
                                    />

                                    <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-orange-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-0" />
                                </div>
                            </div>

                            {/* Frame List Visualization */}
                            <div className="bg-gray-800 rounded-xl p-5 shadow-lg">
                                <h2 className="text-xl font-semibold mb-4">
                                    Frame List
                                </h2>

                                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                                    {frames.map((frame, index) => (
                                        <div
                                            key={frame.id}
                                            className={`p-3 rounded-lg border transition-all ${
                                                frame.isActive
                                                    ? 'border-yellow-500 bg-yellow-900/20'
                                                    : handPosition === index
                                                      ? 'border-orange-500 bg-orange-900/20'
                                                      : 'border-gray-700'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center">
                                                    <div
                                                        className={`p-2 h-9 rounded-md mr-3 flex items-center justify-center ${
                                                            frame.page
                                                                ? frame.page
                                                                      .color
                                                                : 'bg-gray-700'
                                                        }`}
                                                    >
                                                        {frame.page
                                                            ? frame.page.content
                                                            : 'Empty'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-100">
                                                            Frame {frame.id}
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            R:{' '}
                                                            {frame.referenceBit}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    {handPosition === index && (
                                                        <div className="bg-orange-900/50 text-orange-400 px-2 py-1 rounded text-xs">
                                                            Pointer
                                                        </div>
                                                    )}
                                                    {frame.isActive &&
                                                        handPosition !==
                                                            index && (
                                                            <div className="bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded text-xs">
                                                                Examining
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Information panels */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Access history */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-64 overflow-hidden">
                                <h2 className="text-xl font-semibold mb-4">
                                    Access History
                                </h2>
                                <div className="h-52 overflow-y-auto space-y-2 pr-2">
                                    {accessHistory
                                        .slice()
                                        .reverse()
                                        .map((access, i) => (
                                            <div
                                                key={i}
                                                className={`py-2 px-3 rounded-lg ${
                                                    access.hit
                                                        ? 'bg-green-900/50 text-green-300'
                                                        : 'bg-red-900/50 text-red-300'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">
                                                        Page {access.pageId}
                                                    </span>
                                                    <span className="text-xs bg-gray-700/50 px-2 py-1 rounded">
                                                        {access.hit
                                                            ? `Frame ${access.frame}`
                                                            : 'Page Fault'}
                                                    </span>
                                                </div>
                                                <div className="text-xs opacity-70 mt-1">
                                                    {access.time}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Algorithm steps */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-64 overflow-hidden">
                                <h2 className="text-xl font-semibold mb-4">
                                    Algorithm Steps
                                </h2>
                                <div className="h-52 overflow-y-auto space-y-2 font-mono text-sm pr-2">
                                    {algorithmSteps
                                        .slice()
                                        .reverse()
                                        .map((step, i) => (
                                            <div
                                                key={i}
                                                className={`py-2 px-3 rounded-lg ${
                                                    step.includes('Hit')
                                                        ? 'bg-blue-900/30 text-blue-300'
                                                        : 'bg-purple-900/30 text-purple-300'
                                                }`}
                                            >
                                                {step}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClockAlgorithm;
