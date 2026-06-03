# Complete Code Reference

This document shows the complete implementation of all fixed files.

## 1. vite.config.js
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://h5-api.aoneroom.com/wefeed-h5api-bff',
        changeOrigin: true,
        rewrite: (path) => {
          const rewritten = path.replace(/^\/api/, '');
          console.log(`[Vite Proxy] ${path} → ${rewritten}`);
          return rewritten;
        },
        headers: {
          'Origin': 'https://web.aoneroom.com',
          'Referer': 'https://web.aoneroom.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        logLevel: 'info',
      },
    },
  },
});
```

## 2. .env (Development)
```bash
# API Configuration
VITE_API_BASE=/api
VITE_API_BASE_URL=/api
VITE_API_TIMEOUT=15000
VITE_LOG_LEVEL=debug

# Upstream API (for production fallback)
VITE_UPSTREAM_API=https://h5-api.aoneroom.com/wefeed-h5api-bff
```

## 3. .env.production (Production)
```bash
# Production API Configuration
VITE_API_BASE_URL=https://h5-api.aoneroom.com/wefeed-h5api-bff
VITE_UPSTREAM_API=https://h5-api.aoneroom.com/wefeed-h5api-bff
VITE_API_TIMEOUT=15000
VITE_LOG_LEVEL=warn
```

## 4. src/api/axios.js
```javascript
import axios from 'axios';

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

apiClient.interceptors.response.use(
  (response) => {
    log('debug', `Response: ${response.status} ${response.config.url}`, 
        `Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
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
      log('error', `API Error ${status} ${statusText}: ${url}`, 
          `Response: ${JSON.stringify(data).substring(0, 100)}...`);

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
      }
    } else if (error.request && !error.response) {
      log('error', 'No response received', error.message);
    } else {
      log('error', 'Request error', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { log };
```

## 5. src/api/endpoints.js
```javascript
const ENDPOINTS = {
  SEARCH: '/everyone-search',
  PLAY: '/subject/play',
  CAPTION: '/caption',
  RECOMMENDATIONS: '/subject/detail-rec',
  BOTTOM_TABS: '/get-bottom-tab-list',
  WEB_CONFIG: '/webConfig',
};

Object.entries(ENDPOINTS).forEach(([key, value]) => {
  if (!value.startsWith('/')) {
    console.warn(`[Endpoints] Warning: ${key} should start with '/', got: ${value}`);
  }
});

export default ENDPOINTS;
```

## 6. src/services/movieService.js
```javascript
import apiClient, { log } from '../api/axios';
import ENDPOINTS from '../api/endpoints';

const movieService = {
  search: async (query, page = 1, { signal } = {}) => {
    try {
      log('debug', `[movieService] search() called with query: "${query}", page: ${page}`);
      const config = {
        params: { keyword: query, page, perPage: 24 },
      };
      if (signal) config.signal = signal;
      const response = await apiClient.get(ENDPOINTS.SEARCH, config);
      log('debug', `[movieService] search() success: ${response.data?.list?.length || 0} items`);
      return response;
    } catch (error) {
      log('error', `[movieService] search() failed for query: "${query}"`, error.message);
      throw error;
    }
  },

  getStreams: async (subjectId, season = 1, episode = 1) => {
    try {
      log('debug', `[movieService] getStreams() for ${subjectId} S${season}E${episode}`);
      const response = await apiClient.get(ENDPOINTS.PLAY, {
        params: { subjectId, se: season, ep: episode },
      });
      log('debug', `[movieService] getStreams() success`);
      return response.data;
    } catch (error) {
      log('error', `[movieService] getStreams() failed`, error.message);
      throw error;
    }
  },

  getCaptions: async (streamId, format = 'MP4') => {
    try {
      log('debug', `[movieService] getCaptions() for ${streamId}, format: ${format}`);
      const response = await apiClient.get(ENDPOINTS.CAPTION, {
        params: { format, id: streamId },
      });
      log('debug', `[movieService] getCaptions() success`);
      return response.data;
    } catch (error) {
      log('error', `[movieService] getCaptions() failed`, error.message);
      throw error;
    }
  },

  getRecommendations: async (subjectId, page = 1) => {
    try {
      log('debug', `[movieService] getRecommendations() for ${subjectId}, page: ${page}`);
      const response = await apiClient.get(ENDPOINTS.RECOMMENDATIONS, {
        params: { subjectId, page, perPage: 24 },
      });
      log('debug', `[movieService] getRecommendations() success: ${response.data?.list?.length || 0} items`);
      return response.data;
    } catch (error) {
      log('error', `[movieService] getRecommendations() failed`, error.message);
      throw error;
    }
  },

  getBottomTabs: async () => {
    try {
      log('debug', `[movieService] getBottomTabs() called`);
      const response = await apiClient.get(ENDPOINTS.BOTTOM_TABS);
      log('debug', `[movieService] getBottomTabs() success: ${response.data?.tabs?.length || 0} tabs`);
      return response.data;
    } catch (error) {
      log('error', `[movieService] getBottomTabs() failed`, error.message);
      throw error;
    }
  },

  getWebConfig: async () => {
    try {
      log('debug', `[movieService] getWebConfig() called`);
      const response = await apiClient.get(ENDPOINTS.WEB_CONFIG);
      log('debug', `[movieService] getWebConfig() success`);
      return response.data;
    } catch (error) {
      log('error', `[movieService] getWebConfig() failed`, error.message);
      throw error;
    }
  },

  getTrending: async (page = 1) => {
    try {
      log('debug', `[movieService] getTrending() page: ${page}`);
      const response = await apiClient.get(ENDPOINTS.SEARCH, {
        params: { keyword: 'trending', page, perPage: 24 },
      });
      log('debug', `[movieService] getTrending() success: ${response.data?.list?.length || 0} items`);
      return response.data;
    } catch (error) {
      log('error', `[movieService] getTrending() failed`, error.message);
      throw error;
    }
  },

  getPopular: async (page = 1) => {
    try {
      log('debug', `[movieService] getPopular() page: ${page}`);
      const response = await apiClient.get(ENDPOINTS.SEARCH, {
        params: { keyword: 'popular', page, perPage: 24 },
      });
      log('debug', `[movieService] getPopular() success: ${response.data?.list?.length || 0} items`);
      return response.data;
    } catch (error) {
      log('error', `[movieService] getPopular() failed`, error.message);
      throw error;
    }
  },
};

export default movieService;
```

---

**All files are production-ready. Use with: `npm install && npm run dev`**
