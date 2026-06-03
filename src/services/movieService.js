import apiClient, { log } from "../api/axios";
import ENDPOINTS from "../api/endpoints";

/* ========================================
   Movie Service — All API interactions
   Production-ready with error handling
   ======================================== */

const movieService = {
  /**
   * Search for movies, TV series, and anime by keyword
   * @param {string} query - Search term
   * @param {number} page - Page number (default: 1)
   * @param {Object} options - Additional options
   * @param {AbortSignal} options.signal - AbortController signal for cancellation
   * @returns {Promise<Object>} Response with data, status, headers
   * @throws {Error} If request fails
   */
  search: async (query, page = 1, { signal } = {}) => {
    try {
      log(
        "debug",
        `[movieService] search() called with query: "${query}", page: ${page}`,
      );

      const config = {
        params: {
          keyword: query,
          page,
          perPage: 24,
        },
      };
      if (signal) config.signal = signal;

      const response = await apiClient.get(ENDPOINTS.SEARCH, config);
      const results = response?.data?.data?.everyoneSearch || [];

      log(
        "debug",
        `[movieService] search() success: ${results.length} items returned`,
      );
      return results;
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
   * Get playback streams for a subject episode
   * @param {string} subjectId - Subject/Title ID
   * @param {string} detailPath - Title detail path
   * @param {number} se - Season number (default: 0)
   * @param {number} ep - Episode number (default: 0)
   * @returns {Promise<Object>} Playback response data
   * @throws {Error} If request fails
   */
  async getStreams(subjectId, detailPath, se = 1, ep = 1) {
    const response = await fetch(
      `http://localhost:4000/resolve-streams?subjectId=${subjectId}&detailPath=${detailPath}&se=${se}&ep=${ep}`,
    );

    const data = await response.json();

    console.log("BACKEND RESPONSE", data);

    const streams = data?.streams?.length
      ? data.streams
      : data?.attempts?.flatMap((a) => a.streams || []) || [];

    console.log("FINAL STREAMS", streams);

    return {
      streams,
    };
  },
 getDetails: async (subjectId) => {
  const response = await apiClient.get(
    ENDPOINTS.DETAIL,
    {
      params: { subjectId },
    }
  );

  console.log(
    "DETAIL RESPONSE",
    response?.data
  );

  return (
    response?.data?.data?.subject ||
    null
  );
},

  getEpisodes: async (subjectId) => {
  const response = await apiClient.get(
    ENDPOINTS.EPISODES,
    {
      params: { subjectId },
    }
  );

  console.log(
    "EPISODES RAW RESPONSE",
    response
  );

  console.log(
    "EPISODES RAW DATA",
    response?.data
  );

  return response?.data;
},

  /**
   * Get captions/subtitles for a stream
   * @param {string} streamId - Stream ID
   * @param {string} format - Format type (e.g., 'MP4', 'WebM')
   * @returns {Promise<Object>} Caption data with format, language, URL
   * @throws {Error} If request fails
   */
  getCaptions: async (streamId, subjectId, detailPath) => {
    const response = await fetch(
      `http://localhost:4000/captions?id=${streamId}&subjectId=${subjectId}&detailPath=${detailPath}`,
    );

    const data = await response.json();

    return data?.captions || [];
  },

  /**
   * Get recommendations for a subject
   * @param {string} subjectId - Subject/Title ID
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} Recommendation list
   * @throws {Error} If request fails
   */
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

  /**
   * Get bottom tab navigation menu
   * @returns {Promise<Object>} Navigation tabs data
   * @throws {Error} If request fails
   */
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

  /**
   * Get web application configuration
   * @returns {Promise<Object>} Web config data
   * @throws {Error} If request fails
   */
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
   * Get trending content using search endpoint
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} Trending content list
   * @throws {Error} If request fails
   */
  getTrending: async (page = 1) => {
    try {
      log("debug", `[movieService] getTrending() called, page: ${page}`);

      const response = await apiClient.get(ENDPOINTS.SEARCH, {
        params: {
          keyword: "trending",
          page,
          perPage: 24,
        },
      });

      log(
        "debug",
        `[movieService] getTrending() success: ${response.data?.list?.length || 0} items`,
      );
      return response?.data?.data?.everyoneSearch || [];
    } catch (error) {
      log("error", `[movieService] getTrending() failed`, error.message);
      throw error;
    }
  },

  /**
   * Get popular content
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} Popular content list
   * @throws {Error} If request fails
   */
  getPopular: async (page = 1) => {
    try {
      log("debug", `[movieService] getPopular() called, page: ${page}`);

      const response = await apiClient.get(ENDPOINTS.SEARCH, {
        params: {
          keyword: "popular",
          page,
          perPage: 24,
        },
      });

      log(
        "debug",
        `[movieService] getPopular() success: ${response.data?.list?.length || 0} items`,
      );
      return response?.data?.data?.everyoneSearch || [];
    } catch (error) {
      log("error", `[movieService] getPopular() failed`, error.message);
      throw error;
    }
  },
};

export default movieService;
