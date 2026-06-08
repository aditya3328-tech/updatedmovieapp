# Episode Thumbnails - Investigation & Fix

## 📋 Summary
Episode names are loading correctly from TMDB, but thumbnails were not displaying. This document outlines the investigation and implementation of episode thumbnail loading with fallback support.

---

## 1️⃣ TMDB Episode Response Structure

### Sample TMDB Episode Object
```json
{
  "air_date": "2024-09-15",
  "episode_number": 1,
  "episode_type": "standard",
  "id": 4159649,
  "name": "The Deal",
  "overview": "Episode overview text here...",
  "production_code": null,
  "runtime": 45,
  "season_number": 1,
  "show_id": 123456,
  "still_path": "/abc123def456.jpg",
  "vote_average": 8.2,
  "vote_count": 1234,
  "crew": [],
  "guest_stars": []
}
```

### Key Fields:
- **`still_path`**: Episode-specific thumbnail image path
  - Format: `/abc123.jpg`
  - Returns `null` if TMDB has no episode still
  - Used to generate: `https://image.tmdb.org/t/p/w500/abc123.jpg`

---

## 2️⃣ TMDB `still_path` Usage

### Direct Value
```
still_path: "/abc123def456.jpg"
```

### Generated Image URL
```
https://image.tmdb.org/t/p/w500/abc123def456.jpg
```

### Image Size Options
- `w92` - Small thumbnail (92px width)
- `w185` - Medium thumbnail (185px width)
- `w342` - Large (342px width)
- `w500` - Extra Large (500px width) ← **Used for episode cards**
- `w780` - HD (780px width)
- `original` - Original resolution

---

## 3️⃣ Final Thumbnail URL Generation

### Logic Flow
```javascript
// Raw TMDB data
const episode = {
  episode_number: 1,
  name: "The Deal",
  still_path: "/abc123.jpg"  // ← Key field
}

// Step 1: Check still_path exists
if (episode.still_path) {
  // Step 2: Generate full URL
  const thumbnailUrl = `https://image.tmdb.org/t/p/w500${episode.still_path}`;
  // Result: https://image.tmdb.org/t/p/w500/abc123.jpg
}

// Step 3: Use as image src
<img src={thumbnailUrl} alt="Episode 1 - The Deal" />
```

### Example URLs Generated
- **Episode 1**: `https://image.tmdb.org/t/p/w500/abc123.jpg`
- **Episode 2**: `https://image.tmdb.org/t/p/w500/xyz789.jpg`
- **Episode 3**: `https://image.tmdb.org/t/p/w500/lmn456.jpg`

---

## 4️⃣ Episode Image Mapping

### In TMDB Service
**File**: [`src/services/tmdbService.js`](src/services/tmdbService.js)

```javascript
// normalizeEpisodes Function
function normalizeEpisodes(episodes = [], showBackdrop = null, showPoster = null) {
  return episodes.map((ep) => {
    // Log raw TMDB data
    console.log('TMDB Episode:', ep);
    console.log('still_path:', ep.still_path);
    
    // Generate thumbnail URL with fallback
    let thumbnailUrl = null;
    if (ep.still_path) {
      // Primary: Use episode still
      thumbnailUrl = profileUrl(ep.still_path, 'w500');
      console.log('Using episode still_path →', thumbnailUrl);
    } else if (showBackdrop) {
      // Fallback: Use show backdrop
      thumbnailUrl = profileUrl(showBackdrop, 'w500');
      console.log('Using show backdrop as fallback →', thumbnailUrl);
    } else if (showPoster) {
      // Fallback: Use show poster
      thumbnailUrl = profileUrl(showPoster, 'w500');
      console.log('Using show poster as fallback →', thumbnailUrl);
    }
    console.log('thumbnailUrl:', thumbnailUrl);
    
    return {
      episodeNumber: ep.episode_number,
      name: ep.name || `Episode ${ep.episode_number}`,
      overview: ep.overview || '',
      thumbnail: thumbnailUrl,  // ← Passed to component
    };
  });
}
```

### Normalized Episode Object
```javascript
{
  episodeNumber: 1,
  name: "The Deal",
  overview: "Episode overview...",
  thumbnail: "https://image.tmdb.org/t/p/w500/abc123.jpg"  // ← Ready to display
}
```

---

## 5️⃣ Episode Selector Component Display

### File: [`src/components/EpisodeList.jsx`](src/components/EpisodeList.jsx)

