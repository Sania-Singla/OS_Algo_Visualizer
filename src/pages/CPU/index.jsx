import { CPUScheduler } from './CpuScheduler';
import {
    fcfs_algo,
    srtf_algo,
    sjf_algo,
    priority_algo,
    priority_pre_algo,
    rr_algo,
} from './cpu_algos.js';

export function FCFS() {
    return <CPUScheduler algoType="FCFS" algorithm={fcfs_algo} />;
}

export function SJF() {
    return <CPUScheduler algoType="SJF" algorithm={sjf_algo} />;
}

export function SRTF() {
    return <CPUScheduler algoType="SRTF" algorithm={srtf_algo} />;
}

export function Priority() {
    return <CPUScheduler algoType="PRIORITY" algorithm={priority_algo} />;
}

export function PriorityPre() {
    return (
        <CPUScheduler
            algoType="PRIORITY_PREEMPTIVE"
            algorithm={priority_pre_algo}
        />
    );
}

export function RR() {
    return (
        <CPUScheduler algoType="ROUND_ROBIN" algorithm={rr_algo} usesQuantum />
    );
}
