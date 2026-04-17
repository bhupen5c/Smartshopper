export interface MatchResult<T> {
  item: T;
  score: number;
}

/**
 * Fuzzy product search. Scores each item by how well the query matches
 * its name, brand, category, or aliases. Exact alias matches score highest
 * so generic queries like "haloumi" surface all matching brands at the top.
 *
 * Returns matches sorted best-first, capped at `limit`.
 */
export function fuzzyMatch<
  T extends {
    name: string;
    brand?: string;
    category?: string;
    aliases?: readonly string[];
  },
>(query: string, items: readonly T[], limit = 8): MatchResult<T>[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const words = q.split(/\s+/);
  const results: MatchResult<T>[] = [];

  for (const item of items) {
    const name = item.name.toLowerCase();
    const brand = (item.brand ?? '').toLowerCase();
    const category = (item.category ?? '').toLowerCase();
    const aliases = (item.aliases ?? []).map((a) => a.toLowerCase());

    let score = 0;

    // Exact alias match — highest priority (generic search)
    if (aliases.some((a) => a === q)) {
      score = 110;
    }
    // Alias starts with query
    else if (aliases.some((a) => a.startsWith(q))) {
      score = 95;
    }
    // Alias contains query
    else if (aliases.some((a) => a.includes(q))) {
      score = 85;
    }
    // Exact name match
    else if (name === q) {
      score = 100;
    }
    // Name starts with query
    else if (name.startsWith(q)) {
      score = 80;
    }
    // Name contains query
    else if (name.includes(q)) {
      score = 60;
    }
    // Brand contains query
    else if (brand && brand.includes(q)) {
      score = 55;
    }
    // Category contains query
    else if (category && category.includes(q)) {
      score = 45;
    }
    // All query words appear somewhere (name + brand + category + aliases)
    else if (
      words.every(
        (w) =>
          name.includes(w) ||
          brand.includes(w) ||
          category.includes(w) ||
          aliases.some((a) => a.includes(w)),
      )
    ) {
      score = 40;
    }
    // Any query word appears
    else if (
      words.some(
        (w) =>
          name.includes(w) ||
          brand.includes(w) ||
          category.includes(w) ||
          aliases.some((a) => a.includes(w)),
      )
    ) {
      score = 20;
    }

    if (score > 0) {
      results.push({ item, score });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
