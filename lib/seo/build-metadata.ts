import type { Metadata } from 'next'

function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  if (raw) {
    try {
      return new URL(raw).origin
    } catch {
      /* ignore */
    }
  }
  return 'http://localhost:3000'
}

export function getMetadataBase(): URL {
  return new URL(siteOrigin())
}

export function absoluteSiteUrl(locale: string, segments: string[]): string {
  const path = localeCanonicalPath(locale, segments)
  return new URL(path, getMetadataBase()).toString()
}

export function localeCanonicalPath(locale: string, segments: string[]): string {
  const clean = segments.filter(Boolean)
  if (clean.length === 0) return `/${locale}`
  return `/${locale}/${clean.join('/')}`
}

function pickTitle(meta: Metadata): string | undefined {
  if (typeof meta.title === 'string') return meta.title
  if (meta.title && typeof meta.title === 'object') {
    const o = meta.title as { absolute?: string; default?: string }
    return o.absolute ?? o.default
  }
  return undefined
}

type PageSeoOptions = {
  locale: string
  /** Path segments after locale, e.g. ['tjenester'] or ['hjelpere', id] */
  pathSegments: string[]
  /** Public listing pages should be indexed; auth and dashboard should not. */
  indexable?: boolean
  /** Set false for 404 and similar pages where a canonical URL would be misleading. */
  includeCanonical?: boolean
  keywords?: string | string[]
}

/**
 * Adds canonical URL, Open Graph, Twitter card defaults, and robots.
 * Set `metadataBase` on the root layout so relative `canonical` resolves correctly.
 */
export function withPageSeo(meta: Metadata, opts: PageSeoOptions): Metadata {
  const {
    locale,
    pathSegments,
    indexable = true,
    keywords,
    includeCanonical = true,
  } = opts
  const pathname = localeCanonicalPath(locale, pathSegments)
  const title = pickTitle(meta)
  const desc = typeof meta.description === 'string' ? meta.description : undefined
  const kw = keywords
    ? Array.isArray(keywords)
      ? keywords
      : [keywords]
    : undefined

  const ogExtra =
    typeof meta.openGraph === 'object' && meta.openGraph !== null ? meta.openGraph : {}
  const twitterExtra =
    typeof meta.twitter === 'object' && meta.twitter !== null ? meta.twitter : {}
  const robotsExtra =
    typeof meta.robots === 'object' && meta.robots !== null ? meta.robots : {}

  return {
    ...meta,
    ...(kw ? { keywords: kw } : {}),
    alternates: {
      ...meta.alternates,
      ...(includeCanonical ? { canonical: pathname } : {}),
    },
    openGraph: {
      type: 'website',
      siteName: 'Hjelpi',
      locale: locale === 'no' ? 'nb_NO' : 'en_US',
      ...(includeCanonical ? { url: pathname } : {}),
      ...(title ? { title } : {}),
      ...(desc ? { description: desc } : {}),
      ...ogExtra,
    },
    twitter: {
      card: 'summary_large_image',
      ...(title ? { title } : {}),
      ...(desc ? { description: desc } : {}),
      ...twitterExtra,
    },
    robots:
      indexable === false
        ? { index: false, follow: false, ...robotsExtra }
        : { index: true, follow: true, ...robotsExtra },
  }
}
