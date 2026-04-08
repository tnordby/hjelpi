import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Link } from '@/i18n/routing'
import { ServiceBreadcrumbs } from '@/components/categories/ServiceBreadcrumbs'
import { withPageSeo } from '@/lib/seo/build-metadata'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import {
  cityPathSegment,
  fetchPublicLocationsDirectory,
  type PublicLocationDirectoryRow,
} from '@/lib/locations/public'

export const revalidate = 3600

function groupByFylke(rows: PublicLocationDirectoryRow[]) {
  const map = new Map<string, PublicLocationDirectoryRow[]>()
  for (const row of rows) {
    const key = row.fylke.length > 0 ? row.fylke : 'Norge'
    const arr = map.get(key) ?? []
    arr.push(row)
    map.set(key, arr)
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'nb'))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'citiesDirectory' })
  return withPageSeo(
    { title: t('metaTitle'), description: t('metaDescription') },
    {
      locale,
      pathSegments: ['byer'],
      keywords: ['byer', 'steder', 'kommuner', 'lokale tjenester', 'Hjelpi', 'Norge'],
    },
  )
}

export default async function ByerPage() {
  const t = await getTranslations('citiesDirectory')
  let locations: PublicLocationDirectoryRow[] = []
  try {
    if (isSupabaseConfigured()) {
      locations = await fetchPublicLocationsDirectory()
    }
  } catch {
    locations = []
  }

  const grouped = groupByFylke(locations)

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-surface-container-lowest pb-20 pt-[var(--hj-navbar-height)] outline-none"
      >
        <div className="mx-auto max-w-7xl px-6">
          <ServiceBreadcrumbs
            className="mb-10 py-3 sm:py-5"
            items={[
              { label: t('breadcrumbHome'), href: '/' },
              { label: t('title') },
            ]}
          />
          <header className="mb-12 max-w-2xl">
            <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
              {t('title')}
            </h1>
            <p className="text-lg text-on-surface-variant">{t('subtitle')}</p>
          </header>

          {grouped.length === 0 ? (
            <p className="text-on-surface-variant">{t('empty')}</p>
          ) : (
            <div className="space-y-14">
              {grouped.map(([fylke, rows]) => (
                <section
                  key={fylke}
                  aria-labelledby={`fylke-${fylke.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <h2
                    id={`fylke-${fylke.replace(/\s+/g, '-').toLowerCase()}`}
                    className="mb-6 border-b border-outline-variant/50 pb-2 font-headline text-xl font-bold text-on-surface"
                  >
                    {fylke}
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {rows.map((loc) => (
                      <li key={loc.slug}>
                        <Link
                          href={`/${cityPathSegment(loc)}`}
                          className="block rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-sm font-medium text-on-surface shadow-sm transition-colors hover:border-primary/30 hover:text-primary"
                        >
                          {loc.cityName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
