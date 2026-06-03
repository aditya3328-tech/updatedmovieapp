import { motion } from 'framer-motion';

export default function LoadingSkeleton({ count = 6, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-full aspect-[2/3] bg-gradient-to-br from-gray-700/40 to-gray-800/40 rounded-lg skeleton"
          />
        ))}
      </div>
    );
  }

  if (type === 'hero') {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-full h-[280px] sm:h-[350px] lg:h-[500px] bg-gradient-to-br from-gray-700/40 to-gray-800/40 rounded-lg skeleton mb-8"
      />
    );
  }

  if (type === 'row') {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="space-y-4"
      >
        <div className="h-8 bg-gradient-to-r from-gray-700/40 to-gray-800/40 rounded-lg skeleton w-40" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-40 h-60 bg-gradient-to-br from-gray-700/40 to-gray-800/40 rounded-lg skeleton flex-shrink-0"
            />
          ))}
        </div>
      </motion.div>
    );
  }

  return null;
}
