import { motion } from 'framer-motion';

export default function PlayerLayout({ 
  children, 
  title, 
  streaming = true, 
  quality = '1080p',
  loading = false 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full bg-black rounded-xl overflow-hidden group"
    >
      {/* Player Container */}
      <div className="relative w-full bg-black aspect-video rounded-xl overflow-hidden">
        {/* Player Content */}
        {children}

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-3 border-transparent border-t-red-600 rounded-full"
            />
          </div>
        )}

        {/* Streaming Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-10"
        >
          {streaming ? (
            <div className="flex items-center gap-2 bg-green-600/80 backdrop-blur px-3 py-1.5 rounded-full text-sm font-semibold text-white">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Streaming
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-600/80 backdrop-blur px-3 py-1.5 rounded-full text-sm font-semibold text-white">
              <div className="w-2 h-2 bg-white" />
              Offline
            </div>
          )}
        </motion.div>

        {/* Quality Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute top-4 left-4 z-10 bg-blue-600/80 backdrop-blur px-3 py-1.5 rounded-full text-sm font-semibold text-white"
        >
          {quality}
        </motion.div>
      </div>

      {/* Player Info */}
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 sm:p-6 bg-gradient-to-t from-black to-transparent"
        >
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        </motion.div>
      )}
    </motion.div>
  );
}
