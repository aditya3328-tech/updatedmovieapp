export const HERO_FALLBACK_IMAGE =
  "https://via.placeholder.com/1920x1080/0a0a0a/666666?text=StreamWave";

export const SUBJECT_TYPE_LABELS = {
  1: "Movie",
  2: "TV Series",
  6: "Music",
};

export function splitHeroTitle(title = "") {
  const bracketIndex = title.indexOf("[");
  if (bracketIndex === -1) {
    return { main: title.trim(), suffix: null };
  }

  return {
    main: title.slice(0, bracketIndex).trim(),
    suffix: title.slice(bracketIndex).trim(),
  };
}

export function getReleaseYear(releaseDate) {
  if (!releaseDate) return null;
  const year = new Date(releaseDate).getFullYear();
  return Number.isNaN(year) ? null : String(year);
}

export function parseGenreTags(genre) {
  if (!genre) return [];
  return genre
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function getSubjectTypeLabel(subjectType) {
  return SUBJECT_TYPE_LABELS[subjectType] ?? null;
}
