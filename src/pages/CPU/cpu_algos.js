const comparePid = (a, b) =>
    String(a.pid).localeCompare(String(b.pid), undefined, {
        numeric: true,
    });

/*
Each algorithm returns:

{
    process: selected process,
    executionTime: how long it should execute,
    nextIndex?: required by Round Robin
}
*/

export function fcfs_algo({ arrivedProcesses }) {
    const sorted = [...arrivedProcesses].sort(
        (a, b) => a.arrivalTime - b.arrivalTime || comparePid(a, b)
    );

    const process = sorted[0];

    return {
        process,
        executionTime: process.remainingTime,
    };
}

export function sjf_algo({ arrivedProcesses }) {
    const sorted = [...arrivedProcesses].sort(
        (a, b) =>
            a.burstTime - b.burstTime ||
            a.arrivalTime - b.arrivalTime ||
            comparePid(a, b)
    );

    const process = sorted[0];

    return {
        process,
        executionTime: process.remainingTime,
    };
}

export function srtf_algo({ arrivedProcesses }) {
    const sorted = [...arrivedProcesses].sort(
        (a, b) =>
            a.remainingTime - b.remainingTime ||
            a.arrivalTime - b.arrivalTime ||
            comparePid(a, b)
    );

    return {
        process: sorted[0],
        executionTime: 1,
    };
}

export function priority_algo({ arrivedProcesses }) {
    const sorted = [...arrivedProcesses].sort(
        (a, b) =>
            a.priority - b.priority ||
            a.arrivalTime - b.arrivalTime ||
            comparePid(a, b)
    );

    const process = sorted[0];

    return {
        process,
        executionTime: process.remainingTime,
    };
}

export function priority_pre_algo({ arrivedProcesses }) {
    const sorted = [...arrivedProcesses].sort(
        (a, b) =>
            a.priority - b.priority ||
            a.arrivalTime - b.arrivalTime ||
            comparePid(a, b)
    );

    return {
        process: sorted[0],
        executionTime: 1,
    };
}

export function rr_algo({ processes, currentTime, currentIndex, quantum }) {
    const totalProcesses = processes.length;

    for (let offset = 0; offset < totalProcesses; offset++) {
        const index = (currentIndex + offset) % totalProcesses;
        const process = processes[index];

        if (process.arrivalTime <= currentTime && process.remainingTime > 0) {
            return {
                process,
                executionTime: Math.min(quantum, process.remainingTime),
                nextIndex: (index + 1) % totalProcesses,
            };
        }
    }

    return null;
}
