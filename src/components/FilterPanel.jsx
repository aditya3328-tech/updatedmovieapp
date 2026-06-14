import { memo, useCallback } from "react";

/* =========================================================
   FilterPanel — Reusable multi-row filter bar for browse pages
   ========================================================= */

const GENRES = [
  "All","Action","Adventure","Animation","Biography","Comedy","Crime",
  "Documentary","Drama","Family","Fantasy","Film-Noir","Game-Show","History",
  "Horror","Music","Musical","Mystery","News","Reality-TV","Romance","Sci-Fi",
  "Short","Sport","Talk-Show","Thriller","War","Western","Other",
];

const COUNTRIES = [
  "All","United States","United Kingdom","Korea","Japan","Bangladesh","China",
  "Egypt","France","Germany","India","Indonesia","Iraq","Italy","Ivory Coast",
  "Kenya","Lebanon","Mexico","Morocco","Nigeria","Pakistan","Philippines",
  "Russia","Saudi Arabia","South Africa","Spain","Syria","Thailand","Malaysia",
  "Turkey","Other",
];

const YEARS = [
  "All","2026","2025","2024","2023","2022","2021","2020",
  "2010s","2000s","1990s","1980s","Other",
];

const LANGUAGES = [
  "All","English dub","French dub","Hindi dub","Bengali dub","Urdu dub",
  "Punjabi dub","Tamil dub","Telugu dub","Malayalam dub","Kannada dub",
  "Arabic dub","Arabic sub","Tagalog dub","Indonesian dub","Russian dub",
  "Kurdish sub","Spanish dub","Spanish sub","SpanishLatam dub",
];

const SORTS = [
  { label: "For You", value: "forYou" },
  { label: "Hottest",  value: "hottest" },
  { label: "Latest",   value: "latest" },
  { label: "Rating",   value: "rating" },
];

/* ── Single filter row ── */
const FilterRow = memo(function FilterRow({ label, options, value, onChange, isSort }) {
  return (
    <div className="filter-row">
      <span className="filter-row-label">{label}</span>
      <div className="filter-chips" role="group" aria-label={`Filter by ${label}`}>
        {isSort
          ? options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`filter-chip${value === opt.value ? " filter-chip--active" : ""}`}
                onClick={() => onChange(opt.value)}
                aria-pressed={value === opt.value}
              >
                {opt.label}
              </button>
            ))
          : options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`filter-chip${value === opt ? " filter-chip--active" : ""}`}
                onClick={() => onChange(opt)}
                aria-pressed={value === opt}
              >
                {opt}
              </button>
            ))}
      </div>
    </div>
  );
});

/* ── FilterPanel ── */
function FilterPanel({ filters, onChange, hideGenre, hideLanguage }) {
  const set = useCallback(
    (key) => (val) => onChange({ ...filters, [key]: val }),
    [filters, onChange],
  );

  return (
    <aside className="filter-panel" aria-label="Browse filters">
      {!hideGenre && (
        <FilterRow
          label="Genre"
          options={GENRES}
          value={filters.genre || "All"}
          onChange={set("genre")}
        />
      )}
      <FilterRow
        label="Country"
        options={COUNTRIES}
        value={filters.country || "All"}
        onChange={set("country")}
      />
      <FilterRow
        label="Year"
        options={YEARS}
        value={filters.year || "All"}
        onChange={set("year")}
      />
      {!hideLanguage && (
        <FilterRow
          label="Language"
          options={LANGUAGES}
          value={filters.language || "All"}
          onChange={set("language")}
        />
      )}
      <FilterRow
        label="Sort By"
        options={SORTS}
        value={filters.sort || "forYou"}
        onChange={set("sort")}
        isSort
      />
    </aside>
  );
}

export default memo(FilterPanel);
