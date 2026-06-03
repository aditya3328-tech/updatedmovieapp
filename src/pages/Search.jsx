import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import MoviePosterCard from '../components/MoviePosterCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import useSearch from '../hooks/useSearch';

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { query, setQuery, results, loading, error, hasMore, loadMore } = useSearch(400);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  /* Initialize query from URL */
  useEffect(() => {
    if (initialQuery && !query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  /* Infinite scroll observer */
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
  }, [hasMore, loading, loadMore]);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-20 md:pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-black"
      id="search-page"
    >
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-2 text-white">
          Search
          <span className="gradient-text"> Movies & Shows</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">
          Discover thousands of movies, series, and anime
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-10"
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          autoFocus
          placeholder="Search movies, series, anime..."
        />
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-lg p-6 text-center mb-8"
          id="search-error"
        >
          <p className="text-red-500 text-sm font-semibold mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setQuery(query)}
            className="btn-primary"
          >
            Try Again
          </motion.button>
        </motion.div>
      )}

      {/* Results Count */}
      {query && results.length > 0 && !loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 mb-8 font-medium"
        >
          Found <span className="text-red-600 font-bold">{results.length}</span> results for{' '}
          <span className="text-red-600 font-bold">"{query}"</span>
        </motion.p>
      )}

      {/* Results Grid */}
      {results.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          id="search-results"
        >
          {results.map((item, i) => (
            <motion.div
              key={item.subjectId || item.id || i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <MoviePosterCard movie={item} />
            </motion.div>
          ))}
        </motion.div>
      ) : !loading && query ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20"
          id="no-results"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-3">No Results Found</h3>
          <p className="text-gray-400 text-center max-w-md">
            We couldn't find anything matching{' '}
            <span className="text-red-600 font-semibold">"{query}"</span>. Try a different search
            term.
          </p>
        </motion.div>
      ) : !loading && !query ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20"
          id="search-empty"
        >
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-2xl font-bold text-white mb-3">Start Searching</h3>
          <p className="text-gray-400 text-center max-w-md mb-8">
            Explore thousands of movies, TV series, and anime by entering a search term.
          </p>

          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
            {['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Anime', 'Adventure'].map(
              (genre, i) => (
                <motion.button
                  key={genre}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuery(genre)}
                  className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-red-600/30 border border-white/20 hover:border-red-600/50 text-sm font-medium text-white transition-all"
                >
                  {genre}
                </motion.button>
              )
            )}
          </div>
        </motion.div>
      ) : null}

      {/* Loading State */}
      {loading && (
        <div className="mt-8">
          {results.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
                  className="w-full aspect-[2/3] rounded-lg skeleton"
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Loader text="Loading more..." />
            </div>
          )}
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-4" />
    </motion.div>
  );
}
