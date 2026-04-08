import type { MetadataRoute } from 'next'
import { TAXONOMY } from '@/lib/categories/taxonomy'
import { routing } from '@/i18n/routing'
import { getMetadataBase } from '@/lib/seo/build-metadata'
import { cityPathSegment, fetchPublicLocationsDirectory } from '@/lib/locations/public'

const STATIC_SEGMENTS = [
  '',
  'tjenester',
  'byer',
  'bli-hjelper',
  'registrer',
  'logg-inn',
  'glemt-passord',
  'tilbakestill-passord',
  'vilkar',
  'personvern',
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getMetadataBase().origin
  const lastModified = new Date()
  const locations = await fetchPublicLocationsDirectory().catch(() => [])
  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    for (const seg of STATIC_SEGMENTS) {
      const path = seg ? `/${locale}/${seg}` : `/${locale}`
      entries.push({
        url: `${base}${path}`,
        lastModified,
        changeFrequency: seg === '' ? 'daily' : 'weekly',
        priority: seg === '' ? 1 : 0.72,
      })
    }

    for (const cat of TAXONOMY) {
      entries.push({
        url: `${base}/${locale}/${cat.slug}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.76,
      })
      for (const sub of cat.subs) {
        entries.push({
          url: `${base}/${locale}/${cat.slug}/${sub.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.68,
        })
      }
    }

    for (const loc of locations) {
      entries.push({
        url: `${base}/${locale}/${cityPathSegment(loc)}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.66,
      })
    }
  }

  return entries
}
