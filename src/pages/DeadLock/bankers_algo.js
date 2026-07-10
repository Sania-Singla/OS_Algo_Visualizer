export function computeNeed(max, allocated) {
    return max.map((m, i) => m - (allocated[i] || 0));
}

export function initProcesses(noOfProcesses, noOfResources) {
    return Array.from({ length: noOfProcesses }, () => ({
        max: Array(noOfResources).fill(0),
        allocated: Array(noOfResources).fill(0),
        need: Array(noOfResources).fill(0),
    }));
}

/**
 * Runs the safety algorithm.
 * Returns { isSafe: boolean, sequence: number[] }
 */
export function runSafetyAlgorithm(
    processes,
    available,
    noOfProcesses,
    noOfResources
) {
    const work = [...available];
    const finish = Array(noOfProcesses).fill(false);
    const sequence = [];
    let proceed = true;

    while (proceed) {
        proceed = false;
        for (let i = 0; i < noOfProcesses; i++) {
            if (!finish[i]) {
                let canProceed = true;
                for (let j = 0; j < noOfResources; j++) {
                    if (processes[i].need[j] > work[j]) {
                        canProceed = false;
                        break;
                    }
                }
                if (canProceed) {
                    for (let j = 0; j < noOfResources; j++) {
                        work[j] += processes[i].allocated[j];
                    }
                    finish[i] = true;
                    sequence.push(i);
                    proceed = true;
                }
            }
        }
    }

    return {
        isSafe: finish.every(Boolean),
        sequence: finish.every(Boolean) ? sequence : [],
    };
}

/**
 * Attempts a resource request for a given process.
 * Returns { granted: boolean, reason?: string, updatedProcesses?, updatedAvailable?, safeSequence? }
 */
export function requestResources(
    processes,
    available,
    pid,
    request,
    noOfProcesses,
    noOfResources
) {
    const tempProcesses = JSON.parse(JSON.stringify(processes));
    const tempAvailable = [...available];

    for (let i = 0; i < noOfResources; i++) {
        if (request[i] > tempProcesses[pid].need[i]) {
            return {
                granted: false,
                reason: "Request exceeds the process's needs.",
            };
        }
        if (request[i] > tempAvailable[i]) {
            return {
                granted: false,
                reason: 'Not enough resources available.',
            };
        }
    }

    for (let i = 0; i < noOfResources; i++) {
        tempAvailable[i] -= request[i];
        tempProcesses[pid].allocated[i] += request[i];
        tempProcesses[pid].need[i] -= request[i];
    }

    const { isSafe, sequence } = runSafetyAlgorithm(
        tempProcesses,
        tempAvailable,
        noOfProcesses,
        noOfResources
    );

    if (!isSafe) {
        return { granted: false, reason: 'Would lead to an unsafe state.' };
    }

    return {
        granted: true,
        updatedProcesses: tempProcesses,
        updatedAvailable: tempAvailable,
        safeSequence: sequence,
    };
}

// Classic textbook example (5 processes, 3 resource types) — safe sequence exists: P1 → P3 → P4 → P0 → P2
export const DEMO_DATA = {
    noOfProcesses: 5,
    noOfResources: 3,
    available: [3, 3, 2],
    processes: [
        { max: [7, 5, 3], allocated: [0, 1, 0], need: [7, 4, 3] },
        { max: [3, 2, 2], allocated: [2, 0, 0], need: [1, 2, 2] },
        { max: [9, 0, 2], allocated: [3, 0, 2], need: [6, 0, 0] },
        { max: [2, 2, 2], allocated: [2, 1, 1], need: [0, 1, 1] },
        { max: [4, 3, 3], allocated: [0, 0, 2], need: [4, 3, 1] },
    ],
};
