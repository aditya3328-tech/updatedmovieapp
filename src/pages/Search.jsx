import { useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import SuggestionsDropdown from '../components/SuggestionsDropdown';
import SearchResults from '../components/SearchResults';
import useSearch from '../hooks/useSearch';
import useSearchSuggestions from '../hooks/useSearchSuggestions';
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
  const initialQuery = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(initialQuery);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [trendingKeywords, setTrendingKeywords] = useState(FALLBACK_KEYWORDS);

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

  const { suggestions, loading: suggestionsLoading } = useSearchSuggestions(
    inputValue,
    dropdownOpen,
  );

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const blurTimerRef = useRef(null);
  const initializedRef = useRef(false);

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
    if (initializedRef.current || !initialQuery) return;
    initializedRef.current = true;
    setInputValue(initialQuery);
    runSearch(initialQuery);
  }, [initialQuery, runSearch]);

  const executeSearch = useCallback(
    (term) => {
      const trimmed = term.trim();
      if (!trimmed) return;

      setInputValue(trimmed);
      setDropdownOpen(false);
      setSearchParams({ q: trimmed }, { replace: true });
      runSearch(trimmed);
    },
    [runSearch, setSearchParams],
  );

  const handleSuggestionSelect = useCallback(
    (word) => {
      executeSearch(word);
    },
    [executeSearch],
  );

  const handleSubmit = useCallback(
    (term) => {
      executeSearch(term);
    },
    [executeSearch],
  );

  const handleInputChange = useCallback(
    (value) => {
      setInputValue(value);
      if (!value.trim()) {
        clearSearch();
        setSearchParams({}, { replace: true });
      } else {
        setDropdownOpen(true);
      }
    },
    [clearSearch, setSearchParams],
  );

  const handleFocus = useCallback(() => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
    }
    if (inputValue.trim()) {
      setDropdownOpen(true);
    }
  }, [inputValue]);

  const handleBlur = useCallback(() => {
    blurTimerRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  }, []);

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
      className="min-h-screen pt-20 md:pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-black"
      id="search-page"
    >
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 relative"
      >
        <SearchBar
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus
          placeholder="Search movies, series, anime..."
        />

        <SuggestionsDropdown
          visible={dropdownOpen}
          suggestions={suggestions}
          loading={suggestionsLoading}
          onSelect={handleSuggestionSelect}
        />
      </motion.div>

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
          <p className="text-gray-400 text-center max-w-md mb-8">
            Explore thousands of movies, TV series, and anime. Pick a trending search below.
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
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-red-600/30 border border-white/20 hover:border-red-600/50 text-sm font-medium text-white transition-all"
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
