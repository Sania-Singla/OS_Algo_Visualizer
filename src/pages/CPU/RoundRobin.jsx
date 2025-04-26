import { useState, useEffect, useRef } from 'react';
import { PROCESSES } from '../../constants/processes';
import { ControlPanel, VisualizationArea } from '../../pages/General';

export default function RoundRobin() {
    const [processes, setProcesses] = useState(PROCESSES);
    const [ganttChart, setGanttChart] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [quantum, setQuantum] = useState(1);
    const [stats, setStats] = useState({
        totalProcesses: PROCESSES.length,
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

        if (arrivedProcesses.length === 0) {
            setCurrentTime((prev) => prev + 1);
            return;
        }

        const currentProcess = arrivedProcesses[0]; // Round Robin: first arrived process
        const timeSlice = Math.min(currentProcess.remainingTime, quantum);
        setGanttChart((prev) => [
            ...prev,
            {
                pid: currentProcess.pid,
                start: currentTime,
                end: currentTime + timeSlice,
            },
        ]);

        setProcesses((prev) =>
            prev.map((p) => {
                if (p.pid === currentProcess.pid) {
                    return { ...p, remainingTime: p.remainingTime - timeSlice };
                }
                return p;
            })
        );

        if (currentProcess.remainingTime === timeSlice) {
            const completedProcesses = updatedProcesses.filter(
                (p) => p.remainingTime === 0
            ).length;
            const avgWaitTime =
                completedProcesses > 0
                    ? updatedProcesses.reduce(
                          (sum, p) => sum + (p.waitingTime + p.burstTime),
                          0
                      ) / completedProcesses
                    : 0;
            const avgTurnaroundTime =
                completedProcesses > 0
                    ? updatedProcesses.reduce(
                          (sum, p) => sum + p.waitingTime,
                          0
                      ) / completedProcesses
                    : 0;

            setStats({
                totalProcesses: updatedProcesses.length,
                completedProcesses,
                avgWaitTime: parseFloat(avgWaitTime.toFixed(2)),
                avgTurnaroundTime: parseFloat(avgTurnaroundTime.toFixed(2)),
            });
        }

        setCurrentTime((prev) => prev + timeSlice);
    };

    useEffect(() => {
        if (isRunning) {
            animationRef.current = setTimeout(executeScheduler, 1000 / speed);
        }
        return () => clearTimeout(animationRef.current);
    }, [isRunning, currentTime, processes, speed]);

    return (
        <div className="px-10 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                    Round Robin Scheduling
                </h1>
                <p className="text-gray-600">
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
