/* ========================================
   StreamWave API Endpoints
   ======================================== */

const ENDPOINTS = {
  // Content Search & Discovery
  /** Search movies, TV series, anime by keyword */
  SEARCH: "/subject/everyone-search",

  // Playback & Streaming
  /** Get playback streams for a subject */
  PLAY: "/subject/play",

  /** Get captions/subtitles for a stream */
  CAPTION: "/subject/caption",

  // Content Details & Recommendations
  /** Get recommendations for a subject */
  RECOMMENDATIONS: "/subject/detail-rec",

  // Navigation & Configuration
  /** Get bottom tab navigation menu */
  BOTTOM_TABS: "/tab/get-bottom-tab-list",

  /** Get web application configuration */
  WEB_CONFIG: "/webConfig",

  DETAIL: "/detail",

  DETAILS: "/subject/details",

  EPISODES: "/subject/episodes",

  HOME: "/home",

  HOME_EXTRA: "/home-extra",

  CATEGORY: "/category",

  CLIENT_INFO: "/client-info",

  MOVIE: "/subject/movie",
};

// Validate all endpoints are properly formatted
Object.entries(ENDPOINTS).forEach(([key, value]) => {
  if (!value.startsWith("/")) {
    console.warn(
      `[Endpoints] Warning: ${key} should start with '/', got: ${value}`,
    );
  }
});

export default ENDPOINTS;
