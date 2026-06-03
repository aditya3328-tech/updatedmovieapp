import { motion } from 'framer-motion';

export default function Loader({ size = 'default', text = '' }) {
  const sizeMap = {
    small: 'w-6 h-6',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12" id="loader">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className={`${sizeMap[size] || sizeMap.default} rounded-full border-3 border-transparent border-t-red-600 border-r-purple-600`}
      />
      {text && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-gray-400 font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

/* Skeleton variants for different UI elements */
export function SkeletonCard({ count = 6 }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          className="flex-shrink-0 w-[160px] md:w-[200px]"
        >
          <div className="aspect-[2/3] rounded-lg skeleton" />
          <div className="mt-2.5 px-1 space-y-2">
            <div className="h-4 w-3/4 skeleton rounded" />
            <div className="h-3 w-1/2 skeleton rounded" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="w-full h-[280px] sm:h-[350px] lg:h-[500px] rounded-lg skeleton mb-8"
    />
  );
}

export function SkeletonDetail() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 animate-fadeIn"
    >
      <div className="flex flex-col md:flex-row gap-8">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-[200px] sm:w-[260px] aspect-[2/3] rounded-lg skeleton flex-shrink-0"
        />
        <div className="flex-1 space-y-4">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-8 w-3/4 skeleton rounded"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            className="h-4 w-1/3 skeleton rounded"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="h-4 w-full skeleton rounded"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            className="h-4 w-full skeleton rounded"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="h-4 w-2/3 skeleton rounded"
          />
          <div className="flex gap-3 mt-4">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              className="h-10 w-32 skeleton rounded-lg"
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              className="h-10 w-32 skeleton rounded-lg"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonPlayer() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="space-y-4"
    >
      <div className="w-full aspect-video rounded-lg skeleton" />
      <div className="flex gap-3">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          className="h-8 w-20 skeleton rounded-lg"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-8 w-20 skeleton rounded-lg"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          className="h-8 w-20 skeleton rounded-lg"
        />
      </div>
    </motion.div>
  );
}
