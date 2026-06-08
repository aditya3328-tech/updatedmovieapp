/**
 * Title normalization utilities for TMDB matching
 * and episode generation from MovieBox season data.
 */

// Matches any bracketed tag like [Hindi], [CAM], [Tamil], etc.
const BRACKET_TAG_PATTERN = /\[[^\]]*\]/gi;

// Matches season indicators like S1, S1-S5, Season 1, Season 2, etc.
const SEASON_INDICATOR_PATTERN = /\bS\d+(?:-S?\d+)?\b|\bSeason\s*\d+\b/gi;

// Single straight/curly quotes (not apostrophes between letters)
const SINGLE_QUOTE_PATTERN = /(?<![a-zA-Z])'|'(?![a-zA-Z])/g;

/**
 * Strip language/dub tags, season indicators, and stray quotes
 * from MovieBox titles before TMDB search.
 *
 * This is used ONLY for TMDB search — display titles stay original.
 */
export function cleanTitleForTmdb(title = '') {
  const original = String(title);

  let cleaned = original
    // 1. Remove all [Tag] blocks
    .replace(BRACKET_TAG_PATTERN, '')
    // 2. Remove season indicators (S1, S1-S5, Season 1)
    .replace(SEASON_INDICATOR_PATTERN, '')
    // 3. Remove stray single quotes
    .replace(SINGLE_QUOTE_PATTERN, '')
    // 4. Collapse multiple spaces
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (original !== cleaned) {
    console.log('[titleMatch] Title normalized:');
    console.log('  Original:', original);
    console.log('  Cleaned:', cleaned);
  }

  return cleaned;
}

/** Extract a 4-digit year from MovieBox releaseDate for TMDB search. */
export function extractYearFromReleaseDate(releaseDate) {
  if (!releaseDate) return null;
  const match = String(releaseDate).match(/\d{4}/);
  return match ? match[0] : null;
}

/**
 * Generate an episode list from a single MovieBox season object.
 *
 * Rules (confirmed from MovieBox reverse-engineering):
 *   - If `allEp` is a non-empty string, split by comma for episode numbers.
 *   - Otherwise, generate sequential numbers 1..maxEp.
 *
 * @param {Object} seasonObj - { se, maxEp, allEp }
 * @returns {number[]} Array of episode numbers
 */
export function generateEpisodes(seasonObj) {
  if (!seasonObj) return [];

  if (seasonObj.allEp && String(seasonObj.allEp).trim()) {
    return String(seasonObj.allEp)
      .split(',')
      .map((ep) => {
        const num = Number(ep.trim());
        return isNaN(num) ? ep.trim() : num;
      })
      .filter((ep) => ep !== '' && ep !== 0);
  }

  const max = Number(seasonObj.maxEp) || 0;
  return Array.from({ length: max }, (_, i) => i + 1);
}
