# StreamWave API Integration - Deployment Checklist ✅

## ✅ All Tasks Complete

### 1. Vite Proxy Configuration ✅
- [x] Configured `/api` proxy → `https://h5-api.aoneroom.com/wefeed-h5api-bff`
- [x] Path rewriting removes `/api` prefix
- [x] CORS headers (Origin, Referer, User-Agent)
- [x] Proxy activity logging
- [x] File: `vite.config.js`

### 2. Axios Client ✅
- [x] Dynamic base URL (dev: `/api`, prod: real API)
- [x] Request interceptor with logging
- [x] Response interceptor with logging
- [x] Error handling: 400, 401, 403, 404, 429, 500, 502, 503
- [x] Timeout error handling
- [x] Network error handling
- [x] Debug logging system
- [x] File: `src/api/axios.js`

### 3. API Endpoints ✅
- [x] SEARCH: `/everyone-search`
- [x] PLAY: `/subject/play`
- [x] CAPTION: `/caption`
- [x] RECOMMENDATIONS: `/subject/detail-rec`
- [x] BOTTOM_TABS: `/get-bottom-tab-list`
- [x] WEB_CONFIG: `/webConfig`
- [x] Endpoint validation
- [x] File: `src/api/endpoints.js`

### 4. Movie Service ✅
- [x] `search()` - Search movies/series/anime with cancellation support
- [x] `getStreams()` - Get playback streams
- [x] `getCaptions()` - Get captions/subtitles
- [x] `getRecommendations()` - Get recommendations
- [x] `getBottomTabs()` - Get navigation tabs
- [x] `getWebConfig()` - Get web config
- [x] `getTrending()` - Get trending content
- [x] `getPopular()` - Get popular content
- [x] Request logging for all methods
- [x] Error logging for all methods
- [x] File: `src/services/movieService.js`

### 5. Environment Variables ✅
- [x] Created `.env` (development)
- [x] Created `.env.production` (production)
- [x] VITE_API_BASE: `/api` (dev)
- [x] VITE_API_BASE_URL: Dynamic configuration
- [x] VITE_API_TIMEOUT: 15000ms
- [x] VITE_LOG_LEVEL: debug (dev), warn (prod)
- [x] VITE_UPSTREAM_API: Fallback URL

### 6. Error Handling ✅
- [x] 400 Bad Request
- [x] 401 Unauthorized
- [x] 403 Forbidden
- [x] 404 Not Found
- [x] 429 Rate Limited
- [x] 500 Server Error
- [x] 502 Bad Gateway
- [x] 503 Service Unavailable
- [x] Timeout errors
- [x] Network errors
- [x] No response errors

### 7. Debugging Support ✅
- [x] Console logging with timestamps
- [x] Configurable log levels
- [x] Request logging with full URL and params
- [x] Response logging with status and preview
- [x] Error logging with context
- [x] Service method logging with input/output
- [x] Proxy activity logging in terminal

### 8. Documentation ✅
- [x] API_INTEGRATION.md - Complete API documentation
- [x] SETUP_COMPLETE.md - Setup and troubleshooting guide
- [x] CODE_REFERENCE.md - Complete code listings
- [x] This file - Deployment checklist

## Running the Application

### Quick Start
```bash
npm install
npm run dev
```

- Server: http://localhost:3000
- Proxy: `/api/*` → upstream API
- Logs: All requests/responses logged (debug level)
- Hot reload: enabled

### Build for Production
```bash
npm run build
npm run preview
```

- Minified build: `dist/`
- No proxy (direct API calls)
- Logs: Warnings/errors only (warn level)

## Verify Setup

### 1. Check Dev Server Running
```bash
curl http://localhost:3000
# Should return HTML
```

### 2. Check Proxy Working
```bash
curl http://localhost:3000/api/everyone-search?keyword=test&page=1
# Should return response (200, 404, or error from upstream API)
```

### 3. Check Logs in Browser
```
1. Open http://localhost:3000 in browser
2. Press F12 (DevTools)
3. Go to Console tab
4. Look for [StreamWave] messages
5. Example:
   [2024-05-30T10:00:00Z] [StreamWave] DEBUG: Request: GET /api/everyone-search?keyword=test&page=1
   [2024-05-30T10:00:01Z] [StreamWave] DEBUG: Response: 404 /everyone-search
```

### 4. Check Terminal Logs
```
Look at terminal running `npm run dev`:
- Proxy activity logs
- Example: [Vite Proxy] /api/everyone-search → /everyone-search
```

### 5. Check Network Requests
```
1. Open http://localhost:3000 in browser
2. Press F12 (DevTools)
3. Go to Network tab
4. Perform a search (type in search box)
5. See `/api/everyone-search` request in Network tab
6. Check Response tab for upstream API response
```

