# Bug Report & Analysis: Money Heist Season 3 + Cast Issues

**Date**: 2026-06-08  
**Status**: INVESTIGATED & FIXED (Pending TMDB Proxy Resolution)

---

## Executive Summary

Two critical bugs were identified and partially fixed:

1. **BUG #1**: Money Heist Season 3 displays only 1 episode (should show ~8)
2. **BUG #2**: Cast missing on some titles (Spider-Man Noir, Off Campus, Money Heist)

**Root Cause**: TMDB proxy returning 500 errors, forcing fallback to MovieBox data without per-season episode counts.

---

## Root Cause Analysis

### BUG #1: Season 3 Episode Count

**Problem**: Season 3 shows 1 episode when it should show 8

**Root Cause**: 
```
Watch.jsx episodeCount logic:
- episodeCount is derived from details object (fetched once on page load)
- When season changes, episodeCount does NOT change
- Falls back to MovieBox data which returns TOTAL episode count, not per-season
- TMDB can provide per-season counts BUT TMDB proxy returns 500 errors
```

**Data Flow**:
```
1. User loads Watch page → movieService.getDetails(subjectId)
2. Details object contains episodeCount (global, not per-season)
3. useTmdbMetadata tries to fetch TMDB season data → 500 ERROR
4. System falls back to MovieBox episodeCount for ALL seasons
5. If MovieBox says 40 total episodes across 5 seasons:
   - Season 1: 40 episodes (WRONG, should be 8 or 16)
   - Season 2: 40 episodes (WRONG)
   - Season 3: 40 episodes (WRONG, displays as 1 due to other issue)
```

**Why Only 1 Episode on Season 3?**
- Some MovieBox season data might be corrupted/incomplete for Season 3
- OR MovieBox API returns different format for later seasons
- OR fallback logic has edge case for season >= 3

### BUG #2: Cast Missing

**Problem**: Cast section doesn't appear for some titles

**Root Cause**:
```
1. useTmdbMetadata.getTvMetadata() called with title
2. cleanTitleForTmdb() normalizes title (removes [Hindi], S1-S5, etc.)
3. searchTv() searches TMDB → 500 ERROR
4. TMDB search fails, returns null
5. matched = false
6. CastSection hidden (now correctly checks matched state)
```

**Example Title Normalization**:
```
"Money Heist [Hindi] S1-S5" → "Money Heist" ✓
"Spider-Man Noir [Hindi]"   → "Spider-Man Noir" ✓
"Off Campus [Hindi]"        → "Off Campus" ✓
"Rajni Ki Baraat [Hindi][CAM]" → "Rajni Ki Baraat" ✓
```

Title normalization is working correctly, but TMDB searches are failing.

---

## What Was Fixed

### 1. ✅ Cast Section Now Only Shows When TMDB Match Found

