import { motion } from 'framer-motion';
import { FiGithub } from 'react-icons/fi';

export default function Header() {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-4 pt-2 pb-6 sm:pb-10"
        >
            <div className="flex flex-col sm:flex-row gap-6 justify-between text-center items-center">
                <div className="w-full flex flex-col items-center sm:items-start">
                    <h1 className="text-3xl lg:text-4xl py-1 font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        Algorithm Visualizer
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Interactive visualizations for operating system
                        algorithms
                    </p>
                </div>
                <a
                    href="https://github.com/Sania-Singla/OS_Algo_Visualizer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                    <FiGithub size={18} />
                    <span>GitHub</span>
                </a>
            </div>
        </motion.header>
    );
}
