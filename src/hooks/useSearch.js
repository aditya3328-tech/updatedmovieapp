import { useState, useCallback, useEffect, useRef } from "react";
import movieService from "../services/movieService";

const PER_PAGE = 28;

/**
 * Search results from POST /subject/search (explicit runSearch — not on every keystroke)
 */
export default function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const abortController = useRef(null);
  const loadingRef = useRef(false);
  const requestIdRef = useRef(0);

  const performSearch = useCallback(
    async (searchQuery, pageNum, append = false) => {
      const trimmed = searchQuery?.trim();
      if (!trimmed) {
        requestIdRef.current += 1;
        setResults([]);
        setLoading(false);
        loadingRef.current = false;
        setHasMore(false);
        setError(null);
        return;
      }
      if (abortController.current) {
        abortController.current.abort();
      }

      const controller = new AbortController();
      const requestId = requestIdRef.current + 1;
      abortController.current = controller;
      requestIdRef.current = requestId;

      try {
        setLoading(true);
        loadingRef.current = true;
        setError(null);

        const items = await movieService.search(trimmed, pageNum, {
          signal: controller.signal,
        });

        if (requestId !== requestIdRef.current) return;

        const newResults = Array.isArray(items) ? items : [];

        if (append) {
          setResults((prev) => [...prev, ...newResults]);
        } else {
          setResults(newResults);
        }

        setHasMore(newResults.length >= PER_PAGE);
        setPage(pageNum);
      } catch (err) {
        if (err.name !== "AbortError" && err.code !== "ERR_CANCELED") {
          if (requestId !== requestIdRef.current) return;
          setError("Search failed. Please try again.");
          setHasMore(false);
          if (!append) setResults([]);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    },
    [],
  );

  const runSearch = useCallback(
    (searchQuery) => {
      setQuery(searchQuery);
      setPage(1);
      performSearch(searchQuery, 1, false);
    },
    [performSearch],
  );

  const clearSearch = useCallback(() => {
    requestIdRef.current += 1;
    if (abortController.current) {
      abortController.current.abort();
    }
    setQuery("");
    setResults([]);
    setPage(1);
    setHasMore(false);
    setError(null);
    setLoading(false);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
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
