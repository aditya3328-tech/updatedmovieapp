import apiClient, { log } from "../api/axios";
import ENDPOINTS from "../api/endpoints";

/* ========================================
   Movie Service — All API interactions
   Production-ready with error handling
   ======================================== */

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

      const items = response?.data?.data?.items || [];
      return items
        .map((item) => item?.word)
        .filter(Boolean)
        .slice(0, 10);
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
    try {
      log(
        "debug",
        `[movieService] search() called with query: "${query}", page: ${page}`,
      );

      const response = await apiClient.post(
        ENDPOINTS.SEARCH,
        {
          keyword: query,
          page,
          perPage: 28,
        },
        { signal },
      );

      console.log("SEARCH RESPONSE", response.data);
      console.log("SEARCH ITEMS", response.data?.data?.items);

      // Check for success status code (code === 0 means SUCCESS)
      if (response.data.code !== 0) {
        throw new Error(`Search API returned error code: ${response.data.code}, message: ${response.data.message}`);
      }

      const items = response?.data?.data?.items || [];

      log(
        "debug",
        `[movieService] search() success: ${items.length} items returned`,
      );
      return items;
    } catch (error) {
      log(
        "error",
        `[movieService] search() failed for query: "${query}"`,
        error.message,
      );
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

    return response?.data?.data?.subject || null;
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
        perPage: 24,
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
   */
  getHome: async ({ signal } = {}) => {
    try {
      const response = await apiClient.get(ENDPOINTS.HOME, {
        params: { host: "movie-box.co" },
        signal,
      });

      return response?.data?.data ?? null;
    } catch (error) {
      if (error.name !== "AbortError" && error.code !== "ERR_CANCELED") {
        log("error", "[movieService] getHome() failed", error.message);
      }
      throw error;
    }
  },

  /**
   * Hero carousel items from operatingList BANNER section only
   */
  getHomeBannerItems: async ({ signal } = {}) => {
    const data = await movieService.getHome({ signal });
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

  getRankingContent: async (rankingId, page = 1, perPage = 12) => {
    try {
      log(
        "debug",
        `[movieService] getRankingContent() id=${rankingId}, page=${page}, perPage=${perPage}`,
      );

      const response = await apiClient.get(ENDPOINTS.RANKING_CONTENT, {
        params: { id: rankingId, page, perPage },
      });

      return response?.data?.data;
    } catch (error) {
      log(
        "error",
        `[movieService] getRankingContent() failed for id: ${rankingId}`,
        error.message,
      );
      throw error;
    }
  },
};

export default movieService;
