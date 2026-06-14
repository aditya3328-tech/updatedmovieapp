import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MovieCard from "./MovieCard";

const SKELETON_COUNT = 6;

const SECTION_ICONS = [
  { match: /trending/i, icon: "🔥" },
  { match: /cinema/i, icon: "🎬" },
  { match: /short\s*tv|hot short/i, icon: "📺" },
  { match: /bollywood/i, icon: "🎭" },
  { match: /south indian/i, icon: "🌟" },
  { match: /hollywood/i, icon: "🎥" },
  { match: /series/i, icon: "📺" },
  { match: /drama/i, icon: "🎭" },
  { match: /anime/i, icon: "✨" },
  { match: /asian/i, icon: "🌏" },
  { match: /western/i, icon: "📡" },
];

function getSectionIcon(title = "") {
  const found = SECTION_ICONS.find(({ match }) => match.test(title));
  return found?.icon ?? "🎬";
}

function RowSkeleton() {
  return (
    <div className="movie-row mb-12">
      <div className="h-10 w-56 mb-5 rounded-lg bg-white/5 animate-pulse skeleton" />
      <div className="scroll-row flex gap-[14px] md:gap-5 overflow-hidden">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            className="movie-card-skeleton flex-shrink-0 rounded-[14px] bg-[#111827] animate-pulse skeleton"
          />
        ))}
      </div>
    </div>
  );
}

function MovieRow({ title, items, movies, isLoading, isNested = false }) {
  const list = useMemo(() => items ?? movies ?? [], [items, movies]);
  const icon = useMemo(() => getSectionIcon(title), [title]);

  if (isLoading) {
    return <RowSkeleton />;
  }

  if (!list.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      viewport={{ once: true, margin: "-40px" }}
      className={isNested ? "mb-12 w-full" : "movie-row mb-12"}
    >
      <div className={`movie-row-header flex items-center justify-between gap-4 mb-5 ${isNested ? "" : "px-4 sm:px-6 lg:px-8"}`}>
        <h2 className="movie-row-title">
          <span className="mr-2" aria-hidden>
            {icon}
          </span>
          {title}
        </h2>
        <Link
          to="/search"
          className="movie-row-more shrink-0 text-sm font-semibold text-[#b4b4b4] transition-colors hover:text-white"
        >
          More &gt;
        </Link>
      </div>

      <div className={`scroll-row overflow-x-auto pb-3 ${isNested ? "" : "px-4 sm:px-6 lg:px-8"}`}>
        <div className="movie-row-track flex min-w-full gap-[14px] md:gap-5">
          {list.map((item) => (
            <MovieCard key={item.subjectId} item={item} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default memo(MovieRow);
