import { useState, useEffect, useRef } from 'react';
import { ControlPanel, VisualizationArea } from '../../components';

export default function SJF() {
    const [processes, setProcesses] = useState([]);
    const [ganttChart, setGanttChart] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [stats, setStats] = useState({
        totalProcesses: processes.length,
        completedProcesses: 0,
        avgWaitTime: 0,
        avgTurnaroundTime: 0,
    });
    const animationRef = useRef();

    const executeScheduler = () => {
        const updatedProcesses = [...processes];
        const arrivedProcesses = updatedProcesses.filter(
            (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
        );

        // Check if all processes are completed
        if (updatedProcesses.every((p) => p.remainingTime === 0)) {
            setIsRunning(false);
            return;
        }

        if (arrivedProcesses.length === 0) {
            // No process has arrived yet -> CPU Idle
            setGanttChart((prev) => [
                ...prev,
                {
                    start: currentTime,
                    isIdle: true,
                    end: currentTime + 1,
                },
            ]);
            setCurrentTime((prev) => prev + 1);
            return;
        }

        // Find process with shortest burst time (SJF non-preemptive)
        const currentProcess = arrivedProcesses.reduce((prev, curr) =>
            prev.burstTime < curr.burstTime ? prev : curr
        );

        // Calculate execution time (entire burst time for non-preemptive)
        const executionTime = currentProcess.burstTime;

        // Update Gantt chart
        setGanttChart((prev) => [
            ...prev,
            {
                pid: currentProcess.pid,
                start: currentTime,
                end: currentTime + executionTime,
            },
        ]);

        // Update waiting times for other processes
        const updatedWithWaitingTimes = updatedProcesses.map((p) => {
            if (
                p.pid !== currentProcess.pid &&
                p.arrivalTime <= currentTime &&
                p.remainingTime > 0
            ) {
                return { ...p, waitingTime: p.waitingTime + executionTime };
            }
            return p;
        });

        // Update processes (complete current process)
        const newProcesses = updatedWithWaitingTimes.map((p) => {
            if (p.pid === currentProcess.pid) {
                return { ...p, remainingTime: 0 };
            }
            return p;
        });

        setProcesses(newProcesses);

        // Update statistics
        const completedProcesses = newProcesses.filter(
            (p) => p.remainingTime === 0
        );
        const countCompleted = completedProcesses.length;

        if (countCompleted > 0) {
            const totalWaitTime = completedProcesses.reduce(
                (sum, p) => sum + p.waitingTime,
                0
            );

            const totalTurnaroundTime = completedProcesses.reduce(
                (sum, p) => sum + (p.waitingTime + p.burstTime),
                0
            );

            setStats({
                totalProcesses: newProcesses.length,
                completedProcesses: countCompleted,
                avgWaitTime: parseFloat(
                    (totalWaitTime / countCompleted).toFixed(2)
                ),
                avgTurnaroundTime: parseFloat(
                    (totalTurnaroundTime / countCompleted).toFixed(2)
                ),
            });
        }

        setCurrentTime((prev) => prev + executionTime);
    };

    useEffect(() => {
        if (isRunning) {
            animationRef.current = setTimeout(executeScheduler, 1000 / speed);
        }
        return () => clearTimeout(animationRef.current);
    }, [isRunning, currentTime, processes, speed]);

    return (
        <div className="px-6 md:px-10 py-8 min-h-screen bg-gray-900 text-gray-200">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    Shortest Job First (Non-Preemptive) Scheduling
                </h1>
                <p className="text-gray-400">
                    Watch processes get impatient as they wait!
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
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
