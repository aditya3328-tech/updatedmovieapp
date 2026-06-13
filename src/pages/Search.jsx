import { useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchResults from '../components/SearchResults';
import useSearch from '../hooks/useSearch';
import movieService from '../services/movieService';

const FALLBACK_KEYWORDS = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Thriller',
  'Anime',
  'Adventure',
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trendingKeywords, setTrendingKeywords] = useState(FALLBACK_KEYWORDS);
  const urlQuery = searchParams.get('q')?.trim() || '';

  const {
    query,
    results,
    loading,
    error,
    hasMore,
    runSearch,
    clearSearch,
    loadMore,
  } = useSearch();

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

 useEffect(() => {
  movieService
    .everyoneSearch(1)
    .then((keywords) => {
      if (keywords.length > 0) {
        setTrendingKeywords(keywords.slice(0, 12));
      }
    })
    .catch(() => {});
}, []);

  useEffect(() => {
    if (urlQuery) {
      runSearch(urlQuery);
    } else {
      clearSearch();
    }
  }, [urlQuery, runSearch, clearSearch]);
  

  const executeSearch = useCallback(
    (term) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      setSearchParams({ q: trimmed }, { replace: true });
    },
    [setSearchParams],
  );

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
  }, [hasMore, loading, loadMore]);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  const showEmptyState = !query && !loading && results.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-[90px] md:pt-[80px] pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#05070d]"
      id="search-page"
    >
      {showEmptyState && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12"
          id="search-empty"
        >
          <div className="text-6xl mb-4" aria-hidden>
            🎬
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Start Searching</h3>
          <p className="text-[#b4b4b4] text-center max-w-md mb-8">
            Use the search bar above to explore movies, TV series, and anime, or pick a trending topic below.
          </p>

          <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
            {trendingKeywords.map((keyword, i) => (
              <motion.button
                key={keyword}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => executeSearch(keyword)}
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-medium text-white transition-all"
              >
                {keyword}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <SearchResults
        query={query}
        results={results}
        loading={loading}
        error={error}
        onRetry={() => runSearch(query)}
        sentinelRef={sentinelRef}
      />
    </motion.div>
  );
}
