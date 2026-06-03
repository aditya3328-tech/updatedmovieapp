# StreamWave API Integration Documentation

## Architecture Overview

The StreamWave application uses a **Vite Proxy** pattern in development to forward API requests to the upstream service while avoiding CORS issues. In production, requests go directly to the API.

```
Development:
  Browser → Vite Dev Server (:3000) → Vite Proxy (/api/*) → Upstream API (https://h5-api.aoneroom.com)

Production:
  Browser → Built App → Direct to API (https://h5-api.aoneroom.com)
```

## Environment Variables

### `.env` (Development)
```bash
VITE_API_BASE=/api                    # Dev proxy path
VITE_API_BASE_URL=/api                # Fallback
VITE_API_TIMEOUT=15000                # Request timeout (ms)
VITE_LOG_LEVEL=debug                  # Console logging: debug, info, warn, error
VITE_UPSTREAM_API=https://h5-api...   # Upstream API for production fallback
VITE_STREAM_BACKEND_URL=/stream-api  # Local backend resolver proxy
```

### `.env.production` (Production)
```bash
VITE_API_BASE_URL=https://h5-api.aoneroom.com/wefeed-h5api-bff
VITE_UPSTREAM_API=https://h5-api.aoneroom.com/wefeed-h5api-bff
VITE_API_TIMEOUT=15000
VITE_LOG_LEVEL=warn                   # Only log warnings/errors in production
```

## Vite Configuration (`vite.config.js`)

The proxy is configured to:
- Listen for requests to `/api/*`
- Forward to `https://h5-api.aoneroom.com/wefeed-h5api-bff/*`
- Remove `/api` prefix from request path before forwarding
- Add required headers (Origin, Referer, User-Agent)
- Log proxy activity

```javascript
proxy: {
  '/api': {
    target: 'https://h5-api.aoneroom.com/wefeed-h5api-bff',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
    headers: { /* CORS headers */ },
  },
  '/stream-api': {
    target: 'http://localhost:4000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/stream-api/, ''),
    logLevel: 'info',
  },
}
```

## Axios Client (`src/api/axios.js`)

Features:
- **Dynamic Base URL**: Uses `/api` in dev (proxy), direct API in production
- **Request Logging**: Logs all outgoing requests with parameters
- **Response Logging**: Logs all responses with status and data preview
- **Error Handling**: Handles 400, 401, 403, 404, 429, 500, 502, 503 status codes
- **Timeout Handling**: Logs timeout errors with configured timeout duration
- **Network Error Handling**: Logs connection/network errors
- **Logging Levels**: debug, info, warn, error (configurable via VITE_LOG_LEVEL)

### Request/Response Cycle Example

```
Request:
  [2024-05-30T10:00:00Z] [StreamWave] DEBUG: Request: GET /api/everyone-search?keyword=test&page=1

Response (Success):
  [2024-05-30T10:00:01Z] [StreamWave] DEBUG: Response: 200 /everyone-search Data: {"list":[...]}

Response (Error):
  [2024-05-30T10:00:02Z] [StreamWave] ERROR: API Error 404 Not Found: /everyone-search Response: 404 page not found
  [2024-05-30T10:00:02Z] [StreamWave] WARN: Not Found (404) — Endpoint does not exist: /everyone-search
```

## Endpoints (`src/api/endpoints.js`)

```javascript
{
  SEARCH: '/everyone-search',              // GET - Search movies/series/anime
  PLAY: '/subject/play',                   // GET - Get playback streams
  CAPTION: '/caption',                     // GET - Get captions/subtitles
  RECOMMENDATIONS: '/subject/detail-rec',  // GET - Get recommendations
  BOTTOM_TABS: '/get-bottom-tab-list',     // GET - Get navigation tabs
  WEB_CONFIG: '/webConfig',                // GET - Get web configuration
}
```

## Movie Service (`src/services/movieService.js`)

All methods include:
- Request/response logging
- Error logging with context
- Full error propagation for caller handling
- JSDoc documentation

### Available Methods

#### `search(query, page = 1, { signal } = {})`
Search for movies, series, anime by keyword.

```javascript
const response = await movieService.search('Naruto', 1, { signal: abortController.signal });
// Returns: { data: { list: [...], total: 100 }, status: 200, headers: {...} }
```

#### `getStreams(subjectId, season = 1, episode = 1)`
Get playback streams for a specific episode.

```javascript
const streams = await movieService.getStreams('12345', 1, 1);
// Returns: { urls: [...], qualities: [...] }
```

