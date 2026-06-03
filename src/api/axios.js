import axios from 'axios';

/* ========================================
   Axios Configuration & Interceptors
   ======================================== */

const PROD_API_BASE = import.meta.env.VITE_UPSTREAM_API || 'https://h5-api.aoneroom.com/wefeed-h5api-bff';
const isProd = import.meta.env.PROD;
const logLevel = import.meta.env.VITE_LOG_LEVEL || 'warn';

const shouldLog = (level) => {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  return levels[level] >= levels[logLevel];
};

const log = (level, message, data = '') => {
  if (shouldLog(level)) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [StreamWave] ${level.toUpperCase()}: ${message}`, data);
  }
};

const apiClient = axios.create({
  // Dev: use Vite proxy at `/api` → proxied to https://h5-api.aoneroom.com/wefeed-h5api-bff
  // Prod: use real base API
  baseURL: import.meta.env.VITE_API_BASE_URL || (isProd ? PROD_API_BASE : '/api'),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '15000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'lang': 'en',
    'versioncode': '11',
    'clienttype': '0',
  },
});

/* ========================================
   Request Interceptor — Log outgoing requests
   ======================================== */
apiClient.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    const params = config.params ? `?${new URLSearchParams(config.params).toString()}` : '';
    log('debug', `Request: ${config.method?.toUpperCase()} ${fullUrl}${params}`);
    return config;
  },
  (error) => {
    log('error', 'Request setup error', error.message);
    return Promise.reject(error);
  }
);

/* ========================================
   Response Interceptor — Handle all status codes
   ======================================== */
apiClient.interceptors.response.use(
  (response) => {
    log('debug', `Response: ${response.status} ${response.config.url}`, `Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
    return response;
  },
  (error) => {
    const config = error.config || {};
    const url = config.url || 'unknown';

    if (error.code === 'ECONNABORTED') {
      log('error', `Request timeout (${config.timeout}ms): ${url}`);
    } else if (error.code === 'ERR_NETWORK') {
      log('error', `Network error: ${url}`, error.message);
    } else if (error.response) {
      const { status, statusText, data } = error.response;
      log(
        'error',
        `API Error ${status} ${statusText}: ${url}`,
        `Response: ${JSON.stringify(data).substring(0, 100)}...`
      );

      // Handle specific status codes
      switch (status) {
        case 400:
          log('warn', 'Bad Request (400) — Check request params/body');
          break;
        case 401:
          log('warn', 'Unauthorized (401) — Check authentication');
          break;
        case 403:
          log('warn', 'Forbidden (403) — Check permissions');
          break;
        case 404:
          log('warn', `Not Found (404) — Endpoint does not exist: ${url}`);
          break;
        case 429:
          log('warn', 'Rate Limited (429) — Too many requests');
          break;
        case 500:
          log('error', `Server Error (500) — Upstream service error: ${url}`);
          break;
        case 502:
          log('error', '502 Bad Gateway — Upstream service unavailable');
          break;
        case 503:
          log('error', '503 Service Unavailable — Upstream service down');
          break;
        default:
          log('error', `Unhandled status ${status}`);
      }
    } else if (error.request && !error.response) {
      log('error', 'No response received', error.message);
    } else {
      log('error', 'Request error', error.message);
    }

    return Promise.reject(error);
  }
);

/* ========================================
   Debug API for testing endpoints
   ======================================== */
export const debugApi = {
  /**
   * Test an endpoint and return full debug info
   * @param {string} endpoint - Endpoint path
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Debug info with URL, status, response
   */
  testEndpoint: async (endpoint, params = {}) => {
    const startTime = performance.now();     const fullUrl = `${apiClient.defaults.baseURL}${endpoint}`;     const urlWithParams = params && Object.keys(params).length > 0 
      ? `${fullUrl}?${new URLSearchParams(params).toString()}`
      : fullUrl;

    try {     const response = await apiClient.get(endpoint, { params });      const endTime = performance.now();      return {         endpoint,         method: 'GET',         fullUrl,         urlWithParams,         params,         status: response.status,         statusText: response.statusText,         responseData: response.data,         responseSize: JSON.stringify(response.data).length,         time: Math.round(endTime - startTime),         success: true,         error: null,       };     } catch (error) {       const endTime = performance.now();        return {         endpoint,         method: 'GET',         fullUrl,         urlWithParams,         params,         status: error.response?.status || 'N/A',         statusText: error.response?.statusText || error.message,         responseData: error.response?.data || error.message,         responseSize: error.response?.data ? JSON.stringify(error.response.data).length : 0,         time: Math.round(endTime - startTime),         success: false,         error: error.message,       };     }   },    /**    * Test multiple endpoints and return results    * @param {Array} endpoints - Array of {endpoint, params}    * @returns {Promise<Array>} Results for each endpoint    */   testEndpoints: async (endpoints) => {     return Promise.all(       endpoints.map((item) =>         debugApi.testEndpoint(item.endpoint, item.params)       )     );   }, };  export default apiClient; export { log };
