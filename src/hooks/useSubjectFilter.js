import { useState, useEffect, useCallback, useRef } from "react";
import movieService from "../services/movieService";

const DEBOUNCE_MS = 400;

/**
 * useSubjectFilter
 * Manages infinite-scroll + filter state for /subject/filter API.
 *
 * @param {Object} opts
 * @param {number} opts.subjectType  1=TV, 2=Movie, 3=Animation
 * @param {Object} opts.filters      { genre, country, year, language, sort }
 */
export default function useSubjectFilter({ subjectType, filters }) {
  const [items, setItems] = useState([]);
  const [pager, setPager] = useState({ hasMore: true, nextPage: "1" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Refs to track in-flight request aborting & debounce timer
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const pageRef = useRef(1);

  /**
   * Fetch a specific page, appending results to existing items.
   * If reset=true, clears the list first.
   */
  const fetchPage = useCallback(
    async (page, reset = false) => {
      // Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      if (reset) {
        setError(null);
      }

      try {
        const result = await movieService.filterSubjects({
          subjectType,
          genre: filters.genre,
          country: filters.country,
          year: filters.year,
          language: filters.language,
          sort: filters.sort || "forYou",
          page,
          perPage: 28,
          signal: controller.signal,
        });

        setItems((prev) => (reset ? result.items : [...prev, ...result.items]));
        setPager(result.pager);
        pageRef.current = page;
      } catch (err) {
        if (err.name !== "AbortError" && err.code !== "ERR_CANCELED") {
          setError(err.message || "Failed to load content");
        }
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [subjectType, filters],
  );

  /**
   * When filters change, debounce then reset to page 1.
   */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    setInitialLoad(true);
    debounceRef.current = setTimeout(() => {
      fetchPage(1, true);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(debounceRef.current);
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectType, filters.genre, filters.country, filters.year, filters.language, filters.sort]);

  /** Load next page (called by Intersection Observer) */
  const loadMore = useCallback(() => {
    if (loading || !pager.hasMore) return;
    const nextPage = pager.nextPage ? parseInt(pager.nextPage, 10) : pageRef.current + 1;
    fetchPage(nextPage, false);
  }, [loading, pager, fetchPage]);

  return { items, pager, loading, error, initialLoad, loadMore };
}
