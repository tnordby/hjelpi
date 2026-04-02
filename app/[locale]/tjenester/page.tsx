import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { withPageSeo } from '@/lib/seo/build-metadata'
import { Footer } from '@/components/layout/Footer'
import { Link } from '@/i18n/routing'
import { TAXONOMY } from '@/lib/categories/taxonomy'
import { ServiceBreadcrumbs } from '@/components/categories/ServiceBreadcrumbs'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'servicesIndex',
  })
  return withPageSeo(
    { title: t('metaTitle'), description: t('metaDescription') },
    {
      locale,
      pathSegments: ['tjenester'],
      keywords: ['alle tjenester', 'lokale tjenester', 'Hjelpi', 'Norge'],
    },
  )
}

export default async function AllServicesPage() {
  const t = await getTranslations('servicesIndex')

  const categoriesAlphabetical = [...TAXONOMY].sort((a, b) =>
    a.title.localeCompare(b.title, 'nb'),
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-lowest pb-20 pt-[var(--hj-navbar-height)]">
        <div className="mx-auto max-w-7xl px-6">
          <ServiceBreadcrumbs
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
          <div className="space-y-14">
            {categoriesAlphabetical.map((cat) => (
              <section
                key={cat.slug}
                aria-labelledby={`cat-${cat.slug}`}
                className="border-b border-outline-variant/40 pb-14 last:border-0 last:pb-0"
              >
                <h2
                  id={`cat-${cat.slug}`}
                  className="mb-4 font-headline text-xl font-bold tracking-tight text-on-surface md:text-2xl"
                >
                  <Link
                    href={`/${cat.slug}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {cat.title}
                  </Link>
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {cat.subs.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={`/${cat.slug}/${sub.slug}`}
                        className="inline-flex max-w-full items-center rounded-full border border-outline-variant/50 bg-surface-container-low px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:border-primary/35 hover:bg-primary/8 hover:text-primary"
                      >
                        <span className="truncate">{sub.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
