import { useState, useEffect, useCallback, useRef } from "react";
import movieService from "../services/movieService";
import { getDefaultFilters, getFallbackTier, SUBJECT_TYPE } from "../utils/contentFilter";

const DEBOUNCE_MS = 400;

/**
 * useSubjectFilter
 * Manages infinite-scroll + filter state for /subject/filter API.
 *
 * @param {Object} opts
 * @param {number} opts.subjectType      1=Movie, 2=TV Series, 3=Animation
 * @param {Object} opts.filters          { genre, country, year, language, sort }
 * @param {Object} opts.contentDefaults  Default filter values for this content type
 */
export default function useSubjectFilter({ subjectType, filters, contentDefaults }) {
  const [items, setItems] = useState([]);
  const [pager, setPager] = useState({ hasMore: true, nextPage: "1" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [fallbackActive, setFallbackActive] = useState(false);

  const defaults = contentDefaults || getDefaultFilters(subjectType);

  // Fallback tier tracking — only auto-advance on initial default filter load
  const fallbackTierRef = useRef(0);
  const isDefaultFiltersRef = useRef(true);
  const hasAttemptedFallbackRef = useRef(false);

  // Refs to track in-flight request aborting & debounce timer
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const pageRef = useRef(1);

  /**
   * Build effective filters, applying fallback tier overrides.
   */
  const getEffectiveFilters = useCallback(
    (tierIndex) => {
      const tier = getFallbackTier(tierIndex);
      if (!tier) return { ...filters };
      return {
        ...filters,
        language: tier.language,
        country: tier.country,
      };
    },
    [filters],
  );

  /**
   * Check whether current filters match the defaults for this content type.
   */
  const isUsingDefaults = useCallback(() => {
    return (
      filters.language === defaults.language &&
      filters.country === defaults.country &&
      filters.genre === defaults.genre &&
      filters.year === defaults.year &&
      filters.sort === defaults.sort
    );
  }, [filters, defaults]);

  /**
   * Fetch a specific page, appending results to existing items.
   * If reset=true, clears the list first.
   */
  const fetchPage = useCallback(
    async (page, reset = false, tierIndex = null) => {
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

      const currentTier = tierIndex !== null ? tierIndex : fallbackTierRef.current;
      const effectiveFilters =
        currentTier > 0 ? getEffectiveFilters(currentTier) : filters;

      try {
        const result = await movieService.filterSubjects({
          subjectType,
          genre: effectiveFilters.genre,
          country: effectiveFilters.country,
          year: effectiveFilters.year,
          language: effectiveFilters.language,
          sort: effectiveFilters.sort || "forYou",
          page,
          perPage: 28,
          signal: controller.signal,
        });

        const newItems = result.items || [];

        setItems((prev) => (reset ? newItems : [...prev, ...newItems]));
        setPager(result.pager);
        pageRef.current = page;

        // Auto-fallback: only for Movie/TV pages, never for Animation
        // If first page of default filters returns empty, try broader tiers
        if (
          subjectType !== SUBJECT_TYPE.ANIMATION &&
          reset &&
          page === 1 &&
          newItems.length === 0 &&
          isUsingDefaults() &&
          !hasAttemptedFallbackRef.current
        ) {
          hasAttemptedFallbackRef.current = true;
          const nextTier = currentTier + 1;
          const nextTierDef = getFallbackTier(nextTier);
          if (nextTierDef) {
            fallbackTierRef.current = nextTier;
            setFallbackActive(true);
            // Retry with broader filters
            fetchPage(1, true, nextTier);
          }
        }
      } catch (err) {
        if (err.name !== "AbortError" && err.code !== "ERR_CANCELED") {
          setError(err.message || "Failed to load content");
        }
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [subjectType, filters, getEffectiveFilters, isUsingDefaults],
  );

  /**
   * When filters change, debounce then reset to page 1.
   */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    setInitialLoad(true);

    // Reset fallback state when user changes filters
    isDefaultFiltersRef.current = isUsingDefaults();
    if (!isUsingDefaults()) {
      fallbackTierRef.current = 0;
      setFallbackActive(false);
      hasAttemptedFallbackRef.current = false;
    } else {
      hasAttemptedFallbackRef.current = false;
    }

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

  return { items, pager, loading, error, initialLoad, loadMore, fallbackActive };
}
