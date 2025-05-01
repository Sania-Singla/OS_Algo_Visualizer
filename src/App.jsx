import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer, Header } from './components';
import { useNavigate } from 'react-router-dom';
import {
    FiCpu,
    FiHardDrive,
    FiLayers,
    FiClock,
    FiSettings,
    FiBarChart2,
    FiCode,
    FiAlertTriangle,
    FiLock,
    FiStar,
} from 'react-icons/fi';

const CPU_ALGOS = [
    {
        title: 'FCFS',
        description: 'First Come First Serve (Non-Preemptive)',
        icon: <FiClock size={24} />,
        color: 'from-sky-500 to-blue-600',
        path: '/cpu/fcfs',
    },
    {
        title: 'SJF',
        description: 'Shortest Job First (Non-Preemptive)',
        icon: <FiBarChart2 size={24} />,
        color: 'from-emerald-500 to-green-600',
        path: '/cpu/sjf',
    },
    {
        title: 'SRTF',
        description: 'Shortest Remaining Time First (Preemptive)',
        icon: <FiBarChart2 size={24} />,
        color: 'from-pink-500 to-rose-600',
        path: '/cpu/srtf',
    },
    {
        title: 'Priority (Non-Preemptive)',
        description: 'Executes based on priority',
        icon: <FiStar size={24} />,
        color: 'from-purple-500 to-violet-600',
        path: '/cpu/priority',
    },
    {
        title: 'Priority (Preemptive)',
        description: 'Can preempt based on priority',
        icon: <FiStar size={24} />,
        color: 'from-indigo-500 to-blue-700',
        path: '/cpu/priority-premptive',
    },
    {
        title: 'Round Robin',
        description: 'Uses time quantum (Preemptive)',
        icon: <FiClock size={24} />,
        color: 'from-cyan-500 to-teal-600',
        path: '/cpu/round-robin',
    },
];

const DISK_ALGOS = [
    {
        title: 'FCFS',
        description: 'First Come First Serve (Simple but inefficient)',
        icon: <FiClock size={24} />,
        color: 'from-gray-500 to-gray-600',
        path: '/disk/fcfs',
    },
    {
        title: 'SSTF',
        description: 'Shortest Seek Time First',
        icon: <FiSettings size={24} />,
        color: 'from-teal-500 to-cyan-600',
        path: '/disk/sstf',
    },
    {
        title: 'SCAN',
        description: 'Elevator algorithm (Bi-directional)',
        icon: <FiHardDrive size={24} />,
        color: 'from-fuchsia-500 to-pink-600',
        path: '/disk/scan',
    },
    {
        title: 'C-SCAN',
        description: 'Circular SCAN (More uniform wait)',
        icon: <FiHardDrive size={24} />,
        color: 'from-indigo-400 to-indigo-600',
        path: '/disk/cscan',
    },
    {
        title: 'LOOK',
        description: "Like SCAN but doesn't go to end",
        icon: <FiHardDrive size={24} />,
        color: 'from-blue-400 to-sky-600',
        path: '/disk/look',
    },
    {
        title: 'C-LOOK',
        description: 'Circular version of LOOK',
        icon: <FiHardDrive size={24} />,
        color: 'from-emerald-400 to-green-500',
        path: '/disk/clook',
    },
];

const MEMORY_ALGOS = [
    {
        title: 'Virtual Memory Management',
        description: 'Paging, Page Replacement and Thrashing',
        icon: <FiCpu size={24} />,
        color: 'from-blue-500 to-blue-600',
        path: '/memory/paging',
    },
    {
        title: 'Memory Allocation for kernal',
        description: 'Buddy Allocator',
        icon: <FiCpu size={24} />,
        color: 'from-pink-500 to-rose-700',
        path: '/memory/buddy',
    },
];

const DEADLOCK_ALGOS = [
    {
        title: "Banker's Algorithm",
        description: 'Deadlock avoidance algorithm',
        icon: <FiLock size={24} />,
        color: 'from-rose-500 to-red-600',
        path: '/deadlock/bankers',
    },
];

const AlgorithmCard = ({ algo }) => {
    const navigate = useNavigate();
    const { title, description, icon, color, path } = algo;
    return (
        <motion.div
            onClick={() => navigate(path)}
            whileHover={{ y: -5, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg cursor-pointer`}
        >
            <div className="flex items-center mb-4">
                <div className="p-3 text-black rounded-lg bg-white bg-opacity-20 backdrop-blur-sm mr-4">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <p className="text-white text-opacity-80">{description}</p>
        </motion.div>
    );
};

const AlgorithmTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'cpu', label: 'CPU Scheduling', icon: <FiCpu size={18} /> },
        {
            id: 'disk',
            label: 'Disk Scheduling',
            icon: <FiHardDrive size={18} />,
        },
        { id: 'memory', label: 'Memory', icon: <FiLayers size={18} /> },
        {
            id: 'deadlock',
            label: 'Deadlock',
            icon: <FiAlertTriangle size={18} />,
        },
    ];

    return (
        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`cursor-pointer relative px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id
                            ? 'text-white'
                            : 'text-gray-400 hover:text-gray-300'
                    }`}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-full"
                            transition={{
                                type: 'spring',
                                bounce: 0.2,
                                duration: 0.6,
                            }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

export default function App() {
    const [activeTab, setActiveTab] = useState('cpu');

    function getCurrentAlgorithms() {
        switch (activeTab) {
            case 'cpu':
                return CPU_ALGOS;
            case 'disk':
                return DISK_ALGOS;
            case 'memory':
                return MEMORY_ALGOS;
            case 'deadlock':
                return DEADLOCK_ALGOS;
            default:
                return CPU_ALGOS;
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white px-6 md:px-10 py-8">
            <Header />

            <main className="px-4 overflow-auto">
                <AlgorithmTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getCurrentAlgorithms().map((algorithm, index) => (
                                <motion.div
                                    key={algorithm.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        transition: { delay: index * 0.1 },
                                    }}
                                >
                                    <AlgorithmCard algo={algorithm} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
}