#### `getCaptions(streamId, format = 'MP4')`
Get captions/subtitles for a stream.

```javascript
const captions = await movieService.getCaptions('stream-123', 'MP4');
// Returns: { language: 'en', url: '...', format: 'srt' }
```

#### `getRecommendations(subjectId, page = 1)`
Get recommended content similar to a subject.

```javascript
const recs = await movieService.getRecommendations('12345', 1);
// Returns: { list: [...], total: 50 }
```

#### `getBottomTabs()`
Get bottom navigation menu.

```javascript
const tabs = await movieService.getBottomTabs();
// Returns: { tabs: [...] }
```

#### `getWebConfig()`
Get web application configuration.

```javascript
const config = await movieService.getWebConfig();
// Returns: { theme: '...', features: {...} }
```

#### `getTrending(page = 1)`
Get trending content.

```javascript
const trending = await movieService.getTrending(1);
// Returns: { list: [...], total: 100 }
```

#### `getPopular(page = 1)`
Get popular content.

```javascript
const popular = await movieService.getPopular(1);
// Returns: { list: [...], total: 100 }
```

## Error Handling

All methods throw errors on failure. Handle them in components:

```javascript
try {
  const response = await movieService.search('test', 1);
  // Process response.data
} catch (error) {
  if (error.response?.status === 404) {
    // Endpoint not found
  } else if (error.code === 'ECONNABORTED') {
    // Timeout
  } else if (error.code === 'ERR_NETWORK') {
    // Network error
  } else {
    // Other error
  }
}
```

## Running the Application

### Development
```bash
npm install
npm run dev
```

- Dev server: http://localhost:3000
- Proxy active: /api/* → https://h5-api.aoneroom.com/wefeed-h5api-bff/*
- Logging: debug level (all requests/responses logged)
- Hot reload: enabled

### Production Build
```bash
npm run build
npm run preview  # Preview built app locally
```

- No proxy (direct API calls)
- Logging: warn level (only warnings/errors)
- Minified + optimized

## Debugging Tips

### View Proxy Activity
- Open browser DevTools → Network tab
- Look for `/api/*` requests and their responses
- Check Response headers for `access-control-allow-origin`

### View Console Logs
- Open browser DevTools → Console tab
- Filter for `[StreamWave]` messages
- Set `VITE_LOG_LEVEL=debug` in `.env` for detailed logging

### Test Endpoint Directly
```bash
# Dev proxy
curl "http://localhost:3000/api/everyone-search?keyword=test&page=1" -v

# Upstream API
curl "https://h5-api.aoneroom.com/wefeed-h5api-bff/everyone-search?keyword=test&page=1" \
  -H "Origin: https://web.aoneroom.com" \
  -v
```

### Check Vite Proxy Logs
- Terminal running `npm run dev` shows proxy activity
- Look for messages like `[Vite Proxy] /api/everyone-search → /everyone-search`

## File Structure

```
streamwave/
├── .env                          # Dev environment variables
├── .env.production               # Production environment variables
├── vite.config.js                # Vite config with proxy
├── src/
│   ├── api/
│   │   ├── axios.js              # Axios client with interceptors
│   │   └── endpoints.js          # API endpoint constants
│   ├── services/
│   │   └── movieService.js       # Service methods for all API calls
│   ├── hooks/
│   │   └── useSearch.js          # Search hook (uses movieService)
│   └── ...
└── package.json
```

## Troubleshooting

### 404 Errors
- Endpoint doesn't exist on upstream API
- Check upstream API status
- Verify endpoint path in `ENDPOINTS` constant
- Check request parameters (query string, body)

### CORS Errors
- Proxy headers may be incorrect
- Check `vite.config.js` proxy configuration
- Verify upstream API allows requests from your origin

### Timeout Errors
- Network is slow or upstream API is slow
- Increase `VITE_API_TIMEOUT` in `.env`
- Check upstream API status

### No Logs
- Check `VITE_LOG_LEVEL` setting (should be "debug" in dev)
- Restart dev server after changing `.env`
- Check browser console (not terminal)

## Production Deployment

1. Create `.env.production` with production API URL
2. Run `npm run build`
3. Deploy `dist/` folder to your hosting
4. API calls will use `VITE_API_BASE_URL` from `.env.production`

---

For issues or questions, check:
- Browser DevTools Network tab (request/response)
- Browser DevTools Console tab ([StreamWave] logs)
- Terminal running `npm run dev` (proxy activity)
- Upstream API documentation
