export const SUBJECT_TYPE = {
  MOVIE: 1,
  TV_SERIES: 2,
  ANIMATION: 3,
};

export const DEFAULT_FILTERS = {
  [SUBJECT_TYPE.MOVIE]: {
    genre: "Action",
    country: "India",
    year: "All",
    language: "Hindi dub",
    sort: "forYou",
  },
  [SUBJECT_TYPE.TV_SERIES]: {
    genre: "Action",
    country: "India",
    year: "All",
    language: "Hindi dub",
    sort: "forYou",
  },
  [SUBJECT_TYPE.ANIMATION]: {
    genre: "All",
    country: "All",
    year: "All",
    language: "All",
    sort: "forYou",
  },
};

export const FALLBACK_TIERS = [
  { language: "Hindi dub", country: "India" },
  { language: "All", country: "India" },
  { language: "Hindi dub", country: "All" },
  { language: "All", country: "All" },
];

export function getDefaultFilters(subjectType) {
  return DEFAULT_FILTERS[subjectType] || DEFAULT_FILTERS[SUBJECT_TYPE.MOVIE];
}

export function getFallbackTier(fallbackIndex) {
  if (fallbackIndex < 0 || fallbackIndex >= FALLBACK_TIERS.length) return null;
  return FALLBACK_TIERS[fallbackIndex];
}
