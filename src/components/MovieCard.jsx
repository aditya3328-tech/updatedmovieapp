import { memo, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const FALLBACK_POSTER =
  "https://via.placeholder.com/300x450/0F1117/E50914?text=StreamWave";

function MovieCard({ item, movie, layout = "row" }) {
  const navigate = useNavigate();
  const data = item || movie;

  const widthClass =
    layout === "grid"
      ? "w-full"
      : "w-[calc((100%-1rem)/2)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-5rem)/6)]";

  const posterUrl = useMemo(
    () => data?.cover?.url || FALLBACK_POSTER,
    [data?.cover?.url],
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

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`movie-card group flex-shrink-0 ${widthClass} cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-xl`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#0F1117] border border-white/10">
        <img
          src={posterUrl}
          alt={data.title || "Title"}
          loading="lazy"
          decoding="async"
          className="movie-card-image absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_POSTER;
          }}
        />

        <div className="movie-card-overlay">
          {data.imdbRatingValue && (
            <div className="movie-card-badge">
              <span>⭐</span>
              <span>{data.imdbRatingValue}</span>
            </div>
          )}

          <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
            {data.title}
          </h3>

          <div className="mt-2 space-y-0.5 text-xs text-zinc-300">
            {data.countryName && (
              <p className="line-clamp-1">{data.countryName}</p>
            )}
            {data.genre && <p className="line-clamp-1">{data.genre}</p>}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(MovieCard);
