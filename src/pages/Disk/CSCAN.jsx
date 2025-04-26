import DiskScheduler from './DiskScheduler';

function Algo(requests, head, diskEnd = 199) {
    let totalSeek = 0;
    const sorted = [...requests].sort((a, b) => a - b);
    const right = sorted.filter((req) => req >= head);
    const left = sorted.filter((req) => req < head);
    const headMovement = [head];

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
        totalSeek += diskEnd; // Because we're moving from diskEnd to 0
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

export default function CSCAN() {
    return <DiskScheduler algoType={'CSCAN'} algorithm={Algo} />;
}
