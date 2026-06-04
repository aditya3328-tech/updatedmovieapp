import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import MovieCard from "./MovieCard";

const SKELETON_COUNT = 6;

function RowSkeleton() {
  return (
    <div className="mb-10">
      <div className="h-7 w-48 mb-4 rounded-md bg-gradient-to-r from-zinc-800/80 via-zinc-700/60 to-zinc-800/80 animate-pulse skeleton" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[calc((100%-1rem)/2)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-5rem)/6)] aspect-[2/3] rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 animate-pulse skeleton"
          />
        ))}
      </div>
    </div>
  );
}

function MovieRow({ title, items, movies, isLoading }) {
  const list = useMemo(() => items ?? movies ?? [], [items, movies]);

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
      className="mb-10"
    >
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 px-4 sm:px-6 lg:px-8">
        {title}
      </h2>

      <div className="overflow-x-auto scroll-row pb-2 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 min-w-full">
          {list.map((item) => (
            <MovieCard key={item.subjectId} item={item} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default memo(MovieRow);
