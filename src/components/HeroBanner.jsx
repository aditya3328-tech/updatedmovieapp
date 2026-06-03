import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function HeroBanner({ movie, movies = [], onAddToWatchlist }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate through movies if multiple are provided
  useEffect(() => {
    if (!movies || movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [movies]);

  // Use passed movie or current from array
  const currentMovie = movies && movies.length > 0 ? movies[currentIndex] : movie;

  if (!currentMovie) return null;

  const backdropUrl = currentMovie.cover?.url || 'https://via.placeholder.com/1920x500?text=No+Image';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="hero-banner relative w-full h-[280px] sm:h-[350px] lg:h-[500px] mb-8 rounded-xl overflow-hidden group"
    >
      {/* Background Image */}
      <motion.img
        key={currentMovie.subjectId}
        src={backdropUrl}
        alt={currentMovie.title}
        className="hero-backdrop absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

      {/* Content */}
      <div className="hero-content">
        <motion.div
          key={`content-${currentMovie.subjectId}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-2xl"
        >
          {/* Badge */}
          {currentMovie.imdbRatingValue && (
            <div className="inline-flex items-center gap-2 bg-red-600/80 backdrop-blur px-3 py-1 rounded-full mb-4 text-sm font-semibold">
              ⭐ {currentMovie.imdbRatingValue} Rating
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-3 text-white leading-tight">
            {currentMovie.title}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-6 line-clamp-3 max-w-xl">
            {currentMovie.description || 'Watch this amazing movie now and experience cinema like never before.'}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link to={`/details/${currentMovie.subjectId || currentMovie.id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                <span>ℹ️</span>
                View Details
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddToWatchlist}
              className="btn-secondary"
            >
              <span>+</span>
              Add to Watchlist
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Auto-rotate indicators (if multiple movies) */}
      {movies && movies.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {movies.slice(0, 5).map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-red-600 w-6' : 'bg-white/40 hover:bg-white/60'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
