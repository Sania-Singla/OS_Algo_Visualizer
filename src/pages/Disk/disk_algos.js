export function disk_fcfs_algo(requests, head) {
    let totalSeek = 0;
    let headMovement = [head];

    for (let r of requests) {
        totalSeek += Math.abs(r - head);
        head = r;
        headMovement.push(head);
    }

    return { totalSeek, headMovement };
}

export function cscan_algo(requests, head) {
    let totalSeek = 0;
    const sorted = [...requests].sort((a, b) => a - b);
    const right = sorted.filter((req) => req >= head);
    const left = sorted.filter((req) => req < head);
    const headMovement = [head];

    let diskEnd = Math.max(...requests) + 50;

    // Process requests to the right (increasing order)
    for (let r of right) {
        totalSeek += Math.abs(r - head);
        head = r;
        headMovement.push(head);
    }

    // Only go to diskEnd if there are requests in the left half
    if (left.length > 0) {
        if (head !== diskEnd) {
            totalSeek += Math.abs(diskEnd - head);
            headMovement.push(diskEnd);
        }

        // Jump to 0 (start of disk)
        totalSeek += diskEnd; 
        headMovement.push(0);
        head = 0;

        // Process left requests (in increasing order)
        for (let l of left) {
            totalSeek += Math.abs(l - head);
            head = l;
            headMovement.push(head);
        }
    }

    return { totalSeek, headMovement };
}

export function look_algo(requests, start) {
    let head = start;
    let totalSeek = 0;
    const sorted = [...requests].sort((a, b) => a - b);
    const right = sorted.filter((req) => req >= head);
    const left = sorted.filter((req) => req < head);
    const headMovement = [head];

    for (let r of right) {
        totalSeek += Math.abs(r - head);
        head = r;
        headMovement.push(head);
    }

    left.sort((a, b) => b - a); // Descending

    for (let l of left) {
        totalSeek += Math.abs(head - l);
        head = l;
        headMovement.push(head);
    }

    return { totalSeek, headMovement };
}

export function scan_algo(requests, head) {
    let totalSeek = 0;
    let headMovement = [head];
    let left = [],
        right = [];

    for (let r of requests) {
        if (r >= head) right.push(r);
        else left.push(r);
    }

    right.sort((a, b) => a - b);
    left.sort((a, b) => b - a);

    let diskEnd = Math.max(...requests) + 50; // max of all requests + 50

    // move right first
    for (let r of right) {
        totalSeek += Math.abs(r - head);
        head = r;
        headMovement.push(head);
    }

    if (head !== diskEnd && totalSeek > 0) {
        totalSeek += Math.abs(diskEnd - head);
        head = diskEnd;
        headMovement.push(head);
    }

    for (let l of left) {
        totalSeek += Math.abs(l - head);
        head = l;
        headMovement.push(head);
    }

    return { totalSeek, headMovement };
}

export function sstf_algo(requests, head) {
    let totalSeek = 0;
    let headMovement = [head];

    while (requests.length) {
        let closest = requests.reduce((prev, curr) =>
            Math.abs(curr - head) < Math.abs(prev - head) ? curr : prev
        );
        totalSeek += Math.abs(closest - head);
        head = closest;
        headMovement.push(head);
        requests = requests.filter((r) => r !== closest);
    }

    return { totalSeek, headMovement };
}

export function clook_algo(requests, head) {
    let totalSeek = 0;
    const sorted = [...requests].sort((a, b) => a - b);
    const right = sorted.filter((req) => req >= head);
    const left = sorted.filter((req) => req < head);
    const headMovement = [head];

    // Process all requests to the right (increasing order)
    for (let r of right) {
        totalSeek += Math.abs(r - head);
        head = r;
        headMovement.push(head);
    }

    // If there are left requests, jump to the first one (without processing it yet)
    if (left.length > 0) {
        totalSeek += Math.abs(head - left[0]);
        head = left[0];
        headMovement.push(head);

        // Process remaining left requests (starting from index 1)
        for (let i = 1; i < left.length; i++) {
            totalSeek += Math.abs(left[i] - head);
            head = left[i];
            headMovement.push(head);
        }
    }

    return { totalSeek, headMovement };
}
