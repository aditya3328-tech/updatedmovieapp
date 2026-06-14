import { memo, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getOptimizedImageProps, fallbackToOriginalImage } from "../utils/imageOptimizer";

const FALLBACK =
  "https://via.placeholder.com/220x330/111827/6366f1?text=No+Poster";

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

/**
 * SubjectCard — rich poster card for browse/filter grid pages.
 * Shows: poster, year badge, IMDb badge, title, country, genre.
 */
function SubjectCard({ item }) {
  const navigate = useNavigate();

  const posterUrl = useMemo(
    () => item?.cover?.url || FALLBACK,
    [item?.cover?.url],
  );
  const imgProps = useMemo(
    () => getOptimizedImageProps(posterUrl, "poster"),
    [posterUrl],
  );

  const year = useMemo(() => {
    if (!item?.releaseDate) return null;
    return String(item.releaseDate).slice(0, 4);
  }, [item?.releaseDate]);

  const rating = useMemo(() => {
    const r = parseFloat(item?.imdbRatingValue);
    return !isNaN(r) && r > 0 ? r.toFixed(1) : null;
  }, [item?.imdbRatingValue]);

  const genre = useMemo(() => {
    const g = item?.genre;
    if (!g) return null;
    // May be comma-separated; take first two
    return g.split(",").slice(0, 2).map((s) => s.trim()).join(" · ");
  }, [item?.genre]);

  const handleClick = useCallback(() => {
    if (item?.subjectId) navigate(`/details/${item.subjectId}`);
  }, [item?.subjectId, navigate]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  if (!item) return null;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="subject-card group"
      aria-label={item.title}
    >
      {/* Poster */}
      <div className="subject-card-poster">
        <img
          src={imgProps.src}
          alt={item.title || "Poster"}
          loading="lazy"
          decoding="async"
          width={imgProps.width}
          height={imgProps.height}
          className="subject-card-img"
          onError={(e) => fallbackToOriginalImage(e, posterUrl)}
        />

        {/* Year badge */}
        {year && (
          <span className="subject-card-year" aria-label={`Released ${year}`}>
            {year}
          </span>
        )}

        {/* IMDb badge */}
        {rating && (
          <span className="subject-card-imdb" aria-label={`IMDb rating ${rating}`}>
            <StarIcon />
            {rating}
          </span>
        )}

        {/* Overlay on hover */}
        <div className="subject-card-overlay" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="subject-card-info">
        <h3 className="subject-card-title">{item.title}</h3>
        {(item.countryName || genre) && (
          <p className="subject-card-meta">
            {item.countryName && (
              <span className="subject-card-country">{item.countryName}</span>
            )}
            {item.countryName && genre && (
              <span className="subject-card-dot">·</span>
            )}
            {genre && <span className="subject-card-genre">{genre}</span>}
          </p>
        )}
      </div>
    </article>
  );
}

export default memo(SubjectCard);
