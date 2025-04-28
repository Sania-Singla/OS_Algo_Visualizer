import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-800 text-center text-gray-500"
        >
            <p>© {new Date().getFullYear()} VisualOS. All rights reserved.</p>
        </motion.footer>
    );
}