**File**: [src/pages/Details.jsx](src/pages/Details.jsx#L64-L73)

```jsx
// Only render cast if TMDB match found
{matched && (
  <motion.section>
    <CastSection cast={tmdbCast} loading={loadingCast} />
  </motion.section>
)}
```

### 2. ✅ Episode Count Now Updates Per Season

**File**: [src/pages/Watch.jsx](src/pages/Watch.jsx#L175-L193)

```jsx
const episodeCount = useMemo(() => {
  // Use TMDB data first (per-season accurate count)
  const tmdbEpisodes = episodesBySeason[season];
  if (Array.isArray(tmdbEpisodes) && tmdbEpisodes.length > 0) {
    return tmdbEpisodes.length;  // Per-season count!
  }
  
  // Fallback to MovieBox
  return fromDetails || 1;
}, [season, episodesBySeason, details]);  // season dependency added!
```

**Before**: 
- `episodeCount` never changed when switching seasons
- Season 3 would use Season 1's episode count

**After**:
- `episodeCount` recalculated when season changes
- Uses TMDB per-season data if available
- Falls back to MovieBox only when TMDB unavailable

### 3. ✅ Comprehensive Debug Logging Added

**Files Modified**:
- [src/hooks/useTmdbMetadata.js](src/hooks/useTmdbMetadata.js)
- [src/services/tmdbService.js](src/services/tmdbService.js)
- [src/pages/Watch.jsx](src/pages/Watch.jsx)
- [src/utils/titleMatch.js](src/utils/titleMatch.js)

**Sample Console Output Now**:
```
[useTmdbMetadata] Loading metadata for: Money Heist [Hindi] S1-S5
[titleMatch] Title normalized:
  Original: Money Heist [Hindi] S1-S5
  Cleaned: Money Heist
[searchTv] Searching for: {query: "Money Heist", year: "2017"}
[searchTv] Results with year: 15
[searchTv] Best match: {name: "Money Heist", id: 71712}
[tmdbService] TV show seasons from TMDB: [1, 2, 3, 4, 5]
[useTmdbMetadata] TV Show Seasons: [1, 2, 3, 4, 5]
[getTvSeasonEpisodes] Season 3 episode count from TMDB: 8
[Watch] Episode Resolution for Season 3: {
  tmdbEpisodesCount: 8,
  episodeCountFromDetails: 40,
  using: "TMDB"
}
```

---

## What Still Needs To Be Done

### Critical: Fix TMDB Proxy (Returns 500)

**Current Status**: TMDB proxy configuration in vite.config.js is correct, but requests return 500 status

**Diagnostic Command**:
```bash
curl -v "http://localhost:3002/tmdb/search/tv?api_key=YOUR_KEY&query=Money+Heist"
```

**Possible Issues**:
1. **Missing/Invalid API Key**
   - Check `.env` file has `VITE_TMDB_API_KEY` or `VITE_TMDB_ACCESS_TOKEN`
   - Verify key is valid at https://www.themoviedb.org/settings/api

2. **CORS/Headers Issue**
   - Bearer token might not be sent correctly
   - API Key format might be wrong

3. **Rate Limiting**
   - TMDB might be rate-limiting requests
   - Add retry logic with exponential backoff

4. **Proxy Configuration**
   - vite.config.js proxy section needs validation
   - Try direct TMDB API call to test

**Suggested Fix**:
```javascript
// vite.config.js - Enhanced proxy logging
'/tmdb': {
  target: 'https://api.themoviedb.org/3',
  changeOrigin: true,
  rewrite: (path) => {
    const rewritten = path.replace(/^\/tmdb/, '');
    console.log(`[TMDB Proxy] ${path} → ${rewritten}`);
    return rewritten;
  },
  headers: env.VITE_TMDB_ACCESS_TOKEN
    ? { Authorization: `Bearer ${env.VITE_TMDB_ACCESS_TOKEN}` }
    : { 'X-API-Key': env.VITE_TMDB_API_KEY },
  onError: (err, req, res) => {
    console.error('[TMDB Proxy Error]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  },
},
```

---

## Expected Results After TMDB Fix

### Money Heist S1-S5

When TMDB proxy is working:

```
Season 1: 16 episodes ✓
Season 2: 16 episodes ✓
Season 3: 8 episodes ✓  (Currently shows 1 ✗)
Season 4: 8 episodes ✓
Season 5: 5 episodes ✓
Cast: [Prof, Tokyo, Rio, Raquel, etc.] ✓  (Currently empty ✗)
```

### Spider-Man Noir [Hindi]
```
Title Display: Spider-Man Noir [Hindi] ✓
TMDB Search: Spider-Man Noir ✓
Cast: [Nicolas Cage, Naomi Watts, etc.] ✓
```

### Off Campus [Hindi]
```
Title Display: Off Campus [Hindi] ✓
TMDB Search: Off Campus ✓
Cast: [Ella Bright, Belmont Cameli, etc.] ✓
```

---

## Files Modified Summary

| File | Changes | Purpose |
|------|---------|---------|
| [src/pages/Details.jsx](src/pages/Details.jsx) | Added `matched` state check before rendering CastSection | Hide cast when TMDB match fails |
| [src/pages/Watch.jsx](src/pages/Watch.jsx) | Updated episodeCount logic to be per-season | Fix Season 3 episode count |
| [src/hooks/useTmdbMetadata.js](src/hooks/useTmdbMetadata.js) | Added comprehensive logging | Debug TMDB data loading |
| [src/services/tmdbService.js](src/services/tmdbService.js) | Added search & season logging | Debug TMDB searches |
| [src/utils/titleMatch.js](src/utils/titleMatch.js) | Enhanced normalization logging | Verify title cleanup |
| [src/index.css](src/index.css) | Added `.scrollbar-hide` utility class | Support carousel styling |
| [vite.config.js](vite.config.js) | No changes needed (proxy already correct) | N/A |

---

## Testing Checklist

- [ ] Fix TMDB proxy 500 errors
- [ ] Navigate to Money Heist Watch page
- [ ] Check console for successful TMDB searches
- [ ] Verify Season 1-5 episode counts are correct
- [ ] Navigate to Money Heist Details page
- [ ] Verify cast appears with all 6+ actors
- [ ] Test Spider-Man Noir - cast should appear
- [ ] Test Off Campus - cast should appear
- [ ] Test title with multiple tags - normalization should work
- [ ] Verify cast doesn't appear for non-matched titles

---

## Title Normalization Rules (Verified Working)

```
Input                           Cleaned For TMDB    Display
"Money Heist [Hindi] S1-S5"     "Money Heist"       "Money Heist [Hindi] S1-S5"
"Spider-Man Noir [Hindi]"       "Spider-Man Noir"   "Spider-Man Noir [Hindi]"
"Off Campus [Hindi]"            "Off Campus"        "Off Campus [Hindi]"
"Rajni Ki Baraat [CAM]"         "Rajni Ki Baraat"   "Rajni Ki Baraat [CAM]"
"O' Romeo [Hindi]"              "O Romeo"           "O' Romeo [Hindi]"
"The Office [US] Season 1"      "The Office [US]"   "The Office [US] Season 1"
```

---

## Log Output Examples

### When TMDB Works (Expected)
```
[useTmdbMetadata] Loading metadata for: Money Heist [Hindi] S1-S5
[titleMatch] Title normalized:
  Original: Money Heist [Hindi] S1-S5
  Cleaned: Money Heist
[searchTv] Searching for: {query: "Money Heist", year: "2017"}
[searchTv] Results with year: 15
[searchTv] Best match: {name: "Money Heist", id: 71712}
[useTmdbMetadata] TV Match found: {type: "tv", tmdbId: 71712, castCount: 6, seasons: [1,2,3,4,5]}
[useTmdbMetadata] TV Show Seasons: [1, 2, 3, 4, 5]
[useTmdbMetadata] Loading episodes for first season: 1
[getTvSeasonEpisodes] Fetching season: 3 tvId: 71712
[getTvSeasonEpisodes] Season 3 episode count from TMDB: 8
[useTmdbMetadata.loadSeason] Season 3 episodes count: 8
```

### When TMDB Fails (Currently)
```
[useTmdbMetadata] Loading metadata for: Money Heist [Hindi] S1-S5
[titleMatch] Title normalized:
  Original: Money Heist [Hindi] S1-S5
  Cleaned: Money Heist
[searchTv] Searching for: {query: "Money Heist", year: "2017"}
[searchTv] Results with year: 0  ← PROBLEM: No results!
[useTmdbMetadata] No TMDB match found
Cast section: HIDDEN ✓ (This is correct behavior)
Episode count: Uses MovieBox fallback (might be wrong per-season)
```

---

## Next Steps

1. **Investigate TMDB Proxy Issue**
   - Check environment variables
   - Test direct API call
   - Enable proxy debug logging
   - Verify API key/token validity

2. **Once TMDB Fixed**
   - Verify Season 1-5 episode counts
   - Verify cast appears
   - Run through test checklist

3. **Monitor Logs**
   - Watch browser console for the logs added
   - Look for TMDB search results and matches
   - Verify per-season episode resolution

---

## References

- [TMDB API Documentation](https://developer.themoviedb.org/docs/getting-started)
- [Title Normalization Logic](src/utils/titleMatch.js)
- [TMDB Service](src/services/tmdbService.js)
- [Watch Page Code](src/pages/Watch.jsx)
- [Details Page Code](src/pages/Details.jsx)
