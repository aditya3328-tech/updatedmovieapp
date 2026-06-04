/** Detect Hindi in title and strip label for display */
export function parseHindiTitle(title = "") {
  const hasBracket = /\[Hindi\]/i.test(title);
  const hasWord = /\bHindi\b/i.test(title);

  if (!hasBracket && !hasWord) {
    return { displayTitle: title, showHindiBadge: false };
  }

  const displayTitle = title
    .replace(/\[Hindi\]/gi, "")
    .replace(/\bHindi\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return {
    displayTitle: displayTitle || title,
    showHindiBadge: true,
  };
}
