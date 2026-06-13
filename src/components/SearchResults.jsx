import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import Loader from './Loader';

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[2/3] rounded-xl skeleton"
          style={{ animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  );
}

export default function SearchResults({
  query,
  results = [],
  loading,
  error,
  onRetry,
  sentinelRef,
}) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-lg p-6 text-center"
        id="search-error"
      >
        <p className="text-red-500 text-sm font-semibold mb-4">{error}</p>
        <button type="button" onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      </motion.div>
    );
  }

  if (loading && results.length === 0) {
    return <ResultsSkeleton />;
  }

  if (query && results.length === 0 && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20"
        id="no-results"
      >
        <div className="text-6xl mb-4" aria-hidden>
          🔍
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No Results Found</h3>
        <p className="text-gray-400 text-center max-w-md">
          We couldn&apos;t find anything matching{' '}
          <span className="text-red-600 font-semibold">&quot;{query}&quot;</span>. Try a
          different search term.
        </p>
      </motion.div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-400 mb-6 font-medium"
      >
        Found <span className="text-red-600 font-bold">{results.length}</span> results for{' '}
        <span className="text-red-600 font-bold">&quot;{query}&quot;</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        id="search-results"
      >
        {results.map((item) => (
          <MovieCard
            key={item.subjectId || `${item.title}-${item.releaseDate || ''}`}
            item={item}
            layout="grid"
          />
        ))}
      </motion.div>

      {loading && results.length > 0 && (
        <div className="flex justify-center py-8">
          <Loader text="Loading more..." />
        </div>
      )}

      <div ref={sentinelRef} className="h-4" aria-hidden />
    </>
  );
}
