import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PagingModule({
    state,
    setState,
    sharedActions,
    highlightedItem,
}) {
    // Clock Algorithm State
    const [clockState, setClockState] = useState({
        frames: [],
        handPosition: 0,
        moveCount: 0,
        isRunning: false,
        speed: 1,
        stats: { hits: 0, misses: 0 },
        accessHistory: [],
        algorithmSteps: [],
        activeRequest: null,
        swapAnimation: null,
        settings: {
            initialized: false,
        },
    });

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

    // Initialize frames based on physical memory
    useEffect(() => {
        if (
            state.physicalMemory.length > 0 &&
            !clockState.settings.initialized
        ) {
            const newFrames = Array.from(
                { length: state.physicalMemory.length },
                (_, i) => ({
                    id: i,
                    page: null,
                    referenceBit: 0,
                    isActive: false,
                })
            );

            setClockState((prev) => ({
                ...prev,
                frames: newFrames,
                settings: {
                    ...prev.settings,
                    initialized: true,
                },
            }));
        }
    }, [state.physicalMemory, clockState.settings.initialized]);

    // Get page color based on page number
    const getPageColor = (pageNum) => {
        return pageColors[pageNum % pageColors.length];
    };

    // Convert VPN to page number
    const getPageNum = (vpn) => {
        return parseInt(vpn.split('-')[1]) + 1;
    };

    // // Convert frame number to hex address with frame number in brackets
    // const formatPPN = (frameNumber) => {
    //     if (frameNumber === null || frameNumber === undefined) return 'Disk';
    //     const hexAddress = `0x${(frameNumber * 0x1000).toString(16).padStart(4, '0')}`;
    //     return `${hexAddress} (Frame ${frameNumber})`;
    // };

    // Access a page
    const accessPage = async (vpn) => {
        if (!clockState.settings.initialized || clockState.isRunning) return;

        setClockState((prev) => ({ ...prev, isRunning: true }));

        const pageNum = getPageNum(vpn);
        const pageColor = getPageColor(pageNum);
        const pageContent = vpn;

        setClockState((prev) => ({
            ...prev,
            activeRequest: {
                id: pageNum,
                content: pageContent,
                color: pageColor,
            },
        }));

        // Check if page is already in memory (hit)
        const frameIndex = clockState.frames.findIndex(
            (f) => f.page?.content === vpn
        );

        if (frameIndex >= 0) {
            // Page hit
            const updatedFrames = [...clockState.frames];
            updatedFrames[frameIndex].referenceBit = 1;
            updatedFrames[frameIndex].isActive = true;

            setClockState((prev) => ({
                ...prev,
                frames: updatedFrames,
                stats: {
                    ...prev.stats,
                    hits: prev.stats.hits + 1,
                },
                accessHistory: [
                    ...prev.accessHistory,
                    {
                        pageId: vpn,
                        time: new Date().toLocaleTimeString(),
                        hit: true,
                        frame: frameIndex,
                    },
                ],
                algorithmSteps: [
                    ...prev.algorithmSteps,
                    `Hit: Page ${vpn} found in frame ${frameIndex}, reference bit set to 1`,
                ],
            }));

            // Update page table
            setState((prev) => ({
                ...prev,
                pageTable: {
                    ...prev.pageTable,
                    [vpn]: {
                        ...prev.pageTable[vpn],
                        referenced: true,
                    },
                },
            }));

            // Reset active state after animation (but don't move the hand)
            setTimeout(() => {
                setClockState((prev) => ({
                    ...prev,
                    frames: prev.frames.map((f) => ({ ...f, isActive: false })),
                    activeRequest: null,
                    isRunning: false,
                    // Removed the hand position update here
                }));
            }, 500);

            return;
        }

        // Page fault - need replacement
        setClockState((prev) => ({
            ...prev,
            stats: {
                ...prev.stats,
                misses: prev.stats.misses + 1,
            },
            accessHistory: [
                ...prev.accessHistory,
                {
                    pageId: vpn,
                    time: new Date().toLocaleTimeString(),
                    hit: false,
                    frame: 'Disk',
                    ppn: 'Disk',
                },
            ],
            algorithmSteps: [
                ...prev.algorithmSteps,
                `Miss: Page ${vpn} not found in memory, starting replacement from frame ${prev.handPosition}`,
            ],
        }));

        // Run replacement algorithm
        await replacePage(vpn, pageNum, pageColor);
        setClockState((prev) => ({ ...prev, isRunning: false }));
    };

    // Replace page using Clock algorithm
    const replacePage = async (vpn, pageNum, pageColor) => {
        let updatedFrames = [...clockState.frames];
        let current = clockState.handPosition;
        const newPage = {
            id: pageNum,
            content: vpn,
            color: pageColor,
        };

        while (true) {
            setClockState((prev) => ({
                ...prev,
                frames: prev.frames.map((f, i) =>
                    i === current
                        ? { ...f, isActive: true }
                        : { ...f, isActive: false }
                ),
            }));

            await sleep(500 / clockState.speed);

            const frame = updatedFrames[current];
            const pos = getClockPosition(current, clockState.frames.length);

            if (frame.referenceBit === 0) {
                // Found candidate for replacement
                const oldPage = frame.page?.content;

                setClockState((prev) => ({
                    ...prev,
                    algorithmSteps: [
                        ...prev.algorithmSteps,
                        `Frame ${current} has reference bit 0 - Replacing page ${oldPage || 'Empty'} with ${vpn}`,
                    ],
                }));

                // Animate old page out
                setClockState((prev) => ({
                    ...prev,
                    swapAnimation: {
                        type: 'out',
                        frameIndex: current,
                        page: frame.page,
                        color: frame.page?.color || 'bg-gray-400',
                        startX: pos.x,
                        startY: pos.y,
                    },
                }));

                await sleep(400);
                setClockState((prev) => ({ ...prev, swapAnimation: null }));
                await sleep(100);

                // Animate new page in
                setClockState((prev) => ({
                    ...prev,
                    swapAnimation: {
                        type: 'in',
                        frameIndex: current,
                        page: newPage,
                        color: newPage.color,
                        endX: pos.x,
                        endY: pos.y,
                    },
                }));

                await sleep(400);

                // Update the frame
                updatedFrames[current] = {
                    ...updatedFrames[current],
                    page: newPage,
                    referenceBit: 1,
                    isActive: false,
                };

                setClockState((prev) => ({
                    ...prev,
                    frames: updatedFrames,
                    swapAnimation: null,
                    handPosition: (current + 1) % prev.frames.length,
                    moveCount: prev.moveCount + 1,
                    activeRequest: null,
                }));

                // Update page table and physical memory
                setState((prev) => {
                    const newPageTable = { ...prev.pageTable };
                    const newPhysicalMemory = [...prev.physicalMemory];

                    // If replacing an existing page
                    if (oldPage) {
                        newPageTable[oldPage] = {
                            ...newPageTable[oldPage],
                            present: false,
                            ppn: null,
                        };
                    }

                    // Add new page
                    newPageTable[vpn] = {
                        present: true,
                        ppn: current,
                        referenced: true,
                        modified: false,
                    };

                    newPhysicalMemory[current] = vpn;

                    return {
                        ...prev,
                        pageTable: newPageTable,
                        physicalMemory: newPhysicalMemory,
                    };
                });

                // Add to access history with new PPN
                setClockState((prev) => ({
                    ...prev,
                    accessHistory: [
                        ...prev.accessHistory,
                        {
                            pageId: vpn,
                            time: new Date().toLocaleTimeString(),
                            hit: true,
                            frame: current,
                        },
                    ],
                    algorithmSteps: [
                        ...prev.algorithmSteps,
                        `Page ${vpn} loaded into frame ${current} `,
                    ],
                }));

                break;
            } else {
                // Give second chance
                setClockState((prev) => ({
                    ...prev,
                    algorithmSteps: [
                        ...prev.algorithmSteps,
                        `Frame ${current} has reference bit 1 - Giving second chance (setting bit to 0)`,
                    ],
                    swapAnimation: {
                        type: 'secondChance',
                        frameIndex: current,
                        page: frame.page,
                        color: frame.page?.color || 'bg-yellow-500',
                        x: pos.x,
                        y: pos.y,
                    },
                }));

                await sleep(400);

                updatedFrames[current].referenceBit = 0;
                setClockState((prev) => ({
                    ...prev,
                    frames: updatedFrames,
                    swapAnimation: null,
                    handPosition: (current + 1) % prev.frames.length,
                    moveCount: prev.moveCount + 1,
                }));
            }

            current = (current + 1) % clockState.frames.length;
        }
    };

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Calculate positions for clock visualization
    const getClockPosition = (index, total) => {
        const angle = index * (360 / total) - 90;
        const radius = 40;
        const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
        const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
        return { x, y, angle };
    };

    const updateSpeed = (newSpeed) => {
        setClockState((prev) => ({
            ...prev,
            speed: newSpeed,
        }));
    };

    // Get all pages from processes
    const getAllPages = () => {
        return Object.keys(state.pageTable)
            .filter((vpn) =>
                state.processes.some((p) => vpn.startsWith(`${p.pid}-`))
            )
            .sort((a, b) => getPageNum(a) - getPageNum(b));
    };

    // Get process name from VPN
    const getProcessName = (vpn) => {
        const pid = vpn.split('-')[0];
        const process = state.processes.find((p) => p.pid.toString() === pid);
        return process ? `Process ${pid}` : 'Unknown';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Controls and Page Pool */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Controls */}
                        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                                <div className="flex gap-2">
                                    {/* <button
                                        onClick={() => {
                                            setClockState((prev) => ({
                                                ...prev,
                                                frames: Array(
                                                    state.physicalMemory.length
                                                )
                                                    .fill(null)
                                                    .map((_, i) => ({
                                                        id: i,
                                                        page: null,
                                                        referenceBit: 0,
                                                        isActive: false,
                                                    })),
                                                handPosition: 0,
                                                moveCount: 0,
                                                stats: { hits: 0, misses: 0 },
                                                accessHistory: [],
                                                algorithmSteps: [],
                                                settings: {
                                                    ...prev.settings,
                                                    initialized: true,
                                                },
                                            }));
                                        }}
                                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium text-sm"
                                    >
                                        🔄 Reset
                                    </button> */}
                                    <button
                                        onClick={() =>
                                            sharedActions.createProcess()
                                        }
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm"
                                    >
                                        ➕ Add Process
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <div className="bg-blue-900/30 px-6 py-1 rounded-lg text-center">
                                            <div className="font-bold text-md opacity-70">
                                                Hits
                                            </div>
                                            <div className="text-sm font-bold">
                                                {clockState.stats.hits}
                                            </div>
                                        </div>
                                        <div className="bg-red-900/30 px-4 py-1 rounded-lg text-center">
                                            <div className="font-bold text-md opacity-70">
                                                Misses
                                            </div>
                                            <div className="text-sm font-bold">
                                                {clockState.stats.misses}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs mb-1">
                                            Speed
                                        </label>
                                        <select
                                            value={clockState.speed}
                                            onChange={(e) =>
                                                updateSpeed(
                                                    Number(e.target.value)
                                                )
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
                                        Process Pages
                                    </h2>
                                    <span className="text-xs text-gray-400">
                                        {getAllPages().length} pages - Click to
                                        access
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2 min-h-12">
                                    {getAllPages().length > 0 ? (
                                        getAllPages().map((vpn) => {
                                            const pageNum = getPageNum(vpn);
                                            const isAccessed =
                                                clockState.frames.some(
                                                    (f) =>
                                                        f.page?.content === vpn
                                                );

                                            return (
                                                <button
                                                    key={vpn}
                                                    onClick={() =>
                                                        accessPage(vpn)
                                                    }
                                                    className={`px-3 py-2 rounded-md font-medium text-xs text-white ${getPageColor(pageNum)} ${
                                                        isAccessed
                                                            ? 'opacity-100'
                                                            : 'opacity-70'
                                                    } hover:opacity-100 transition-opacity`}
                                                    disabled={
                                                        clockState.isRunning
                                                    }
                                                >
                                                    {vpn}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="text-gray-500 italic text-xs">
                                            No pages available (create processes
                                            first)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Page Table */}
                        <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-[400px] overflow-hidden">
                            <h2 className="text-xl font-semibold mb-4">
                                Page Table
                            </h2>
                            <div className="h-[340px] overflow-y-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-left border-b border-gray-700">
                                            <th className="p-2">Process</th>
                                            <th className="p-2">VPN</th>
                                            <th className="p-2">PPN</th>
                                            <th className="p-2">Present</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(state.pageTable)
                                            .filter(([vpn]) =>
                                                state.processes.some((p) =>
                                                    vpn.startsWith(`${p.pid}-`)
                                                )
                                            )
                                            .map(([vpn, entry]) => (
                                                <tr
                                                    key={vpn}
                                                    className={`border-b border-gray-700 ${
                                                        highlightedItem === vpn
                                                            ? 'bg-blue-900/30'
                                                            : ''
                                                    }`}
                                                >
                                                    <td className="p-2">
                                                        {getProcessName(vpn)}
                                                    </td>
                                                    <td className="p-2">
                                                        {vpn}
                                                    </td>
                                                    <td className="p-2">
                                                        {entry.present
                                                            ? entry.ppn
                                                            : 'Disk'}
                                                    </td>
                                                    <td className="p-2">
                                                        {entry.present
                                                            ? '✓'
                                                            : '✗'}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Middle and Right Columns - Combined Visualization */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Top Row - Clock and Frame List */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Clock Visualization */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                                <h2 className="text-xl font-semibold mb-4 text-center">
                                    Clock Visualization
                                </h2>
                                <div className="relative w-full aspect-square max-w-xs mx-auto">
                                    {/* Clock Face */}
                                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/50 flex items-center justify-center">
                                        {/* Swap Animations */}
                                        {clockState.swapAnimation && (
                                            <div
                                                className={`absolute w-12 h-12 rounded-md flex flex-col items-center justify-center text-[10px] z-50 transition-all duration-400 ${
                                                    clockState.swapAnimation
                                                        .color
                                                } ${
                                                    clockState.swapAnimation
                                                        .type === 'out'
                                                        ? 'animate-ping opacity-50'
                                                        : clockState
                                                                .swapAnimation
                                                                .type ===
                                                            'secondChance'
                                                          ? 'animate-bounce scale-110'
                                                          : ''
                                                }`}
                                                style={{
                                                    left: `${clockState.swapAnimation.type === 'in' ? '50%' : clockState.swapAnimation.startX || clockState.swapAnimation.x}%`,
                                                    top: `${clockState.swapAnimation.type === 'in' ? '50%' : clockState.swapAnimation.startY || clockState.swapAnimation.y}%`,
                                                    transform: `translate(-50%, -50%) ${
                                                        clockState.swapAnimation
                                                            .type === 'in'
                                                            ? `translate(${clockState.swapAnimation.endX - 50}%, ${clockState.swapAnimation.endY - 50}%) scale(1.2)`
                                                            : clockState
                                                                    .swapAnimation
                                                                    .type ===
                                                                'out'
                                                              ? 'scale(1.2)'
                                                              : ''
                                                    }`,
                                                }}
                                            >
                                                {clockState.swapAnimation.page
                                                    ?.content || 'Empty'}
                                                {clockState.swapAnimation
                                                    .type ===
                                                    'secondChance' && (
                                                    <div className="mt-0.5 text-[9px] bg-black/30 px-1 rounded">
                                                        Second Chance!
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Frames */}
                                        {clockState.frames.map(
                                            (frame, index) => {
                                                const pos = getClockPosition(
                                                    index,
                                                    clockState.frames.length
                                                );
                                                return (
                                                    <div
                                                        key={frame.id}
                                                        className={`absolute w-12 h-12 rounded-md flex flex-col items-center justify-center text-[10px] transition-all duration-300 z-10
                                                    ${frame.page ? frame.page.color : 'bg-gray-700'}
                                                    ${frame.isActive ? 'ring-2 ring-yellow-400 scale-105' : ''}
                                                    ${clockState.handPosition === index ? 'ring-2 ring-orange-400' : ''}`}
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
                                                            R:
                                                            {frame.referenceBit}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}

                                        {/* Clock Hand */}
                                        <div
                                            className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-orange-500 origin-left z-0 transition-transform duration-500 ease-in-out"
                                            style={{
                                                transform: `rotate(${clockState.moveCount * (360 / clockState.frames.length) - 90}deg)`,
                                                transition: `transform ${0.5 / clockState.speed}s ease-in-out`,
                                            }}
                                        />

                                        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-orange-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-0" />
                                    </div>
                                </div>
                            </div>

                            {/* Frame List */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                                <h2 className="text-xl font-semibold mb-4">
                                    Frame List
                                </h2>
                                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
                                    {clockState.frames.map((frame, index) => (
                                        <div
                                            key={frame.id}
                                            className={`p-3 rounded-lg border transition-all ${
                                                frame.isActive
                                                    ? 'border-yellow-500 bg-yellow-900/20'
                                                    : clockState.handPosition ===
                                                        index
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
                                                    {clockState.handPosition ===
                                                        index && (
                                                        <div className="bg-orange-900/50 text-orange-400 px-2 py-1 rounded text-xs">
                                                            Pointer
                                                        </div>
                                                    )}
                                                    {frame.isActive &&
                                                        clockState.handPosition !==
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

                        {/* Bottom Row - Algorithm Steps and Access History */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Access history */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-[300px] overflow-hidden">
                                <h2 className="text-xl font-semibold mb-4">
                                    Access History
                                </h2>
                                <div className="h-[260px] overflow-y-auto space-y-2 pr-2">
                                    {clockState.accessHistory.length > 0 ? (
                                        clockState.accessHistory
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
                                                    <div className="text-xs opacity-70">
                                                        {access.ppn}
                                                    </div>
                                                    <div className="text-xs opacity-70 mt-1">
                                                        {access.time}
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-gray-500 italic text-sm p-2">
                                            No page accesses yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Algorithm steps */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-[300px] overflow-hidden">
                                <h2 className="text-xl font-semibold mb-4">
                                    Algorithm Steps
                                </h2>
                                <div className="h-[260px] overflow-y-auto space-y-2 font-mono text-sm pr-2">
                                    {clockState.algorithmSteps.length > 0 ? (
                                        clockState.algorithmSteps
                                            .slice()
                                            .reverse()
                                            .map((step, i) => (
                                                <div
                                                    key={i}
                                                    className={`py-2 px-3 rounded-lg ${
                                                        step.includes('Hit')
                                                            ? 'bg-blue-900/30 text-blue-300'
                                                            : step.includes(
                                                                    'Miss'
                                                                )
                                                              ? 'bg-purple-900/30 text-purple-300'
                                                              : 'bg-gray-700/50 text-gray-300'
                                                    }`}
                                                >
                                                    {step}
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-gray-500 italic text-sm p-2">
                                            Algorithm steps will appear here
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
