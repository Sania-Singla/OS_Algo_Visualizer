import DiskScheduler from './DiskScheduler';

function Algo(requests, head) {
    let total = 0;
    let movement = [head];

    for (let r of requests) {
        total += Math.abs(r - head);
        head = r;
        movement.push(head);
    }

    return { totalSeek: total, headMovement: movement };
}

export default function DISK_FCFS() {
    return <DiskScheduler algoType={'FCFS'} algorithm={Algo} />;
}
