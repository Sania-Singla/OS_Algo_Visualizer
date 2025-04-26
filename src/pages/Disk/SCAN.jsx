import DiskScheduler from './DiskScheduler';

function Algo(requests, head, diskEnd = 199) {
    let total = 0;
    let movement = [head];
    let left = [],
        right = [];

    for (let r of requests) {
        if (r >= head) right.push(r);
        else left.push(r);
    }

    right.sort((a, b) => a - b);
    left.sort((a, b) => b - a);

    for (let r of right) {
        total += Math.abs(r - head);
        head = r;
        movement.push(head);
    }

    if (head !== diskEnd) {
        total += Math.abs(diskEnd - head);
        head = diskEnd;
        movement.push(head);
    }

    for (let l of left) {
        total += Math.abs(l - head);
        head = l;
        movement.push(head);
    }

    return { totalSeek: total, headMovement: movement };
}

export default function SCAN() {
    return <DiskScheduler algoType={'SCAN'} algorithm={Algo} />;
}
