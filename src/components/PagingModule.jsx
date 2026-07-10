import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const PAGE_COLORS = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
];

const createFrame = (id) => ({
    id,
    page: null,
    referenceBit: 0,
    isActive: false,
});

const sleep = (milliseconds) =>
    new Promise((resolve) =>
        setTimeout(resolve, milliseconds)
    );

const getPageNumber = (vpn) =>
    Number(vpn.split('-')[1]) + 1;

const getPageColor = (vpn) => {
    const pageNumber = getPageNumber(vpn);

    return PAGE_COLORS[
        pageNumber % PAGE_COLORS.length
    ];
};

const getClockPosition = (index, total) => {
    if (total === 0) {
        return {
            x: 50,
            y: 50,
        };
    }

    const angle = index * (360 / total) - 90;
    const radius = 40;

    return {
        x:
            50 +
            radius *
                Math.cos(
                    (angle * Math.PI) / 180
                ),

        y:
            50 +
            radius *
                Math.sin(
                    (angle * Math.PI) / 180
                ),
    };
};

const createClockState = (frameCount) => ({
    frames: Array.from(
        {
            length: frameCount,
        },
        (_, index) => createFrame(index)
    ),

    handPosition: 0,
    moveCount: 0,
    isRunning: false,
    speed: 1,

    stats: {
        hits: 0,
        misses: 0,
    },

    accessHistory: [],
    algorithmSteps: [],
    activeRequest: null,
});

