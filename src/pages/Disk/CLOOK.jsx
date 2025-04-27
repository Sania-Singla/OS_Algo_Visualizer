import DiskScheduler from './DiskScheduler';

function Algo(requests, head) {
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

export default function CLOOK() {
    return <DiskScheduler algoType={'CLOOK'} algorithm={Algo} />;
}
