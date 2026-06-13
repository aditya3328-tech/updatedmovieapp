import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fallbackToOriginalImage,
  getOptimizedImageProps,
} from '../utils/imageOptimizer';

export default function MoviePosterCard({ movie }) {
  if (!movie) return null;

  const posterUrl = movie.cover?.url || 'https://via.placeholder.com/200x300?text=No+Image';
  const posterImage = getOptimizedImageProps(posterUrl, 'poster');
  const rating = movie.imdbRatingValue || 'N/A';

  return (
    <Link to={movie?.subjectId ? `/details/${movie.subjectId}` : '#'}>
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="movie-card w-40 h-60 sm:w-48 sm:h-72 flex-shrink-0 rounded-xl overflow-hidden group cursor-pointer"
      >
        {/* Poster Image */}
        <img
          src={posterImage.src}
          alt={movie.title}
          width={posterImage.width}
          height={posterImage.height}
          loading="lazy"
          decoding="async"
          className="movie-card-image w-full h-full object-cover"
          onError={(event) => fallbackToOriginalImage(event, posterUrl)}
        />

        {/* Overlay */}
        <div className="movie-card-overlay">
          {/* Rating Badge */}
          <div className="movie-card-badge mb-3">
            <span>⭐</span>
            <span>{rating}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-white leading-5 line-clamp-2 mb-2">
            {movie.title}
          </h3>

          {/* Release Year */}
          {movie.releaseDate && (
            <p className="text-xs text-gray-400">
              {new Date(movie.releaseDate).getFullYear()}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
