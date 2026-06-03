import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
  if (!movie) return null;

  return (
    <Link to={movie?.subjectId ? `/details/${movie.subjectId}` : "#"}>
      <div className="group w-full max-w-[260px] rounded-3xl overflow-hidden border border-white/10 bg-[#111827] shadow-[0_18px_35px_-18px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_45px_-20px_rgba(229,9,20,0.5)]">
        <div className="relative overflow-hidden">
          <img
            src={movie?.cover?.url || "https://via.placeholder.com/300x450?text=No+Image"}
            alt={movie?.title || "Movie"}
            className="w-full h-[280px] object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 movie-card-overlay">
            <p className="text-xs uppercase tracking-[0.2em] text-[#e2e8f0]/75">
              ⭐ {movie?.imdbRatingValue || "N/A"}
            </p>
            <h3 className="mt-2 text-base font-semibold text-white leading-5">
              {movie?.title || "Unknown Title"}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
}