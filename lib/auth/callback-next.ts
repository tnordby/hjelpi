/** Maps legacy /dashboard paths from older email links to /min-side. */
function normalizeAccountPath(path: string): string {
  if (path === '/dashboard') return '/min-side'
  if (path.startsWith('/dashboard/')) return `/min-side${path.slice('/dashboard'.length)}`
  return path
}

/** Allowed post-auth paths (no locale prefix). Used to prevent open redirects. */
const ALLOWED_NEXT = new Set([
  '/',
  '/min-side',
  '/min-side/kunde',
  '/min-side/hjelper',
  '/dashboard',
  '/dashboard/kunde',
  '/dashboard/hjelper',
  '/min-konto',
  '/logg-inn',
  '/tilbakestill-passord',
  '/bli-hjelper/fullfor-profil',
])

/**
 * Resolves the `next` query param from /auth/callback into a pathname starting with /.
 */
export function resolveAuthCallbackNext(raw: string | null): string {
  if (!raw?.trim()) return '/min-side'
  const decoded = decodeURIComponent(raw.trim())
  const path = decoded.startsWith('/') ? decoded : `/${decoded}`
  if (!ALLOWED_NEXT.has(path)) return '/min-side'
  if (path.includes('//') || path.includes('..')) return '/min-side'
  return normalizeAccountPath(path)
}

export function authCallbackUrl(origin: string, locale: string, nextPath: string): string {
  const next = nextPath.startsWith('/') ? nextPath.slice(1) : nextPath
  return `${origin.replace(/\/$/, '')}/${locale}/auth/callback?next=${encodeURIComponent(next)}`
}
