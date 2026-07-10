import { DiskScheduler } from './DiskScheduler';
import {
    disk_fcfs_algo,
    sstf_algo,
    scan_algo,
    cscan_algo,
    look_algo,
    clook_algo,
} from './disk_algos.js';

export function DISK_FCFS() {
    return <DiskScheduler algoType="FCFS" algorithm={disk_fcfs_algo} />;
}

export function LOOK() {
    return <DiskScheduler algoType="LOOK" algorithm={look_algo} />;
}

export function SSTF() {
    return <DiskScheduler algoType="SSTF" algorithm={sstf_algo} />;
}

export function CSCAN() {
    return <DiskScheduler algoType="CSCAN" algorithm={cscan_algo} />;
}

export function CLOOK() {
    return <DiskScheduler algoType="CLOOK" algorithm={clook_algo} />;
}

export function SCAN() {
    return <DiskScheduler algoType="SCAN" algorithm={scan_algo} usesQuantum />;
}
