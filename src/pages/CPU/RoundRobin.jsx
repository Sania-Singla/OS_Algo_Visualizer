import { useState, useEffect, useRef } from 'react';
import { ControlPanel, VisualizationArea } from '../../components';

export default function RoundRobin() {
    const [processes, setProcesses] = useState([]);
    const [ganttChart, setGanttChart] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [quantum, setQuantum] = useState(1);
    const [completed, setCompleted] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stats, setStats] = useState({
        totalProcesses: 0,
        completedProcesses: 0,
        avgWaitTime: 0,
        avgTurnaroundTime: 0,
    });

    const animationRef = useRef();

    const executeScheduler = () => {
        setProcesses((prevProcesses) => {
            const updatedProcesses = prevProcesses.map(p => ({ ...p }));
            const total = updatedProcesses.length;
            if (completed === total || total === 0) {
                setIsRunning(false);
                return prevProcesses;
            }

            let found = false;
            let index = currentIndex;

            for (let i = 0; i < total; i++) {
                const idx = (currentIndex + i) % total;
                const p = updatedProcesses[idx];
                if (p.arrivalTime <= currentTime && p.remainingTime > 0) {
                    found = true;
                    index = idx;
                    break;
                }
            }

            if (!found) {
                setGanttChart(prev => [
                    ...prev,
                    { start: currentTime, end: currentTime + 1, isIdle: true },
                ]);
                setCurrentTime(prev => prev + 1);
                return updatedProcesses;
            }

            const process = updatedProcesses[index];
            const execTime = Math.min(process.remainingTime, quantum);

            setGanttChart(prev => [
                ...prev,
                {
                    pid: process.pid,
                    start: currentTime,
                    end: currentTime + execTime,
                },
            ]);

            process.remainingTime -= execTime;

            if (process.remainingTime === 0) {
                process.completionTime = currentTime + execTime;
                setCompleted(prev => prev + 1);
            }

            setCurrentTime(prev => prev + execTime);
            setCurrentIndex((index + 1) % total);

            return updatedProcesses;
        });
    };

    const calculateStats = () => {
        const total = processes.length;
        let totalWaitingTime = 0;
        let totalTurnaroundTime = 0;

        processes.forEach(p => {
            const turnaround = (p.completionTime || 0) - p.arrivalTime;
            const waiting = turnaround - p.burstTime;
            totalTurnaroundTime += turnaround;
            totalWaitingTime += waiting;
        });

        setStats({
            totalProcesses: total,
            completedProcesses: completed,
            avgWaitTime: total ? +(totalWaitingTime / total).toFixed(2) : 0,
            avgTurnaroundTime: total ? +(totalTurnaroundTime / total).toFixed(2) : 0,
        });
    };

    useEffect(() => {
        if (isRunning) {
            animationRef.current = setTimeout(executeScheduler, 1000 / speed);
        } else {
            clearTimeout(animationRef.current);
        }
        return () => clearTimeout(animationRef.current);
    }, [isRunning, currentTime, currentIndex, completed, speed]);

    useEffect(() => {
        if (completed === processes.length && processes.length > 0) {
            calculateStats();
        }
    }, [completed, processes]);

    const resetSimulation = () => {
        setProcesses(processes.map(p => ({
            ...p,
            remainingTime: p.burstTime,
            completionTime: null,
        })));
        setGanttChart([]);
        setCurrentTime(0);
        setCompleted(0);
        setCurrentIndex(0);
        setStats({
            totalProcesses: processes.length,
            completedProcesses: 0,
            avgWaitTime: 0,
            avgTurnaroundTime: 0,
        });
        setIsRunning(false);
    };

    return (
        <div className="px-6 md:px-10 py-8 min-h-screen bg-gray-900 text-gray-200">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    Round Robin Scheduling (Quantum: {quantum})
                </h1>
                <p className="text-gray-400">
                    Processes execute for a fixed time slice before moving to the next
                </p>
            </div>

            {/* Quantum Control Panel */}
            <div className="items-center lg:absolute lg:top-10 lg:right-6 flex flex-col gap-1">
                <label className="text-gray-300 text-lg font-medium" htmlFor="arrival-time">
                    Quantum Size
                </label>
                <input
                    id="arrival-time"
                    type="number"
                    min="1"
                    placeholder="Enter Quantum"
                    value={quantum}
                    onChange={(e) =>
                        setQuantum(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-fit px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-16">
                <ControlPanel
                    speed={speed}
                    setSpeed={setSpeed}
                    isRunning={isRunning}
                    setIsRunning={setIsRunning}
                    processes={processes}
                    stats={stats}
                    setStats={setStats}
                    setProcesses={setProcesses}
                    setCurrentTime={setCurrentTime}
                    setGanttChart={setGanttChart}
                    currentTime={currentTime}
                    animationRef={animationRef}
                    quantum={quantum}
                    setQuantum={setQuantum}
                    resetSimulation={resetSimulation}
                />
                <VisualizationArea
                    ganttChart={ganttChart}
                    processes={processes}
                    currentTime={currentTime}
                />
            </div>
        </div>
    );
}
