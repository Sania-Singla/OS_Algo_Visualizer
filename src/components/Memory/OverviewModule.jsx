import { motion } from 'framer-motion';

export default function OverviewModule({
    state,
    setState,
    sharedActions,
    highlightedItem,
}) {
    const startDemo = async () => {
        sharedActions.highlightItem({ type: 'module', id: 'process' });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        sharedActions.highlightItem({ type: 'module', id: 'paging' });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        sharedActions.highlightItem({ type: 'module', id: 'buddy' });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        sharedActions.highlightItem({ type: 'module', id: 'slab' });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        sharedActions.highlightItem({ type: 'module', id: 'thrashing' });
    };

    return (
        <div className="text-white bg-gray-900 min-h-screen p-6 rounded-lg">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
            >
                <div className="border border-indigo-600 rounded-lg py-4 px-6 bg-gradient-to-br from-gray-800 to-gray-700">
                    <h3 className="font-bold text-xl text-blue-300 mb-3">
                        System Summary
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                        <li>Processes: {state.processes.length}</li>
                        <li>
                            Physical Memory:{' '}
                            {state.physicalMemory.filter((p) => p).length}/
                            {state.physicalMemory.length} pages used
                        </li>
                        <li>
                            Slab Caches:{' '}
                            {Object.keys(state.slabAllocators).length}
                        </li>
                        <li>Buddy Allocations: {state.allocations.length}</li>
                    </ul>
                </div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="border border-green-500 rounded-lg p-6 bg-gradient-to-br from-green-700 to-green-500 text-white cursor-pointer"
                    onClick={startDemo}
                >
                    <h3 className="font-bold text-xl mb-3">Quick Demo</h3>
                    <p>
                        Click here to see a quick walkthrough of memory
                        management flow
                    </p>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <ModuleCard
                    title="Process & Virtual Memory"
                    module="process"
                    description="How processes request and use memory"
                    highlighted={
                        highlightedItem?.type === 'module' &&
                        highlightedItem.id === 'process'
                    }
                />
                <ModuleCard
                    title="Paging & Page Replacement"
                    module="paging"
                    description="Virtual memory and demand paging"
                    highlighted={
                        highlightedItem?.type === 'module' &&
                        highlightedItem.id === 'paging'
                    }
                />
                <ModuleCard
                    title="Buddy Allocator"
                    module="buddy"
                    description="Physical memory allocation"
                    highlighted={
                        highlightedItem?.type === 'module' &&
                        highlightedItem.id === 'buddy'
                    }
                />
                <ModuleCard
                    title="Slab Allocator"
                    module="slab"
                    description="Kernel object caching"
                    highlighted={
                        highlightedItem?.type === 'module' &&
                        highlightedItem.id === 'slab'
                    }
                />
                <ModuleCard
                    title="Thrashing"
                    module="thrashing"
                    description="When memory demand exceeds capacity"
                    highlighted={
                        highlightedItem?.type === 'module' &&
                        highlightedItem.id === 'thrashing'
                    }
                />
            </motion.div>
        </div>
    );
}

const ModuleCard = ({ title, module, description, highlighted }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`border rounded-lg p-6 cursor-pointer transition-all transform ${
                highlighted
                    ? 'ring-4 ring-orange-400 bg-gray-800 text-orange-300'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-600'
            }`}
        >
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm">{description}</p>
        </motion.div>
    );
};
