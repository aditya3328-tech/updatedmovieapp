import { memo, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { parseHindiTitle } from "./movieCardUtils";
import {
  fallbackToOriginalImage,
  getOptimizedImageProps,
} from "../utils/imageOptimizer";

const FALLBACK_POSTER =
  "https://via.placeholder.com/180x270/111827/E50914?text=StreamWave";

function MovieCard({ item, movie, layout = "row" }) {
  const navigate = useNavigate();
  const data = item || movie;

  const posterUrl = useMemo(
    () => data?.cover?.url || FALLBACK_POSTER,
    [data?.cover?.url],
  );
  const posterImage = useMemo(
    () => getOptimizedImageProps(posterUrl, "poster"),
    [posterUrl],
  );

  const { displayTitle, showHindiBadge } = useMemo(
    () => parseHindiTitle(data?.title || ""),
    [data?.title],
  );

  const handleClick = useCallback(() => {
    if (data?.subjectId) {
      navigate(`/details/${data.subjectId}`);
    }
  }, [data?.subjectId, navigate]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  if (!data) return null;

  const sizeClass =
    layout === "grid" ? "movie-card--grid" : "movie-card--row";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`movie-card movie-card-v2 group flex-shrink-0 ${sizeClass} cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070d]`}
    >
      <div className="movie-card-poster relative overflow-hidden rounded-[14px] bg-[#111827]">
        <img
          src={posterImage.src}
          alt={displayTitle || "Title"}
          loading="lazy"
          decoding="async"
          width={posterImage.width}
          height={posterImage.height}
          className="movie-card-image block h-full w-full object-cover rounded-[14px]"
          onError={(e) => {
            fallbackToOriginalImage(e, posterUrl);
          }}
        />

        {showHindiBadge && (
          <span className="movie-card-lang-badge" aria-label="Hindi">
            Hindi
          </span>
        )}
      </div>

      <h3 className="movie-card-title">{displayTitle}</h3>
    </article>
  );
}

export default memo(MovieCard);
