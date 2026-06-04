import { useState, useCallback, useRef } from 'react';
import movieService from '../services/movieService';

const PER_PAGE = 28;

/**
 * Search results from POST /subject/search (explicit runSearch — not on every keystroke)
 */
export default function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const abortController = useRef(null);
  const loadingRef = useRef(false);

  const performSearch = useCallback(async (searchQuery, pageNum, append = false) => {
    const trimmed = searchQuery?.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setHasMore(false);
      setError(null);
      return;
    }

    if (loadingRef.current && !append) return;

    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);

      const items = await movieService.search(trimmed, pageNum, {
        signal: abortController.current.signal,
      });

      const newResults = Array.isArray(items) ? items : [];

      if (append) {
        setResults((prev) => [...prev, ...newResults]);
      } else {
        setResults(newResults);
      }

      setHasMore(newResults.length >= PER_PAGE);
      setPage(pageNum);
    } catch (err) {
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        setError('Search failed. Please try again.');
        setHasMore(false);
        if (!append) setResults([]);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const runSearch = useCallback(
    (searchQuery) => {
      setQuery(searchQuery);
      setPage(1);
      performSearch(searchQuery, 1, false);
    },
    [performSearch],
  );

  const clearSearch = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setQuery('');
    setResults([]);
    setPage(1);
    setHasMore(false);
    setError(null);
    setLoading(false);
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore && query.trim()) {
      performSearch(query, page + 1, true);
    }
  }, [hasMore, query, page, performSearch]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    hasMore,
    runSearch,
    clearSearch,
    loadMore,
  };
}
