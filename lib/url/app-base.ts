/**
 * Absolute URLs for Stripe redirects and emails.
 * Set NEXT_PUBLIC_BASE_URL in production (e.g. https://hjelpi.no).
 */
export function getPublicAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  if (raw?.startsWith('http')) return raw.replace(/\/$/, '')
  return 'http://localhost:3000'
}

export function absoluteAppUrl(locale: string, pathWithLeadingSlash: string): string {
  const base = getPublicAppBaseUrl()
  const path = pathWithLeadingSlash.startsWith('/') ? pathWithLeadingSlash : `/${pathWithLeadingSlash}`
  return `${base}/${locale}${path}`
}
