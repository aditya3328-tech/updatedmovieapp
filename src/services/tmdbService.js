import { cleanTitleForTmdb, extractYearFromReleaseDate } from '../utils/titleMatch';

const TMDB_BASE = import.meta.env.DEV ? '/tmdb' : 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

function profileUrl(path, size = 'w300') {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

async function tmdbFetch(path, params = {}) {
  const url = new URL(`${TMDB_BASE}${path}`, import.meta.env.DEV ? window.location.origin : undefined);

  if (API_KEY) {
    url.searchParams.set('api_key', API_KEY);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const headers = { Accept: 'application/json' };
  if (ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json();
}

function normalizeCast(credits) {
  return (credits?.cast || [])
    .slice(0, 20)
    .map((person) => ({
      name: person.name,
      character: person.character,
      image: profileUrl(person.profile_path),
    }));
}

function normalizeEpisodes(episodes = [], showBackdrop = null, showPoster = null) {
  return episodes.map((ep) => {
    console.log('TMDB Episode:', ep);
    console.log('still_path:', ep.still_path);
    
    // Prefer episode still_path, fallback to show backdrop or poster
    let thumbnailUrl = null;
    if (ep.still_path) {
      thumbnailUrl = profileUrl(ep.still_path, 'w500');
      console.log('Using episode still_path →', thumbnailUrl);
    } else if (showBackdrop) {
      thumbnailUrl = profileUrl(showBackdrop, 'w500');
      console.log('Using show backdrop as fallback →', thumbnailUrl);
    } else if (showPoster) {
      thumbnailUrl = profileUrl(showPoster, 'w500');
      console.log('Using show poster as fallback →', thumbnailUrl);
    }
    console.log('thumbnailUrl:', thumbnailUrl);
    
    return {
      episodeNumber: ep.episode_number,
      name: ep.name || `Episode ${ep.episode_number}`,
      overview: ep.overview || '',
      thumbnail: thumbnailUrl,
    };
  });
}

/**
 * Enhanced score-based best match selection.
 *
 * Factors:
 *   1. Title similarity (exact match highest priority)
 *   2. Media type (must be TV for TV search, Movie for Movie search)
 *   3. Release year proximity
 *   4. Popularity score
 *   5. Original language boost
 *   6. Season count validation (reject massive mismatches)
 */
function findBestMatch(results, targetYear, cleanedQuery, isTV = false, movieBoxSeasons = null) {
  if (!results || results.length === 0) {
    console.log('[findBestMatch] No results to match');
    return null;
  }
  
  if (results.length === 1) {
    console.log('[findBestMatch] Only 1 result, returning:', { id: results[0].id, name: results[0].name || results[0].title });
    return results[0];
  }

  const queryLower = (cleanedQuery || '').toLowerCase().trim();
  
  console.log('[findBestMatch] Evaluating', results.length, 'candidates for:', {
    query: queryLower,
    year: targetYear,
    isTV,
    movieBoxSeasons,
  });

  let bestScore = -Infinity;
  let bestCandidate = null;
  const scores = [];

  for (const candidate of results) {
    let score = 0;
    const candidateTitle = (candidate.title || candidate.name || '').toLowerCase().trim();
    const candidateOrigTitle = (candidate.original_title || candidate.original_name || '').toLowerCase().trim();
    
    // ===== TITLE SIMILARITY =====
    // Exact match = highest priority
    if (candidateTitle === queryLower || candidateOrigTitle === queryLower) {
      score += 100;  // Increased from 50
    } 
    // Partial match
    else if (candidateTitle.includes(queryLower) || candidateOrigTitle.includes(queryLower)) {
      score += 30;   // Increased from 25
    }
    // Reverse check (query includes candidate)
    else if (queryLower.includes(candidateTitle)) {
      score += 15;   // Penalize partial match
    }
    // No title match
    else {
      score -= 50;   // Major penalty for no match
    }

    // ===== MEDIA TYPE VALIDATION =====
    // For TV searches, check if result is TV show
    if (isTV) {
      const isTvShow = candidate.media_type === 'tv' || candidate.first_air_date;
      if (isTvShow) {
        score += 40;  // Big bonus for correct media type
      } else {
        score -= 100; // Major penalty for wrong type
      }
    }

    // ===== SEASON COUNT VALIDATION =====
    if (isTV && movieBoxSeasons && movieBoxSeasons > 0) {
      const tmdbSeasonCount = candidate.number_of_seasons || 0;
      const seasonDiff = Math.abs(tmdbSeasonCount - movieBoxSeasons);
      
      console.log('[findBestMatch] Candidate', candidate.id, `(${candidateTitle}):`, {
        tmdbSeasons: tmdbSeasonCount,
        movieBoxSeasons,
        diff: seasonDiff,
      });
      
      if (seasonDiff === 0) {
        score += 50;  // Perfect season match
      } else if (seasonDiff === 1) {
        score += 20;  // Off by 1 is acceptable
      } else if (seasonDiff <= 2) {
        score += 5;   // Off by 2 is tolerable
      } else if (seasonDiff > 3) {
        score -= 200; // Massive mismatch - likely wrong show
      }
    }

    // ===== RELEASE YEAR PROXIMITY =====
    if (targetYear) {
      const releaseStr = candidate.release_date || candidate.first_air_date || '';
      const candidateYear = releaseStr ? parseInt(releaseStr.substring(0, 4), 10) : null;
      if (candidateYear) {
        const yearDiff = Math.abs(candidateYear - parseInt(targetYear, 10));
        if (yearDiff === 0) score += 30;
        else if (yearDiff === 1) score += 15;
        else if (yearDiff <= 3) score += 5;
        else if (yearDiff > 5) score -= 20; // Penalty for very old/new show
      }
    }

    // ===== POPULARITY =====
    const popularity = candidate.popularity || 0;
    score += Math.min(20, popularity / 5);

    // ===== ORIGINAL LANGUAGE BOOST =====
    // English shows get boost, but other languages don't get penalized
    if (candidate.original_language === 'en') {
      score += 5;
    }

    scores.push({
      id: candidate.id,
      name: candidateTitle,
      score,
      popularity,
      seasons: candidate.number_of_seasons,
      year: candidate.first_air_date?.substring(0, 4) || candidate.release_date?.substring(0, 4),
    });

    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  // Log all scores for debugging
  scores.sort((a, b) => b.score - a.score);
  console.log('[findBestMatch] Top 5 candidates:');
  scores.slice(0, 5).forEach((s, i) => {
    console.log(`  ${i + 1}. Score: ${s.score} | ID: ${s.id} | Name: ${s.name} | Seasons: ${s.seasons} | Year: ${s.year}`);
  });

  if (bestCandidate) {
    const bestTitle = (bestCandidate.title || bestCandidate.name || '').toLowerCase().trim();
    console.log('[findBestMatch] SELECTED: ID:', bestCandidate.id, '| Name:', bestTitle, '| Score:', bestScore);
  } else {
    console.log('[findBestMatch] NO SUITABLE MATCH FOUND');
  }

  return bestCandidate;
}

async function searchMovie(query, year) {
  console.log('[searchMovie] Searching for:', { query, year });
  
  // First search with year, then without if no results
  let data = await tmdbFetch('/search/movie', {
    query,
    ...(year ? { year } : {}),
  });

  console.log('[searchMovie] Results with year:', data?.results?.length || 0);

  if ((!data?.results || data.results.length === 0) && year) {
    console.log('[searchMovie] Retrying without year...');
    data = await tmdbFetch('/search/movie', { query });
    console.log('[searchMovie] Results without year:', data?.results?.length || 0);
  }

  const match = findBestMatch(data?.results || [], year, query);
  console.log('[searchMovie] Best match:', match ? { title: match.title, id: match.id } : 'none');
  return match;
}

async function searchTv(query, year) {
  console.log('[searchTv] Searching for:', { query, year });
  
  let data = await tmdbFetch('/search/tv', {
    query,
    ...(year ? { first_air_date_year: year } : {}),
  });

  console.log('[searchTv] Results with year:', data?.results?.length || 0);

  if ((!data?.results || data.results.length === 0) && year) {
    console.log('[searchTv] Retrying without year...');
    data = await tmdbFetch('/search/tv', { query });
    console.log('[searchTv] Results without year:', data?.results?.length || 0);
  }

  const match = findBestMatch(data?.results || [], year, query);
  console.log('[searchTv] Best match:', match ? { name: match.name, id: match.id } : 'none');
  return match;
}

const tmdbService = {
  async getMovieCast(title, releaseDate) {
    const query = cleanTitleForTmdb(title);
    if (!query) {
      console.log('[tmdbService] Movie: Empty cleaned title, skipping TMDB search');
      return null;
    }

    const year = extractYearFromReleaseDate(releaseDate);
    console.log('[tmdbService] Movie search:', { original: title, cleaned: query, year });
    
    const match = await searchMovie(query, year);

    console.log('[tmdbService] Movie TMDB Match:', match);
    console.log('[tmdbService] Movie TMDB ID:', match?.id);

    if (!match?.id) {
      console.log('[tmdbService] No movie match found for:', query);
      return null;
    }

    const credits = await tmdbFetch(`/movie/${match.id}/credits`);
    const result = {
      tmdbId: match.id,
      type: 'movie',
      cast: normalizeCast(credits),
    };
    console.log('[tmdbService] Movie cast count:', result.cast.length);
    return result;
  },

  async getTvMetadata(title, releaseDate) {
    const query = cleanTitleForTmdb(title);
    if (!query) {
      console.log('[tmdbService] TV: Empty cleaned title, skipping TMDB search');
      return null;
    }

    const year = extractYearFromReleaseDate(releaseDate);
    console.log('[tmdbService] TV search:', { original: title, cleaned: query, year });
    
    const match = await searchTv(query, year);

    console.log('[tmdbService] TV TMDB Match:', match);
    console.log('[tmdbService] TV TMDB ID:', match?.id);

    if (!match?.id) {
      console.log('[tmdbService] No TV match found for:', query);
      return null;
    }

    const [credits, show] = await Promise.all([
      tmdbFetch(`/tv/${match.id}/credits`),
      tmdbFetch(`/tv/${match.id}`),
    ]);

    const seasonNumbers = (show?.seasons || [])
      .filter((s) => s.season_number > 0)
      .map((s) => s.season_number)
      .sort((a, b) => a - b);

    console.log('[tmdbService] TV show seasons from TMDB:', seasonNumbers);

    const result = {
      tmdbId: match.id,
      type: 'tv',
      cast: normalizeCast(credits),
      seasonNumbers: seasonNumbers.length > 0 ? seasonNumbers : [1],
    };
    console.log('[tmdbService] TV cast count:', result.cast.length);
    return result;
  },

  async getTvSeasonEpisodes(tvId, seasonNumber) {
    if (!tvId || !seasonNumber) {
      console.log('[getTvSeasonEpisodes] Missing tvId or seasonNumber');
      return [];
    }

    console.log('[getTvSeasonEpisodes] Fetching season:', seasonNumber, 'tvId:', tvId);

    try {
      // Fetch both season data and show data for fallback images
      const [seasonData, showData] = await Promise.all([
        tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`),
        tmdbFetch(`/tv/${tvId}`),
      ]);

      const episodeCount = seasonData?.episodes?.length || 0;
      console.log('[getTvSeasonEpisodes] Season', seasonNumber, 'episode count from TMDB:', episodeCount);

      const showBackdrop = showData?.backdrop_path;
      const showPoster = showData?.poster_path;

      return normalizeEpisodes(
        seasonData?.episodes || [],
        showBackdrop,
        showPoster,
      );
    } catch (err) {
      console.error('[getTvSeasonEpisodes] Error fetching season', seasonNumber, ':', err);
      return [];
    }
  },

  async getMetadata(title, subjectType, releaseDate) {
    if (!title || !API_KEY) return null;

    if (subjectType === 1) {
      return this.getMovieCast(title, releaseDate);
    }

    if (subjectType === 2) {
      return this.getTvMetadata(title, releaseDate);
    }

    return null;
  },
};

export default tmdbService;
