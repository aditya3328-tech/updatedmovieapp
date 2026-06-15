import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import FilterPanel from "../components/FilterPanel";
import SubjectGrid from "../components/SubjectGrid";
import useSubjectFilter from "../hooks/useSubjectFilter";
import { getDefaultFilters, SUBJECT_TYPE } from "../utils/contentFilter";

const ANIMATION_COUNTRIES = [
  "All", "United States", "United Kingdom", "France",
  "Japan", "China", "Korea", "Other",
];

/**
 * BrowsePage — Reusable filtered browse page for TV Shows, Movies, Animation.
 *
 * @param {Object} props
 * @param {number} props.subjectType  1=Movie, 2=TV Series, 3=Animation
 * @param {string} props.title        Page heading (e.g. "TV Shows")
 * @param {string} props.subtitle     Short description
 */
export default function BrowsePage({ subjectType, title, subtitle }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const contentDefaults = useMemo(() => getDefaultFilters(subjectType), [subjectType]);

  /* ── Sync filters to/from URL query params ── */
  const filtersFromUrl = useCallback(() => {
    const isAnimation = subjectType === SUBJECT_TYPE.ANIMATION;
    const def = contentDefaults;
    return {
      genre:    isAnimation ? "All" : (searchParams.get("genre")    || def.genre),
      country:  searchParams.get("country")  || def.country,
      year:     searchParams.get("year")     || def.year,
      language: searchParams.get("language") || def.language,
      sort:     searchParams.get("sort")     || def.sort,
    };
  }, [searchParams, subjectType, contentDefaults]);

  const [filters, setFilters] = useState(filtersFromUrl);

  /* Update URL when filters change */
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    const params = {};
    const isAnimation = subjectType === SUBJECT_TYPE.ANIMATION;
    if (!isAnimation && newFilters.genre    !== "All") params.genre    = newFilters.genre;
    if (newFilters.country  !== "All") params.country  = newFilters.country;
    if (newFilters.year     !== "All") params.year     = newFilters.year;
    if (!isAnimation && newFilters.language !== "All") params.language = newFilters.language;
    if (newFilters.sort !== "forYou")  params.sort     = newFilters.sort;
    setSearchParams(params, { replace: true });
  }, [setSearchParams, subjectType]);

  /* ── Data fetching via custom hook ── */
  const { items, pager, loading, error, initialLoad, loadMore, fallbackActive } =
    useSubjectFilter({ subjectType, filters, contentDefaults });

  /* ── Infinite scroll via Intersection Observer ── */
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !pager.hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [pager.hasMore, loading, loadMore]);

  /* ── Count active filters ── */
  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== "sort" && v !== "All",
  ).length;

  const resetFilters = useCallback(() => {
    handleFiltersChange(contentDefaults);
  }, [handleFiltersChange, contentDefaults]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={`browse-page ${subjectType === 3 ? "browse-page--animation" : ""}`}
    >
      {/* ── Page Header ── */}
      <header className="browse-header">
        <div className="browse-header-inner">
          <div className="browse-header-text">
            <h1 className="browse-title">{title}</h1>
            {subtitle && <p className="browse-subtitle">{subtitle}</p>}
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              className="browse-reset-btn"
              onClick={resetFilters}
              aria-label="Reset all filters"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
              Reset ({activeCount})
            </button>
          )}
        </div>
      </header>

      {/* ── Fallback notice ── */}
      {fallbackActive && (
        <div className="browse-fallback-notice">
          Showing broader results — no Hindi content found for this category.
        </div>
      )}

      {/* ── Filter Panel ── */}
      <FilterPanel
        filters={filters}
        onChange={handleFiltersChange}
        hideGenre={subjectType === 3}
        hideLanguage={subjectType === 3}
        countries={subjectType === SUBJECT_TYPE.ANIMATION ? ANIMATION_COUNTRIES : undefined}
      />

      {/* ── Error Banner ── */}
      {error && (
        <div className="browse-error" role="alert">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => handleFiltersChange(filters)}>
            Retry
          </button>
        </div>
      )}

      {/* ── Content Grid ── */}
      <section className="browse-grid-section" aria-label={`${title} results`}>
        <SubjectGrid
          items={items}
          loading={loading}
          initialLoad={initialLoad}
          sentinelRef={sentinelRef}
        />
      </section>
    </motion.div>
  );
}
