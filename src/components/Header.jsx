import { motion } from 'framer-motion';
import { FiGithub } from 'react-icons/fi';

export default function Header() {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-4 pt-2 pb-10"
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-3xl lg:text-4xl py-1 font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        VisualOS
                    </h1>
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
                <p className="text-gray-400 mt-2">
                    Interactive visualizations for operating system algorithms
                </p>
            </div>
        </motion.header>
    );
}
