export interface MatchResult<T> {
  item: T;
  score: number;
}

/**
 * Simple fuzzy product search. Scores each item by how well the query
 * matches its name. Returns matches sorted best-first, capped at `limit`.
 */
export function fuzzyMatch<T extends { name: string }>(
  query: string,
  items: readonly T[],
  limit = 8,
): MatchResult<T>[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const words = q.split(/\s+/);
  const results: MatchResult<T>[] = [];

  for (const item of items) {
    const name = item.name.toLowerCase();
    let score = 0;

    // Exact match (highest score)
    if (name === q) {
      score = 100;
    }
    // Name starts with query
    else if (name.startsWith(q)) {
      score = 80;
    }
    // Name contains query as substring
    else if (name.includes(q)) {
      score = 60;
    }
    // All query words appear in name
    else if (words.every((w) => name.includes(w))) {
      score = 40;
    }
    // Any query word appears in name
    else if (words.some((w) => name.includes(w))) {
      score = 20;
    }

    if (score > 0) {
      results.push({ item, score });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
