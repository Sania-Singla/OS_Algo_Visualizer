import DiskScheduler from './DiskScheduler';

function Algo(requests, head) {
    let total = 0;
    let movement = [head];
    let req = [...requests];

    while (req.length) {
        let closest = req.reduce((prev, curr) =>
            Math.abs(curr - head) < Math.abs(prev - head) ? curr : prev
        );
        total += Math.abs(closest - head);
        head = closest;
        movement.push(head);
        req = req.filter((r) => r !== closest);
    }

    return { totalSeek: total, headMovement: movement };
}

export default function SSTF() {
    return <DiskScheduler algoType={'SSTF'} algorithm={Algo} />;
}
