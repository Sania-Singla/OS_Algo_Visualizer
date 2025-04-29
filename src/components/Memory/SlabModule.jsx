import { motion, AnimatePresence } from 'framer-motion';

export default function SlabModule({ state, setState, sharedActions, highlightedItem }) {
  const allocateObject = (cacheName) => {
    const slabCache = state.slabAllocators[cacheName];

    // Find existing slab with free space
    for (const slab of slabCache.slabs) {
      const freeObjIndex = slab.objects.findIndex(obj => obj.isFree);
      if (freeObjIndex !== -1) {
        slab.objects[freeObjIndex].isFree = false;
        setState(prev => ({ ...prev }));
        sharedActions.highlightItem({
          type: 'slab-alloc',
          id: `${cacheName}-${slab.id}-${freeObjIndex}`
        });
        return;
      }
    }

    // No space, create new slab
    const newSlab = {
      id: Math.random().toString(36).substr(2, 5),
      objects: Array(4).fill().map(() => ({ isFree: true }))
    };
    newSlab.objects[0].isFree = false;

    setState(prev => ({
      ...prev,
      slabAllocators: {
        ...prev.slabAllocators,
        [cacheName]: {
          slabs: [...prev.slabAllocators[cacheName].slabs, newSlab]
        }
      }
    }));

    sharedActions.highlightItem({
      type: 'slab-new',
      id: `${cacheName}-${newSlab.id}`
    });
  };

  const deallocateObject = (cacheName, slabId, objIndex) => {
    setState(prev => {
      const updatedSlabs = prev.slabAllocators[cacheName].slabs.map(slab => {
        if (slab.id === slabId) {
          const updatedObjects = [...slab.objects];
          updatedObjects[objIndex].isFree = true;
          return { ...slab, objects: updatedObjects };
        }
        return slab;
      });

      return {
        ...prev,
        slabAllocators: {
          ...prev.slabAllocators,
          [cacheName]: { slabs: updatedSlabs }
        }
      };
    });

    sharedActions.highlightItem({
      type: 'slab-free',
      id: `${cacheName}-${slabId}-${objIndex}`
    });
  };

  return (
    <div className='text-white'>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold mb-4"
      >
        Slab Allocator
      </motion.h2>

      <motion.div
        layout
        className="space-y-6"
      >
        {Object.entries(state.slabAllocators).map(([cacheName, cache]) => (
          <motion.div
            key={cacheName}
            layout
            className="border rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Cache: {cacheName}</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => allocateObject(cacheName)}
                className="px-3 py-1 text-black bg-green-100 hover:bg-green-200 rounded text-sm"
              >
                Allocate Object
              </motion.button>
            </div>

            {cache.slabs.length === 0 ? (
              <p className="text-gray-500">No slabs allocated yet</p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {cache.slabs.map(slab => (
                    <motion.div
                      key={slab.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border rounded p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Slab {slab.id}</span>
                        <span className="text-sm text-gray-600">
                          {slab.objects.filter(o => !o.isFree).length}/{slab.objects.length} used
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {slab.objects.map((obj, i) => {
                          const objId = `${cacheName}-${slab.id}-${i}`;
                          const isHighlighted = highlightedItem?.id === objId;

                          return (
                            <motion.div
                              key={i}
                              layout
                              whileHover={{ scale: obj.isFree ? 1 : 1.1 }}
                              onClick={() => !obj.isFree && deallocateObject(cacheName, slab.id, i)}
                              initial={{ scale: 0.8 }}
                              animate={{
                                scale: isHighlighted ? 1.2 : 1,
                                backgroundColor:
                                  isHighlighted && highlightedItem.type === 'slab-alloc' ? 'rgba(187, 247, 208, 1)' :
                                  isHighlighted && highlightedItem.type === 'slab-free' ? 'rgba(254, 202, 202, 1)' :
                                  isHighlighted && highlightedItem.type === 'slab-new' ? 'rgba(254, 249, 195, 1)' :
                                  obj.isFree ? 'rgba(229, 231, 235, 1)' : 'rgba(216, 180, 254, 1)'
                              }}
                              transition={{ type: 'spring', stiffness: 500 }}
                              className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer`}
                            >
                              {!obj.isFree && 'X'}
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
