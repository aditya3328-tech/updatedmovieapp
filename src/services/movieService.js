import apiClient, { log } from "../api/axios";
import ENDPOINTS from "../api/endpoints";
import { apiScheduler } from "./request";

/* ========================================
   Movie Service — All API interactions
   Production-ready with error handling
   ======================================== */

const HOME_CACHE_DURATION = 5 * 60 * 1000; // 5 min

const isAbortError = (error) =>
  error?.name === "AbortError" || error?.code === "ERR_CANCELED";
const MAX_SUGGESTIONS = 10;

const toSuggestionWords = (items = []) =>
  items
    .map((item) =>
      typeof item === "string"
        ? item
        : item?.word || item?.title || item?.subject?.title
    )
    .filter(Boolean);

const mergeSuggestions = (...groups) => {
  const seen = new Set();
  const suggestions = [];

  groups.flat().forEach((word) => {
    const normalized = word.trim();
    const key = normalized.toLowerCase();

    if (!normalized || seen.has(key)) return;

    seen.add(key);
    suggestions.push(normalized);
  });

  return suggestions.slice(0, MAX_SUGGESTIONS);
};

const movieService = {
  /**
   * Autocomplete suggestions for the search dropdown
   * @param {string} keyword
   * @param {Object} options
   * @param {AbortSignal} options.signal
   * @returns {Promise<string[]>} Up to 10 suggestion strings
   */
  searchSuggest: async (keyword, { signal } = {}) => {
    if (!keyword?.trim()) return [];

    try {
      const response = await apiClient.post(
        ENDPOINTS.SEARCH_SUGGEST,
        { keyword: keyword.trim() },
        { signal },
      );

      const items =
        response?.data?.data?.items ||
        response?.data?.data?.suggestions ||
        response?.data?.data?.list ||
        response?.data?.data ||
        response?.data?.items ||
        response?.data?.suggestions ||
        response?.data?.list ||
        [];
      console.log("API ITEMS", response?.data?.data?.items);
      const suggestions = mergeSuggestions(toSuggestionWords(items));
      console.log("SERVICE OUTPUT", suggestions);

      if (suggestions.length > 1) {
        return suggestions;
      }

      try {
        const fallbackResponse = await apiClient.post(
          ENDPOINTS.SEARCH,
          {
            keyword: keyword.trim(),
            page: 1,
            perPage: MAX_SUGGESTIONS,
            subjectType: 0,
          },
          { signal },
        );

        const fallbackItems =
          fallbackResponse?.data?.data?.items ||
          fallbackResponse?.data?.items ||
          [];

        return mergeSuggestions(suggestions, toSuggestionWords(fallbackItems));
      } catch (fallbackError) {
        if (
          fallbackError.name === "AbortError" ||
          fallbackError.code === "ERR_CANCELED"
        ) {
          throw fallbackError;
        }

        log(
          "warn",
          `[movieService] searchSuggest() fallback failed for: "${keyword}"`,
          fallbackError.message,
        );
        return suggestions;
      }
    } catch (error) {
      if (error.name !== "AbortError" && error.code !== "ERR_CANCELED") {
        log(
          "error",
          `[movieService] searchSuggest() failed for: "${keyword}"`,
          error.message,
        );
      }
      throw error;
    }
  },

  /**
   * Search for movies, TV series, and anime by keyword
   * @param {string} query - Search term
   * @param {number} page - Page number (default: 1)
   * @param {Object} options - Additional options
   * @param {AbortSignal} options.signal - AbortController signal for cancellation
   * @returns {Promise<Array>} Subject items with cover, rating, etc.
   */
  search: async (query, page = 1, { signal } = {}) => {
    const keyword = query?.trim();
    if (!keyword) return [];

    try {
      log(
        "debug",
        `[movieService] search() called with query: "${keyword}", page: ${page}`,
      );

      const response = await apiClient.post(
        ENDPOINTS.SEARCH,
        {
          keyword,
          page,
          perPage: 28,
          subjectType: 0,
        },
        { signal },
      );

      // Check for success status code (code === 0 means SUCCESS)
      if (response.data.code !== 0) {
        throw new Error(
          `Search API returned error code: ${response.data.code}, message: ${response.data.message}`,
        );
      }

      const items = response?.data?.data?.items || [];

      log(
        "debug",
        `[movieService] search() success: ${items.length} items returned`,
      );

      return items;
    } catch (error) {
      if (error.name !== "AbortError" && error.code !== "ERR_CANCELED") {
        log(
          "error",
          `[movieService] search() failed for query: "${keyword}"`,
          error.message,
        );
      }
      throw error;
    }
  },

  /**
   * Trending / popular search keywords (titles only — not for result cards)
   * @param {number} page
   * @param {Object} options
   * @param {AbortSignal} options.signal
   * @returns {Promise<string[]>}
   */
  everyoneSearch: async (page = 1, { signal } = {}) => {
    try {
      const response = await apiClient.post(
        ENDPOINTS.EVERYONE_SEARCH,
        { page, perPage: 20 },
        { signal },
      );

      const list =
        response?.data?.data?.everyoneSearch ||
        response?.data?.data?.items ||
        [];

      return list
        .map((entry) => entry?.title || entry?.word)
        .filter(Boolean);
    } catch (error) {
      if (error.name !== "AbortError" && error.code !== "ERR_CANCELED") {
        log("error", "[movieService] everyoneSearch() failed", error.message);
      }
      throw error;
    }
  },

  /**
   * @deprecated Use everyoneSearch() for keyword chips only
   */
  getTrending: async (page = 1, options = {}) => {
    return movieService.everyoneSearch(page, options);
  },

  /**
   * @deprecated Use everyoneSearch() for keyword chips only
   */
  getPopular: async (page = 1, options = {}) => {
    return movieService.everyoneSearch(page, options);
  },

  /**
   * Get playback streams for a subject episode
   */
  async getStreams(subjectId, detailPath, se = 1, ep = 1) {
    const response = await fetch(
      `http://localhost:4000/resolve-streams?subjectId=${subjectId}&detailPath=${detailPath}&se=${se}&ep=${ep}`,
    );

    const data = await response.json();

    const streams = data?.streams?.length
      ? data.streams
      : data?.attempts?.flatMap((a) => a.streams || []) || [];

    return {
      streams,
    };
  },

 getDetails: async (subjectId) => {
  const response = await apiClient.get(ENDPOINTS.DETAIL, {
    params: { subjectId },
  });

  const data = response?.data?.data;

  if (!data?.subject) return null;

  return {
    ...data.subject,
    resource: data.resource,
    metadata: data.metadata,
    dubs: data.subject?.dubs || [],
    stars: data.stars || [],
  };
},

  getEpisodes: async (subjectId) => {
    const response = await apiClient.get(ENDPOINTS.EPISODES, {
      params: { subjectId },
    });

    return response?.data;
  },

  getCaptions: async (streamId, subjectId, detailPath) => {
    const response = await fetch(
      `http://localhost:4000/captions?id=${streamId}&subjectId=${subjectId}&detailPath=${detailPath}`,
    );

    const data = await response.json();

    return data?.captions || [];
  },

  getRecommendations: async (subjectId) => {
    const response = await apiClient.get(ENDPOINTS.RECOMMENDATIONS, {
      params: {
        subjectId,
        page: 1,
        perPage: 18,
      },
    });

    return response?.data?.data?.items || [];
  },

  getBottomTabs: async () => {
    try {
      log("debug", `[movieService] getBottomTabs() called`);

      const response = await apiClient.get(ENDPOINTS.BOTTOM_TABS);

      log(
        "debug",
        `[movieService] getBottomTabs() success: ${response.data?.data?.bottomTabs?.length || 0} tabs`,
      );
      return response.data;
    } catch (error) {
      log("error", `[movieService] getBottomTabs() failed`, error.message);
      throw error;
    }
  },

  getWebConfig: async () => {
    try {
      log("debug", `[movieService] getWebConfig() called`);

      const response = await apiClient.get(ENDPOINTS.WEB_CONFIG);

      log("debug", `[movieService] getWebConfig() success`);
      return response.data;
    } catch (error) {
      log("error", `[movieService] getWebConfig() failed`, error.message);
      throw error;
    }
  },

  /**
   * Home feed (banner + operating sections)
   * @param {Object} options
   * @param {AbortSignal} options.signal
   * @param {boolean} options.bypassScheduler - skip queue/cache (internal)
   * @param {string} options.priority - scheduler priority
   */
  getHome: async ({ signal, bypassScheduler, priority = "critical" } = {}) => {
    const fetchHome = async ({ signal: requestSignal } = {}) => {
      const response = await apiClient.get(ENDPOINTS.HOME, {
        params: { host: "movie-box.co" },
        signal: requestSignal ?? signal,
      });
      return response?.data?.data ?? null;
    };

    try {
      if (bypassScheduler) {
        return await fetchHome({ signal });
      }

      return await apiScheduler.execute({
        key: "home:movie-box.co",
        fetcher: fetchHome,
        priority,
        cacheTTL: HOME_CACHE_DURATION,
        signal,
      });
    } catch (error) {
      if (!isAbortError(error)) {
        log("error", "[movieService] getHome() failed", error.message);
      }
      throw error;
    }
  },

  /**
   * Hero carousel items from operatingList BANNER section only
   */
  getHomeBannerItems: async ({ signal, priority = "critical" } = {}) => {
    const data = await movieService.getHome({ signal, priority });
    const operatingList = data?.operatingList ?? [];
    const bannerSection = operatingList.find((item) => item.type === "BANNER");
    const items = bannerSection?.banner?.items ?? [];

    return items.filter((item) => {
      const subjectId = String(item?.subjectId ?? "");
      if (!subjectId || subjectId === "0") return false;
      if (!item?.subject) return false;
      return true;
    });
  },
getStaffRelated: async (staffId) => {
  const response = await apiClient.get(
    ENDPOINTS.STAFF_RELATED,
    {
      params: { staffId },
    }
  );

  return response?.data?.data?.items || [];
},

getStaffSubjects: async (
  staffId,
  page = 1,
  perPage = 18
) => {
  const response = await apiClient.get(
    ENDPOINTS.STAFF_SUBJECTS,
    {
      params: {
        staffId,
        page,
        perPage,
      },
    }
  );

  return response?.data?.data?.items || [];
},
  getRankingContent: async (
    rankingId,
    page = 1,
    perPage = 18,
    { signal, bypassScheduler, priority = "medium" } = {},
  ) => {
    const fetchRanking = async ({ signal: requestSignal } = {}) => {
      log(
        "debug",
        `[movieService] getRankingContent() id=${rankingId}, page=${page}, perPage=${perPage}`,
      );

      const response = await apiClient.get(ENDPOINTS.RANKING_CONTENT, {
        params: { id: rankingId, page, perPage },
        signal: requestSignal ?? signal,
      });

      return response?.data?.data;
    };

    try {
      if (bypassScheduler) {
        return await fetchRanking({ signal });
      }

      return await apiScheduler.execute({
        key: `ranking:${rankingId}:${page}:${perPage}`,
        fetcher: fetchRanking,
        priority,
        cacheTTL: HOME_CACHE_DURATION,
        signal,
      });
    } catch (error) {
      if (!isAbortError(error)) {
        log(
          "error",
          `[movieService] getRankingContent() failed for id: ${rankingId}`,
          error.message,
        );
      }
      throw error;
    }
  },

  /**
   * Filter subjects (TV Shows, Movies, Animation) by genre/country/year/language/sort
   * @param {Object} params
   * @param {number} params.subjectType - 1=Movie, 2=TV Series, 3=Animation
   * @param {string} [params.genre]
   * @param {string} [params.country]
   * @param {string} [params.year]
   * @param {string} [params.language]
   * @param {string} [params.sort] - forYou|hottest|latest|rating
   * @param {number} [params.page]
   * @param {number} [params.perPage]
   * @param {AbortSignal} [params.signal]
   * @returns {Promise<{ items: Array, pager: Object }>}
   */
  filterSubjects: async ({
    subjectType = 1,
    genre,
    country,
    year,
    language,
    sort = "forYou",
    page = 1,
    perPage = 28,
    signal,
  } = {}) => {
    try {
      log(
        "debug",
        `[movieService] filterSubjects() type=${subjectType}, genre=${genre}, page=${page}`,
      );

      const body = {
        subjectType,
        page,
        perPage,
        sort,
      };
      if (subjectType === 3) {
        body.genre = "Animation";
      } else if (genre && genre !== "All") {
        body.genre = genre;
      }
      if (country && country !== "All") body.country = country;
      if (year && year !== "All") body.year = year;
      if (language && language !== "All") body.language = language;

      // Try POST first (matches the pattern used by /subject/search and other endpoints)
      const response = await apiClient.post(ENDPOINTS.SUBJECT_FILTER, body, {
        signal,
      });

      const data = response?.data?.data;
      return {
        items: data?.items || [],
        pager: data?.pager || { hasMore: false, nextPage: null },
        title: data?.title || "",
      };
    } catch (error) {
      if (error.name !== "AbortError" && error.code !== "ERR_CANCELED") {
        log(
          "error",
          `[movieService] filterSubjects() failed`,
          error.message,
        );
      }
      throw error;
    }
  },
};

export default movieService;
