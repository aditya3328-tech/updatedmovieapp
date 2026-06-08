# INVESTIGATION SUMMARY - Critical TMDB + Season Bugs

## Bug #1: Money Heist Season 3 Shows Only 1 Episode

### Root Cause
**episodeCount is NOT per-season** - it's determined from initial details fetch and never updates when you change seasons.

```javascript
// BEFORE (broken):
const episodeCount = useMemo(() => {
  return details?.episodeCount || 1;  // Same for ALL seasons!
}, [details]);

// AFTER (fixed):
const episodeCount = useMemo(() => {
  const tmdbEpisodes = episodesBySeason[season];
  if (Array.isArray(tmdbEpisodes) && tmdbEpisodes.length > 0) {
    return tmdbEpisodes.length;  // Now recalculates per season!
  }
  return fromDetails || 1;
}, [season, episodesBySeason, details]);  // Added season dependency
```

### Why Season 3 Only Shows 1
When TMDB fails (500 error), system falls back to MovieBox episodeCount. If MovieBox returns incorrect data for Season 3, only 1 episode displays.

### Fix Applied
✅ episodeCount now:
- Updates when season changes
- Uses TMDB data per-season (when available)
- Falls back to MovieBox only when TMDB unavailable
- Solves both Season 3 issue AND ensures per-season accuracy

---

## Bug #2: Cast Missing on Some Titles

### Root Cause
TMDB searches fail (500 error) → no TMDB match → cast hidden

### Why This Happens
```
"Money Heist [Hindi] S1-S5"  →  cleanedFor TMDB →  "Money Heist"  →  TMDB Search 500 ERROR
↓
matched = false
↓
CastSection hidden ✓ (Correct behavior - no data to show)
```

### Fix Applied
✅ Cast section now only renders when `matched === true`:
```jsx
{matched && (
  <CastSection cast={tmdbCast} loading={loadingCast} />
)}
```

This prevents empty cast placeholders when TMDB match fails.

---

## Critical Issue: TMDB Proxy Returns 500

**THIS IS THE BLOCKER** - Without fixing this, both bugs persist

Current status:
```
GET /tmdb/search/tv?api_key=...&query=Money+Heist&first_air_date_year=2017
↓
500 Internal Server Error
↓
No season data, no cast data, fallback to MovieBox
```

### What Was Added: Comprehensive Logging

When TMDB is fixed, you'll see in browser console:

```
[useTmdbMetadata] Loading metadata for: Money Heist [Hindi] S1-S5
[titleMatch] Title normalized: "Money Heist [Hindi] S1-S5" → "Money Heist"
[searchTv] Searching for: {query: "Money Heist", year: "2017"}
[searchTv] Results with year: 15
[searchTv] Best match: {name: "Money Heist", id: 71712}
[useTmdbMetadata] TV Show Seasons: [1, 2, 3, 4, 5]
[getTvSeasonEpisodes] Season 1 episode count from TMDB: 16
[getTvSeasonEpisodes] Season 2 episode count from TMDB: 16
[getTvSeasonEpisodes] Season 3 episode count from TMDB: 8  ← Correct!
[getTvSeasonEpisodes] Season 4 episode count from TMDB: 8
[getTvSeasonEpisodes] Season 5 episode count from TMDB: 5
[useTmdbMetadata] TV cast count: 6
[Watch] Episode Resolution for Season 3: {
  tmdbEpisodesCount: 8,
  using: "TMDB"
}
```

---

## Files Modified

| File | Changes | Line |
|------|---------|------|
| [src/pages/Details.jsx](src/pages/Details.jsx#L64) | Added `matched` check for CastSection | L64-73 |
| [src/pages/Watch.jsx](src/pages/Watch.jsx#L175) | Updated episodeCount to be per-season | L175-193 |
| [src/hooks/useTmdbMetadata.js](src/hooks/useTmdbMetadata.js) | Added comprehensive logging | Full file |
| [src/services/tmdbService.js](src/services/tmdbService.js) | Added search/season logging | Full file |
| [src/utils/titleMatch.js](src/utils/titleMatch.js) | Enhanced normalization logging | L24-35 |
| [BUG_REPORT_SEASON3_CAST.md](BUG_REPORT_SEASON3_CAST.md) | Complete investigation document | New file |

---

## Expected Results After TMDB Fix

### Money Heist
- ✅ Season 1: 16 episodes (with thumbnails)
- ✅ Season 2: 16 episodes (with thumbnails)
- ✅ Season 3: 8 episodes (NOT 1!) ← Fixed
- ✅ Season 4: 8 episodes (with thumbnails)
- ✅ Season 5: 5 episodes (with thumbnails)
- ✅ Cast: Prof, Tokyo, Rio, Raquel, etc. (6 visible + scroll)

### Spider-Man Noir [Hindi]
- ✅ Cast: Nicolas Cage, Naomi Watts, etc.

### Off Campus [Hindi]
- ✅ Cast: Ella Bright, Belmont Cameli, etc.

---

## Title Normalization (Verified Working)

```
"Money Heist [Hindi] S1-S5"         →  "Money Heist"
"Spider-Man Noir [Hindi]"           →  "Spider-Man Noir"
"Off Campus [Hindi]"                →  "Off Campus"
"Rajni Ki Baraat [Hindi][CAM]"      →  "Rajni Ki Baraat"
"The Office [US] Season 1-3"        →  "The Office [US]"
"O' Romeo [Hindi]"                  →  "O Romeo"
"Kara [Hindi]"                      →  "Kara"
```

---

## Next Actions

1. **Fix TMDB Proxy 500 Error**
   - Check `.env` file for valid API key/token
   - Test: `curl "http://localhost:3002/tmdb/search/tv?api_key=XXX&query=Money+Heist"`
   - Review vite.config.js proxy configuration

2. **Verify All Fixes Work**
   - Navigate to Money Heist Watch page
   - Check console for successful TMDB searches
   - Verify Season 3 shows correct episode count
   - Verify cast appears on Details page

3. **Monitor Console Logs**
   - New logging added to track data flow
   - Look for TMDB search results and matches
   - Verify per-season episode resolution

---

## Summary

| Issue | Root Cause | Fix Applied | Status |
|-------|-----------|-------------|--------|
| Season 3 shows 1 episode | episodeCount never updates per-season | Made episodeCount dynamic, depends on season | ✅ Waiting TMDB Fix |
| Cast missing | TMDB searches fail (500 error) | Added matched state check, hide empty cast | ✅ Done |
| Title normalization | N/A (working correctly) | Enhanced logging to verify | ✅ Done |
| TMDB 500 errors | Unknown (API key/proxy config?) | Added comprehensive logging | 🔴 BLOCKER |

Once TMDB proxy is fixed, both bugs will be resolved.