export default function PagingModule({
    state,
    setState,
    sharedActions,
    highlightedItem,
}) {
    const [clockState, setClockState] =
        useState(() =>
            createClockState(
                state.physicalMemory.length
            )
        );

    /*
    Reset local Clock state whenever the parent simulation
    is reset and physical memory becomes empty.
    */
    useEffect(() => {
        const parentMemoryIsEmpty =
            state.physicalMemory.every(
                (frame) => frame === null
            );

        const localMemoryHasPages =
            clockState.frames.some(
                (frame) => frame.page !== null
            );

        if (
            parentMemoryIsEmpty &&
            localMemoryHasPages &&
            state.processes.length === 0
        ) {
            setClockState(
                createClockState(
                    state.physicalMemory.length
                )
            );
        }
    }, [
        state.physicalMemory,
        state.processes.length,
        clockState.frames,
    ]);

    const allPages = useMemo(() => {
        const activePids = new Set(
            state.processes.map((process) =>
                String(process.pid)
            )
        );

        return Object.keys(state.pageTable)
            .filter((vpn) => {
                const pid = vpn.split('-')[0];
                return activePids.has(pid);
            })
            .sort((first, second) => {
                const [firstPid, firstPage] =
                    first.split('-').map(Number);

                const [secondPid, secondPage] =
                    second.split('-').map(Number);

                return (
                    firstPid - secondPid ||
                    firstPage - secondPage
                );
            });
    }, [state.pageTable, state.processes]);

    const getProcessName = (vpn) => {
        const pid = vpn.split('-')[0];

        return state.processes.some(
            (process) =>
                String(process.pid) === pid
        )
            ? `Process ${pid}`
            : 'Unknown';
    };

    const updateSpeed = (speed) => {
        setClockState((previous) => ({
            ...previous,
            speed,
        }));
    };

    const addStep = (message) => {
        setClockState((previous) => ({
            ...previous,

            algorithmSteps: [
                ...previous.algorithmSteps,
                message,
            ],
        }));
    };

    const addHistory = (entry) => {
        setClockState((previous) => ({
            ...previous,

            accessHistory: [
                ...previous.accessHistory,
                {
                    ...entry,
                    time: new Date().toLocaleTimeString(),
                },
            ],
        }));
    };

    const accessPage = async (vpn) => {
        if (clockState.isRunning) {
            return;
        }

        const page = {
            content: vpn,
            color: getPageColor(vpn),
        };

        const frameIndex =
            clockState.frames.findIndex(
                (frame) =>
                    frame.page?.content === vpn
            );

        setClockState((previous) => ({
            ...previous,
            isRunning: true,
            activeRequest: page,
        }));

        if (frameIndex !== -1) {
            await handlePageHit(
                vpn,
                frameIndex
            );

            return;
        }

        await handlePageFault(vpn, page);
    };

    const handlePageHit = async (
        vpn,
        frameIndex
    ) => {
        setClockState((previous) => ({
            ...previous,

            frames: previous.frames.map(
                (frame, index) =>
                    index === frameIndex
                        ? {
                              ...frame,
                              referenceBit: 1,
                              isActive: true,
                          }
                        : frame
            ),

            stats: {
                ...previous.stats,
                hits: previous.stats.hits + 1,
            },

            algorithmSteps: [
                ...previous.algorithmSteps,
                `Hit: ${vpn} found in frame ${frameIndex}. Reference bit changed to 1.`,
            ],

            accessHistory: [
                ...previous.accessHistory,
                {
                    pageId: vpn,
                    hit: true,
                    frame: frameIndex,
                    time: new Date().toLocaleTimeString(),
                },
            ],
        }));

        setState((previous) => ({
            ...previous,

            pageTable: {
                ...previous.pageTable,

                [vpn]: {
                    ...previous.pageTable[vpn],
                    referenced: true,
                },
            },
        }));

        await sleep(500 / clockState.speed);

        setClockState((previous) => ({
            ...previous,

            frames: previous.frames.map(
                (frame) => ({
                    ...frame,
                    isActive: false,
                })
            ),

            activeRequest: null,
            isRunning: false,
        }));
    };

    const handlePageFault = async (
        vpn,
        newPage
    ) => {
        setClockState((previous) => ({
            ...previous,

            stats: {
                ...previous.stats,
                misses:
                    previous.stats.misses + 1,
            },

            algorithmSteps: [
                ...previous.algorithmSteps,
                `Miss: ${vpn} is not in memory. Clock search starts at frame ${previous.handPosition}.`,
            ],

            accessHistory: [
                ...previous.accessHistory,
                {
                    pageId: vpn,
                    hit: false,
                    frame: null,
                    time: new Date().toLocaleTimeString(),
                },
            ],
        }));

        await runClockReplacement(
            vpn,
            newPage
        );

        setClockState((previous) => ({
            ...previous,
            isRunning: false,
            activeRequest: null,
        }));
    };

    const runClockReplacement = async (
        vpn,
        newPage
    ) => {
        let frames = clockState.frames.map(
            (frame) => ({
                ...frame,
                page: frame.page
                    ? { ...frame.page }
                    : null,
            })
        );

        let current =
            clockState.handPosition;

        while (true) {
            setClockState((previous) => ({
                ...previous,

                frames: previous.frames.map(
                    (frame, index) => ({
                        ...frame,
                        isActive:
                            index === current,
                    })
                ),
            }));

            await sleep(500 / clockState.speed);

            const frame = frames[current];

            if (frame.referenceBit === 0) {
                const oldPage =
                    frame.page?.content ?? null;

                addStep(
                    `Frame ${current} has reference bit 0. Replacing ${oldPage ?? 'empty frame'} with ${vpn}.`
                );

                frames[current] = {
                    ...frame,
                    page: newPage,
                    referenceBit: 1,
                    isActive: false,
                };

                const nextPosition =
                    (current + 1) %
                    frames.length;

                setClockState((previous) => ({
                    ...previous,
                    frames,
                    handPosition:
                        nextPosition,
                    moveCount:
                        previous.moveCount + 1,
                }));

                setState((previous) => {
                    const pageTable = {
                        ...previous.pageTable,
                    };

                    const physicalMemory = [
                        ...previous.physicalMemory,
                    ];

                    if (
                        oldPage &&
                        pageTable[oldPage]
                    ) {
                        pageTable[oldPage] = {
                            ...pageTable[oldPage],
                            present: false,
                            ppn: null,
                            referenced: false,
                        };
                    }

                    pageTable[vpn] = {
                        ...pageTable[vpn],
                        present: true,
                        ppn: current,
                        referenced: true,
                        modified: false,
                    };

                    physicalMemory[current] =
                        vpn;

                    return {
                        ...previous,
                        pageTable,
                        physicalMemory,
                    };
                });

                addHistory({
                    pageId: vpn,
                    hit: true,
                    frame: current,
                    loadedAfterFault: true,
                });

                addStep(
                    `${vpn} loaded into frame ${current}. Pointer moved to frame ${nextPosition}.`
                );

                break;
            }

            addStep(
                `Frame ${current} has reference bit 1. Giving it a second chance and changing the bit to 0.`
            );

            frames[current] = {
                ...frame,
                referenceBit: 0,
            };

            const nextPosition =
                (current + 1) %
                frames.length;

            setClockState((previous) => ({
                ...previous,
                frames,
                handPosition: nextPosition,
                moveCount:
                    previous.moveCount + 1,
            }));

            current = nextPosition;

            await sleep(300 / clockState.speed);
        }

        setClockState((previous) => ({
            ...previous,

            frames: previous.frames.map(
                (frame) => ({
                    ...frame,
                    isActive: false,
                })
            ),
        }));
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-1">
                        <section className="rounded-xl bg-gray-800 p-6 shadow-lg">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                                <button
                                    onClick={() =>
                                        sharedActions.createProcess()
                                    }
                                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-700"
                                >
                                    Add Process
                                </button>

                                <div className="flex items-center gap-3">
                                    <StatBox
                                        label="Hits"
                                        value={
                                            clockState
                                                .stats
                                                .hits
                                        }
                                        className="bg-blue-900/30"
                                    />

                                    <StatBox
                                        label="Misses"
                                        value={
                                            clockState
                                                .stats
                                                .misses
                                        }
                                        className="bg-red-900/30"
                                    />

                                    <div>
                                        <label
                                            htmlFor="clock-speed"
                                            className="mb-1 block text-xs"
                                        >
                                            Speed
                                        </label>

                                        <select
                                            id="clock-speed"
                                            value={
                                                clockState.speed
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSpeed(
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                )
                                            }
                                            disabled={
                                                clockState.isRunning
                                            }
                                            className="rounded bg-gray-700 px-2 py-1 text-xs disabled:opacity-50"
                                        >
                                            <option
                                                value={
                                                    0.5
                                                }
                                            >
                                                0.5x
                                            </option>
                                            <option
                                                value={
                                                    1
                                                }
                                            >
                                                1x
                                            </option>
                                            <option
                                                value={
                                                    1.5
                                                }
                                            >
                                                1.5x
                                            </option>
                                            <option
                                                value={
                                                    2
                                                }
                                            >
                                                2x
                                            </option>
                                            <option
                                                value={
                                                    3
                                                }
                                            >
                                                3x
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2 flex items-center justify-between">
                                <h2 className="font-semibold">
                                    Process Pages
                                </h2>

                                <span className="text-xs text-gray-400">
                                    {
                                        allPages.length
                                    }{' '}
                                    pages
                                </span>
                            </div>

                            <div className="flex min-h-12 flex-wrap gap-2">
                                {allPages.length ===
                                0 ? (
                                    <p className="text-xs italic text-gray-500">
                                        Create a
                                        process first
                                    </p>
                                ) : (
                                    allPages.map(
                                        (vpn) => {
                                            const inMemory =
                                                clockState.frames.some(
                                                    (
                                                        frame
                                                    ) =>
                                                        frame
                                                            .page
                                                            ?.content ===
                                                        vpn
                                                );

                                            return (
                                                <button
                                                    key={
                                                        vpn
                                                    }
                                                    onClick={() =>
                                                        accessPage(
                                                            vpn
                                                        )
                                                    }
                                                    disabled={
                                                        clockState.isRunning
                                                    }
                                                    className={`rounded-md px-3 py-2 text-xs font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${getPageColor(
                                                        vpn
                                                    )} ${
                                                        inMemory
                                                            ? 'opacity-100'
                                                            : 'opacity-70 hover:opacity-100'
                                                    }`}
                                                >
                                                    {
                                                        vpn
                                                    }
                                                </button>
                                            );
                                        }
                                    )
                                )}
                            </div>
                        </section>

                        <section className="h-[400px] overflow-hidden rounded-xl bg-gray-800 p-6 shadow-lg">
                            <h2 className="mb-4 text-xl font-semibold">
                                Page Table
                            </h2>

                            <div className="h-[330px] overflow-y-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-700 text-left">
                                            <th className="p-2">
                                                Process
                                            </th>
                                            <th className="p-2">
                                                VPN
                                            </th>
                                            <th className="p-2">
                                                PPN
                                            </th>
                                            <th className="p-2">
                                                Present
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {allPages.map(
                                            (vpn) => {
                                                const entry =
                                                    state
                                                        .pageTable[
                                                        vpn
                                                    ];

                                                const highlighted =
                                                    highlightedItem ===
                                                    vpn;

                                                return (
                                                    <tr
                                                        key={
                                                            vpn
                                                        }
                                                        className={`border-b border-gray-700 ${
                                                            highlighted
                                                                ? 'bg-blue-900/30'
                                                                : ''
                                                        }`}
                                                    >
                                                        <td className="p-2">
                                                            {getProcessName(
                                                                vpn
                                                            )}
                                                        </td>

                                                        <td className="p-2">
                                                            {
                                                                vpn
                                                            }
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
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6 lg:col-span-2">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <ClockView
                                clockState={
                                    clockState
                                }
                            />

                            <FrameList
                                clockState={
                                    clockState
                                }
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <LogPanel
                                title="Access History"
                                emptyMessage="No page accesses yet"
                                items={[
                                    ...clockState.accessHistory,
                                ].reverse()}
                                renderItem={(
                                    access,
                                    index
                                ) => (
                                    <div
                                        key={`${access.pageId}-${access.time}-${index}`}
                                        className={`rounded-lg px-3 py-2 ${
                                            access.hit
                                                ? 'bg-green-900/50 text-green-300'
                                                : 'bg-red-900/50 text-red-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Page{' '}
                                                {
                                                    access.pageId
                                                }
                                            </span>

                                            <span className="rounded bg-gray-700/50 px-2 py-1 text-xs">
                                                {access.hit
                                                    ? `Frame ${access.frame}`
                                                    : 'Page Fault'}
                                            </span>
                                        </div>

                                        <div className="mt-1 text-xs opacity-70">
                                            {
                                                access.time
                                            }
                                        </div>
                                    </div>
                                )}
                            />

                            <LogPanel
                                title="Algorithm Steps"
                                emptyMessage="Algorithm steps will appear here"
                                items={[
                                    ...clockState.algorithmSteps,
                                ].reverse()}
                                renderItem={(
                                    step,
                                    index
                                ) => (
                                    <div
                                        key={`${index}-${step}`}
                                        className={`rounded-lg px-3 py-2 ${
                                            step.startsWith(
                                                'Hit'
                                            )
                                                ? 'bg-blue-900/30 text-blue-300'
                                                : step.startsWith(
                                                        'Miss'
                                                    )
                                                  ? 'bg-purple-900/30 text-purple-300'
                                                  : 'bg-gray-700/50 text-gray-300'
                                        }`}
                                    >
                                        {step}
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({
    label,
    value,
    className,
}) {
    return (
        <div
            className={`rounded-lg px-4 py-1 text-center ${className}`}
        >
            <div className="text-sm font-bold opacity-70">
                {label}
            </div>

            <div className="text-sm font-bold">
                {value}
            </div>
        </div>
    );
}

function ClockView({ clockState }) {
    const frameCount =
        clockState.frames.length;

    const handRotation =
        frameCount === 0
            ? -90
            : clockState.handPosition *
                  (360 / frameCount) -
              90;

    return (
        <section className="rounded-xl bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-center text-xl font-semibold">
                Clock Visualization
            </h2>

            <div className="relative mx-auto aspect-square w-full max-w-xs">
                <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-blue-500/50">
                    {clockState.frames.map(
                        (frame, index) => {
                            const position =
                                getClockPosition(
                                    index,
                                    frameCount
                                );

                            return (
                                <motion.div
                                    key={
                                        frame.id
                                    }
                                    layout
                                    className={`absolute z-10 flex h-12 w-12 flex-col items-center justify-center rounded-md text-[10px] transition-all ${
                                        frame.page
                                            ? frame
                                                  .page
                                                  .color
                                            : 'bg-gray-700'
                                    } ${
                                        frame.isActive
                                            ? 'scale-110 ring-2 ring-yellow-400'
                                            : ''
                                    } ${
                                        clockState.handPosition ===
                                        index
                                            ? 'ring-2 ring-orange-400'
                                            : ''
                                    }`}
                                    style={{
                                        left: `${position.x}%`,
                                        top: `${position.y}%`,
                                        transform:
                                            'translate(-50%, -50%)',
                                    }}
                                >
                                    {frame.page
                                        ? frame
                                              .page
                                              .content
                                        : 'Empty'}

                                    <div className="mt-0.5 rounded bg-black/30 px-1 text-[9px]">
                                        R:
                                        {
                                            frame.referenceBit
                                        }
                                    </div>
                                </motion.div>
                            );
                        }
                    )}

                    <div
                        className="absolute left-1/2 top-1/2 z-0 h-0.5 w-1/2 origin-left bg-orange-500 transition-transform"
                        style={{
                            transform: `rotate(${handRotation}deg)`,
                            transitionDuration: `${
                                0.5 /
                                clockState.speed
                            }s`,
                        }}
                    />

                    <div className="absolute left-1/2 top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500" />
                </div>
            </div>
        </section>
    );
}

function FrameList({ clockState }) {
    return (
        <section className="rounded-xl bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
                Frame List
            </h2>

            <div className="max-h-[340px] space-y-3 overflow-y-auto pr-2">
                {clockState.frames.map(
                    (frame, index) => (
                        <div
                            key={frame.id}
                            className={`rounded-lg border p-3 transition-all ${
                                frame.isActive
                                    ? 'border-yellow-500 bg-yellow-900/20'
                                    : clockState.handPosition ===
                                        index
                                      ? 'border-orange-500 bg-orange-900/20'
                                      : 'border-gray-700'
                            }`}
                        >
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <div
                                        className={`mr-3 flex h-9 min-w-14 items-center justify-center rounded-md p-2 ${
                                            frame.page
                                                ? frame
                                                      .page
                                                      .color
                                                : 'bg-gray-700'
                                        }`}
                                    >
                                        {frame.page
                                            ? frame
                                                  .page
                                                  .content
                                            : 'Empty'}
                                    </div>

                                    <div>
                                        <div className="font-medium text-gray-100">
                                            Frame{' '}
                                            {
                                                frame.id
                                            }
                                        </div>

                                        <div className="text-sm text-gray-400">
                                            R:{' '}
                                            {
                                                frame.referenceBit
                                            }
                                        </div>
                                    </div>
                                </div>

                                {clockState.handPosition ===
                                    index && (
                                    <span className="rounded bg-orange-900/50 px-2 py-1 text-xs text-orange-400">
                                        Pointer
                                    </span>
                                )}

                                {frame.isActive &&
                                    clockState.handPosition !==
                                        index && (
                                        <span className="rounded bg-yellow-900/50 px-2 py-1 text-xs text-yellow-400">
                                            Examining
                                        </span>
                                    )}
                            </div>
                        </div>
                    )
                )}
            </div>
        </section>
    );
}

function LogPanel({
    title,
    items,
    emptyMessage,
    renderItem,
}) {
    return (
        <section className="h-[300px] overflow-hidden rounded-xl bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
                {title}
            </h2>

            <div className="h-[235px] space-y-2 overflow-y-auto pr-2 text-sm">
                {items.length > 0 ? (
                    items.map(renderItem)
                ) : (
                    <div className="p-2 text-sm italic text-gray-500">
                        {emptyMessage}
                    </div>
                )}
            </div>
        </section>
    );
}