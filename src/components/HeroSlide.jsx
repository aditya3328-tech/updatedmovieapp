import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getReleaseYear,
  parseGenreTags,
  getSubjectTypeLabel,
} from "./heroUtils";

const HERO_OVERLAY_STYLE = {
  background:
    "linear-gradient(90deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,.55) 35%, rgba(0,0,0,.15) 70%, rgba(0,0,0,.45) 100%), linear-gradient(to top, rgba(0,0,0,.95), transparent)",
};

export default function HeroSlide({
  item,
  isActive,
  priority = false,
  onImageError,
  imageSrc,
}) {
  const subject = item.subject;
  const subjectId = String(item.subjectId);
  const title = item.title || subject?.title || "";
  const releaseYear = getReleaseYear(subject?.releaseDate);
  const typeLabel = getSubjectTypeLabel(subject?.subjectType ?? item.subjectType);
  const genres = parseGenreTags(subject?.genre);

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ${
        isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
      }`}
      aria-hidden={!isActive}
    >
      <img
        src={imageSrc}
        alt={title || "Hero banner"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onError={onImageError}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0" style={HERO_OVERLAY_STYLE} />

      <div className="hero-content absolute top-1/2 left-16 z-20 -translate-y-1/2">
        <motion.div
          initial={isActive ? { opacity: 0, y: 30 } : false}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="hero-slide-content"
        >
          <h1 className="hero-slide-title text-white">{title}</h1>

          {(releaseYear || typeLabel) && (
            <p className="hero-slide-subtitle flex flex-wrap items-center gap-3">
              {releaseYear && <span className="font-semibold">{releaseYear}</span>}
              {releaseYear && typeLabel && (
                <span className="text-white/40" aria-hidden>
                  •
                </span>
              )}
              {typeLabel && <span className="font-medium text-white/80">{typeLabel}</span>}
            </p>
          )}

          {genres.length > 0 && (
            <div className="hero-slide-genres">
              {genres.slice(0, 4).map((genre) => (
                <span
                  key={genre}
                  className="hero-genre-badge"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <Link to={`/watch/${subjectId}`}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="hero-btn-watch inline-flex items-center gap-2 px-8 py-3 font-bold transition-all duration-300"
              >
                <span aria-hidden>▶</span>
                Watch Now
              </motion.button>
            </Link>
            <Link to={`/details/${subjectId}`}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="hero-btn-details inline-flex items-center gap-2 px-8 py-3 font-bold transition-all duration-300"
              >
                <span aria-hidden>ℹ</span>
                Details
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
