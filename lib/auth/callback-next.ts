/** Allowed post-auth paths (no locale prefix). Used to prevent open redirects. */
const ALLOWED_NEXT = new Set([
  '/',
  '/min-konto',
  '/logg-inn',
  '/tilbakestill-passord',
  '/bli-hjelper/fullfor-profil',
])

/**
 * Resolves the `next` query param from /auth/callback into a pathname starting with /.
 */
export function resolveAuthCallbackNext(raw: string | null): string {
  if (!raw?.trim()) return '/min-konto'
  const decoded = decodeURIComponent(raw.trim())
  const path = decoded.startsWith('/') ? decoded : `/${decoded}`
  if (!ALLOWED_NEXT.has(path)) return '/min-konto'
  if (path.includes('//') || path.includes('..')) return '/min-konto'
  return path
}

export function authCallbackUrl(origin: string, locale: string, nextPath: string): string {
  const next = nextPath.startsWith('/') ? nextPath.slice(1) : nextPath
  return `${origin.replace(/\/$/, '')}/${locale}/auth/callback?next=${encodeURIComponent(next)}`
}
