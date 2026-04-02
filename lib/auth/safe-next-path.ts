/**
 * Allow only same-origin relative paths after login (no open redirects).
 * Expects app paths without locale prefix (next-intl adds locale on redirect).
 */
export function parseSafeNextPath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const s = raw.trim()
  if (s.length === 0 || !s.startsWith('/') || s.startsWith('//')) return null
  if (s.includes('..')) return null
  // Letters, digits, slashes, dots, underscores, hyphens (UUIDs).
  if (!/^\/[a-zA-Z0-9/._-]+$/.test(s)) return null
  return s
}
