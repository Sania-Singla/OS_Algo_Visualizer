import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {
    RouterProvider,
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    Outlet,
} from 'react-router-dom';

import { SCAN, CSCAN, LOOK, DISK_FCFS, SSTF, CLOOK } from './pages/Disk';
import {
    FCFS,
    SJF,
    SRTF,
    RoundRobin,
    Priority,
    PriorityPreemptive,
} from './pages/CPU';
import {  MemoryVisualiser, BuddyModule } from './pages/Memory';
import { Bankers } from './pages/DeadLock';
import { DiningPhilosopher } from './pages/Sync';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="" element={<Outlet />}>
            <Route path="/" element={<App />} />

            <Route path="/disk">
                <Route path="look" element={<LOOK />} />
                <Route path="clook" element={<CLOOK />} />
                <Route path="scan" element={<SCAN />} />
                <Route path="cscan" element={<CSCAN />} />
                <Route path="fcfs" element={<DISK_FCFS />} />
                <Route path="sstf" element={<SSTF />} />
            </Route>

            <Route path="/cpu">
                <Route path="fcfs" element={<FCFS />} />
                <Route path="srtf" element={<SRTF />} />
                <Route path="sjf" element={<SJF />} />
                <Route path="round-robin" element={<RoundRobin />} />
                <Route path="priority" element={<Priority />} />
                <Route
                    path="priority-premptive"
                    element={<PriorityPreemptive />}
                />
            </Route>

            <Route path="/sync">
                <Route
                    path="dining-philosopher"
                    element={<DiningPhilosopher />}
                />
            </Route>

            <Route path="/memory">
                {/* <Route path="lru" element={<LRU />} />
                <Route path="opr" element={<OPR />} />
                <Route path="clock" element={<ClockAlgorithm />} /> */}
                <Route path="paging" element={<MemoryVisualiser />} />
                <Route path="buddy" element={<BuddyModule />} />

            </Route>

            <Route path="/deadlock">
                <Route path="bankers" element={<Bankers />} />
            </Route>
        </Route>
    )
);

createRoot(document.getElementById('root')).render(
    // <StrictMode>
    <RouterProvider router={router} />
    // </StrictMode>,
);