#### Card Structure
```jsx
<Link to={`/watch/${subjectId}?season=${selectedSeason}&episode=${ep.episodeNumber}`}>
  <div className="rounded-xl glass border border-white/10 overflow-hidden hover:border-red-600/40 transition-all">
    
    {/* Thumbnail Container */}
    <div className="aspect-video bg-gradient-to-br from-gray-800/60 to-gray-900/60 overflow-hidden">
      {ep.thumbnail ? (
        <img
          src={ep.thumbnail}  // ← https://image.tmdb.org/t/p/w500/...
          alt={ep.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      ) : (
        // Fallback display when thumbnail not available
        <div className="w-full h-full flex items-center justify-center text-3xl text-white/30">
          E{ep.episodeNumber}
        </div>
      )}
    </div>

    {/* Episode Info */}
    <div className="p-4">
      <p className="text-xs font-semibold text-red-400 mb-1">
        Episode {ep.episodeNumber}
      </p>
      <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">
        {ep.name}  {/* ← "The Deal" */}
      </h3>
      {ep.overview && (
        <p className="text-xs text-gray-400 line-clamp-3">
          {ep.overview}
        </p>
      )}
    </div>
  </div>
</Link>
```

#### Expected Visual Output
```
┌─────────────────────────────────┐
│   [ Episode Thumbnail Image ]   │  ← ep.thumbnail renders here
│   (w500 size, aspect-video)     │
│     (zoom on hover)             │
├─────────────────────────────────┤
│ Episode 01                      │
│ The Deal                        │
│ [Episode overview text...]      │
└─────────────────────────────────┘
```

---

## 6️⃣ Console Logs Added

### In `tmdbService.js` - Episode Normalization
```javascript
// For each episode:
console.log('TMDB Episode:', ep);                    // Full episode object
console.log('still_path:', ep.still_path);           // "/abc123.jpg" or null
console.log('Using episode still_path →', url);     // Generated URL
console.log('thumbnailUrl:', thumbnailUrl);         // Final URL (or fallback)
```

### In `EpisodeList.jsx` - Component Rendering
```javascript
console.log('[EpisodeList] Episodes loaded:', episodes);
episodes.forEach((ep) => {
  console.log(`Episode ${ep.episodeNumber}:`, {
    name: ep.name,
    thumbnail: ep.thumbnail,
    hasOverview: !!ep.overview,
  });
});
```

---

## 7️⃣ Modified Files

### 1. **src/services/tmdbService.js**
- ✅ Updated `normalizeEpisodes()` function
  - Added detailed console logging
  - Implemented fallback logic (still_path → backdrop → poster)
  - Logs which image source was used

- ✅ Updated `getTvSeasonEpisodes()` function
  - Now fetches show data alongside season data
  - Passes backdrop_path and poster_path to normalizeEpisodes
  - Added error handling

### 2. **src/components/EpisodeList.jsx**
- ✅ Added `useEffect` hook with logging
  - Logs when episodes load
  - Logs thumbnail URL for each episode
  - Helps debug missing images

---

## 8️⃣ Fallback Strategy

### Priority Order
1. **Primary**: Episode `still_path` (specific episode thumbnail)
2. **Fallback 1**: Show `backdrop_path` (series backdrop image)
3. **Fallback 2**: Show `poster_path` (series poster image)
4. **Fallback 3**: Placeholder (displays "E{episodeNumber}" text)

### Example
```javascript
// Episode has no still_path
{
  episode_number: 1,
  name: "The Deal",
  still_path: null  // ← Missing
}

// Uses show backdrop instead
backdrop_path: "/show-backdrop.jpg"
// Generated thumbnail: https://image.tmdb.org/t/p/w500/show-backdrop.jpg
```

---

## 9️⃣ Testing the Implementation

### How to Verify:
1. Open browser DevTools (F12) → Console tab
2. Navigate to a TV series detail page
3. Look for console logs:
   - `TMDB Episode: { ... }`
   - `still_path: "/path..."` or `null`
   - `thumbnailUrl: "https://image.tmdb.org/..."`
4. Verify episode cards display thumbnails

### Example Console Output
```
TMDB Episode: {episode_number: 1, name: "The Deal", still_path: "/abc123.jpg", ...}
still_path: "/abc123.jpg"
Using episode still_path → https://image.tmdb.org/t/p/w500/abc123.jpg
thumbnailUrl: https://image.tmdb.org/t/p/w500/abc123.jpg

[EpisodeList] Episodes loaded: [{episodeNumber: 1, name: "The Deal", thumbnail: "https://...", ...}]
Episode 1: {name: "The Deal", thumbnail: "https://image.tmdb.org/t/p/w500/abc123.jpg", hasOverview: true}
```

---

## 🔟 Current Status

✅ **Episode names**: Loading correctly from TMDB  
✅ **still_path logging**: Added for debugging  
✅ **Thumbnail URL generation**: Implemented with profileUrl() helper  
✅ **Fallback images**: Show backdrop/poster when episode still unavailable  
✅ **Component display**: EpisodeList renders thumbnails with proper styling  
✅ **Console logs**: Added for monitoring data flow  

---

## 🔗 Related Documentation
- TMDB API Docs: https://developer.themoviedb.org/docs/
- Episode Still Paths: Always returned by TMDB /season/{season_number} endpoint
- Image Base URL: `https://image.tmdb.org/t/p/`

