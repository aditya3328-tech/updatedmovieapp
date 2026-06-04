import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  splitHeroTitle,
  getReleaseYear,
  parseGenreTags,
  getSubjectTypeLabel,
} from "./heroUtils";

const HERO_OVERLAY_STYLE = {
  background:
    "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.2) 100%)",
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
  const { main, suffix } = splitHeroTitle(item.title || subject?.title || "");
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
        alt={item.title || "Hero banner"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onError={onImageError}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0" style={HERO_OVERLAY_STYLE} />

      <div className="relative z-20 flex h-full items-center">
        <motion.div
          initial={isActive ? { opacity: 0, y: 24 } : false}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-3xl px-6 pb-24 pt-28 md:px-12 md:pb-28 lg:px-16 lg:pt-32"
        >
          <h1 className="font-black leading-[1.05] text-white">
            <span className="block text-[36px] md:text-[52px] lg:text-[72px]">
              {main}
            </span>
            {suffix && (
              <span className="mt-1 block text-[28px] md:text-[40px] lg:text-[56px] text-white/95">
                {suffix}
              </span>
            )}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm md:text-base">
            {releaseYear && (
              <span className="font-semibold text-white/90">{releaseYear}</span>
            )}
            {typeLabel && (
              <span className="rounded-md border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-md md:text-sm">
                {typeLabel}
              </span>
            )}
          </div>

          {genres.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md md:text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={`/watch/${subjectId}`}>
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-black shadow-lg md:text-base"
              >
                <span aria-hidden>▶</span>
                Watch Now
              </motion.span>
            </Link>
            <Link to={`/details/${subjectId}`}>
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-6 py-3 text-sm font-bold text-white backdrop-blur-md md:text-base"
              >
                <span aria-hidden>ℹ</span>
                Details
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
