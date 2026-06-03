import { useState, useEffect, useCallback, useRef } from 'react';
import movieService from '../services/movieService';

/**
 * useSearch — Debounced search hook with infinite scroll support
 * @param {number} debounceMs - Debounce delay in ms
 */
export default function useSearch(debounceMs = 400) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const debounceTimer = useRef(null);
  const abortController = useRef(null);
  const loadingRef = useRef(false);

  /* Perform the search */
  const performSearch = useCallback(async (searchQuery, pageNum, append = false) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      setHasMore(false);
      return;
    }

    /* Prevent concurrent requests */
    if (loadingRef.current) return;

    /* Cancel previous request */
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      const response = await movieService.search(searchQuery, pageNum, {
        signal: abortController.current.signal,
      });
      const items = Array.isArray(response) ? response : [];
      console.log("API RESPONSE:", response);
      console.log("ITEMS:", items);
      const newResults = Array.isArray(items) ? items : [];

      if (append) {
        setResults((prev) => [...prev, ...newResults]);
      } else {
        setResults(newResults);
      }

      /* Only allow more loading if we got a full page of results */
      setHasMore(newResults.length >= 20);
    } catch (err) {
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        setError('Search failed. Please try again.');
        setHasMore(false);
        console.error('[useSearch] Error:', err);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /* Debounced query handler */
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setResults([]);
      setPage(1);
      setHasMore(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      setPage(1);
      performSearch(query, 1, false);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceMs, performSearch]);

  /* Load more for infinite scroll */
  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore && query.trim()) {
      const nextPage = page + 1;
      setPage(nextPage);
      performSearch(query, nextPage, true);
    }
  }, [hasMore, query, page, performSearch]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    hasMore,
    loadMore,
  };
}
