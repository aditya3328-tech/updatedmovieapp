import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import MoviePosterCard from './MoviePosterCard';

export default function MovieRow({ title, movies, isLoading, viewAllLink }) {
  if (!movies || movies.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="mb-8"
    >
      {/* Row Header with Title and View All */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-white">
          {title}
        </h2>
        {viewAllLink && (
          <Link to={viewAllLink}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-500 transition-all"
            >
              View All →
            </motion.button>
          </Link>
        )}
      </div>

      {/* Movies Container */}
      <div className="overflow-x-auto scroll-row pb-2">
        <div className="flex gap-4 min-w-max">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-40 h-60 bg-gray-700/30 rounded-lg animate-pulse skeleton"
                />
              ))
            : movies.map((movie, index) => (
                <motion.div
                  key={movie.subjectId || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0"
                >
                  <MoviePosterCard movie={movie} />
                </motion.div>
              ))}
        </div>
      </div>
    </motion.section>
  );
}
