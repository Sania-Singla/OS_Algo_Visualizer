import DiskScheduler from './DiskScheduler';

function Algo(requests, start) {
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

export default function LOOK() {
    return <DiskScheduler algoType={'LOOK'} algorithm={Algo} />;
}