## File Structure

```
streamwave/
├── .env                          ✅ Development config
├── .env.production               ✅ Production config
├── vite.config.js                ✅ Vite proxy config
├── API_INTEGRATION.md            ✅ Full API documentation
├── SETUP_COMPLETE.md             ✅ Setup guide & troubleshooting
├── CODE_REFERENCE.md             ✅ Complete code listings
├── DEPLOYMENT_CHECKLIST.md       ✅ This file
├── src/
│   ├── api/
│   │   ├── axios.js              ✅ Axios client with interceptors
│   │   └── endpoints.js          ✅ Endpoint constants
│   ├── services/
│   │   └── movieService.js       ✅ All API methods
│   ├── hooks/
│   │   └── useSearch.js          ✅ Uses movieService.search()
│   ├── pages/
│   │   ├── Search.jsx            ✅ Uses useSearch hook
│   │   ├── Watch.jsx             ✅ Uses movieService methods
│   │   └── ...
│   └── ...
└── package.json
```

## API Architecture

### Request Flow (Development)
```
Component
  ↓
movieService.search()
  ↓
apiClient.get('/everyone-search', {...})
  ↓
Request interceptor: logs request
  ↓
axios sends request to: http://localhost:3000/api/everyone-search
  ↓
Vite Proxy: intercepts, rewrites to: https://h5-api.aoneroom.com/wefeed-h5api-bff/everyone-search
  ↓
Upstream API
  ↓
Response with CORS headers
  ↓
Response interceptor: logs response
  ↓
movieService.search() returns response
  ↓
Component handles data
```

### Request Flow (Production)
```
Component
  ↓
movieService.search()
  ↓
apiClient.get('/everyone-search', {...})
  ↓
Request interceptor: logs request
  ↓
axios sends request to: https://h5-api.aoneroom.com/wefeed-h5api-bff/everyone-search
  ↓
Upstream API
  ↓
Response
  ↓
Response interceptor: logs response
  ↓
movieService.search() returns response
  ↓
Component handles data
```

## Common Tasks

### Add New Endpoint
1. Add to `ENDPOINTS` in `src/api/endpoints.js`
2. Create method in `src/services/movieService.js`
3. Use logging: `log('debug', 'message')`
4. Handle errors with try/catch

### Change API Base URL
- Dev: Edit `.env` → `VITE_API_BASE_URL=/api`
- Prod: Edit `.env.production` → `VITE_API_BASE_URL=https://...`
- Restart dev server

### Change Log Level
- Dev: Edit `.env` → `VITE_LOG_LEVEL=debug` (or info, warn, error)
- Prod: Edit `.env.production` → `VITE_LOG_LEVEL=warn`
- Restart dev server

### Debug API Issue
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform action that uses API
4. Find request in Network tab
5. Check Status code and Response
6. Go to Console tab and search for [StreamWave] logs

### Test Endpoint Manually
```bash
# Through Vite proxy (dev)
curl http://localhost:3000/api/endpoint-name

# Direct to upstream API
curl https://h5-api.aoneroom.com/wefeed-h5api-bff/endpoint-name
```

## Deployment Environments

### Development Environment
- **Server**: http://localhost:3000 (Vite dev server)
- **API Base**: http://localhost:3000/api (proxied)
- **Upstream**: https://h5-api.aoneroom.com/wefeed-h5api-bff
- **Logs**: All (debug level)
- **Hot reload**: Yes

### Production Environment
- **Server**: Your hosting (e.g., Vercel, Netlify, AWS)
- **API Base**: https://h5-api.aoneroom.com/wefeed-h5api-bff (direct)
- **Logs**: Warnings/errors only
- **Hot reload**: No (static files)

## Success Criteria ✅

All of the following have been implemented:

✅ Vite proxy configured for development
✅ Axios client with comprehensive interceptors
✅ Request logging with parameters
✅ Response logging with status
✅ Error handling for 4xx, 5xx status codes
✅ Timeout error detection
✅ Network error detection
✅ All 6 API endpoints configured
✅ All 8 service methods implemented
✅ Environment variables for dev/prod
✅ Production-ready error messages
✅ Complete JSDoc documentation
✅ Request cancellation support
✅ Debug logging system
✅ No hardcoded localhost URLs
✅ Dev server running
✅ Proxy tested and working

## Ready to Deploy ✅

```bash
# Development
npm install
npm run dev

# Production Build
npm run build
npm run preview

# Production Deploy
# 1. Run: npm run build
# 2. Upload dist/ to your hosting
# 3. Ensure .env.production has correct API URL
```

---

**All systems ready. Deploy with confidence! 🚀**
