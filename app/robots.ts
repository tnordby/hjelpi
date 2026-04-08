import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getMetadataBase } from '@/lib/seo/build-metadata'

export default function robots(): MetadataRoute.Robots {
  const base = getMetadataBase().origin
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/ingest/',
        ...routing.locales.flatMap((locale) => [
          `/${locale}/min-side/`,
          `/${locale}/min-konto/`,
          `/${locale}/auth/`,
        ]),
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
