import { memo } from "react";
import MovieRow from "./MovieRow";
import useHomeSection from "../hooks/useHomeSection";

function HomeSectionRow({ section }) {
  const { ref, title, items, loading, error } = useHomeSection(section, {
    preload: section.preload,
  });

  if (error && !loading && items.length === 0) {
    return (
      <div ref={ref} className="movie-row mb-12 px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-zinc-500">
          Could not load {section.title}. Pull to refresh or try again later.
        </p>
      </div>
    );
  }

  return (
    <div ref={ref}>
      <MovieRow title={title} items={items} isLoading={loading} />
    </div>
  );
}

export default memo(HomeSectionRow);
