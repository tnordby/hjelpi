/** Norwegian-aware text normalization for search matching. */
export function normalizeSearchText(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/é|è|ê/g, 'e')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** True when every whitespace-separated token in `query` prefix-matches somewhere in `target`. */
export function tokensMatch(query: string, target: string): boolean {
  const q = normalizeSearchText(query)
  if (!q) return false
  const t = normalizeSearchText(target)
  const targetTokens = t.split(' ')
  return q.split(' ').every((qt) =>
    targetTokens.some((tt) => tt.startsWith(qt)) || t.includes(qt),
  )
}
