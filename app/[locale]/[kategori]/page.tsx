import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Link } from '@/i18n/routing'
import {
  TAXONOMY,
  getCategoryBySlug,
} from '@/lib/categories/taxonomy'
import { ServiceBreadcrumbs } from '@/components/categories/ServiceBreadcrumbs'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

export const dynamicParams = false

export function generateStaticParams() {
  return TAXONOMY.map((c) => ({ kategori: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; kategori: string }
}): Promise<Metadata> {
  const cat = getCategoryBySlug(params.kategori)
  if (!cat) return {}
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'categoryPage',
  })
  return {
    title: t('metaTitle', { category: cat.title }),
    description: t('metaDescription', {
      category: cat.title,
      count: cat.subs.length,
    }),
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { locale: string; kategori: string }
}) {
  const cat = getCategoryBySlug(params.kategori)
  if (!cat) notFound()

  const t = await getTranslations('categoryPage')

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-lowest pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <ServiceBreadcrumbs
            items={[
              { label: t('breadcrumbHome'), href: '/' },
              { label: t('breadcrumbServices'), href: '/tjenester' },
              { label: cat.title },
            ]}
          />
          <header className="mb-12 max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary/80">
              {t('eyebrow')}
            </p>
            <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
              {cat.title}
            </h1>
            <p className="text-lg text-on-surface-variant">
              {t('intro', {
                category: cat.title,
                count: cat.subs.length,
              })}
            </p>
          </header>
          <section aria-labelledby="subs-heading">
            <h2 id="subs-heading" className="sr-only">
              {t('subsHeading', { category: cat.title })}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.subs.map((sub) => (
                <li key={sub.slug}>
                  <Link
                    href={`/${cat.slug}/${sub.slug}`}
                    className="flex h-full items-center justify-between gap-3 rounded-xl border border-outline-variant/25 bg-white px-4 py-3.5 text-left shadow-sm transition-colors hover:border-primary/30 hover:bg-surface-container-low"
                  >
                    <span className="font-medium text-on-surface">{sub.title}</span>
                    <MaterialIcon
                      name="chevron_right"
                      className="shrink-0 text-on-surface-variant"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <aside className="mt-16 rounded-3xl bg-primary/5 px-8 py-10 md:flex md:items-center md:justify-between md:gap-8">
            <div className="mb-6 md:mb-0">
              <p className="font-headline text-xl font-bold text-primary">
                {t('ctaTitle')}
              </p>
              <p className="mt-1 max-w-md text-on-surface-variant">{t('ctaBody')}</p>
            </div>
            <Link
              href="/bli-hjelper"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-8 py-3 font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              {t('ctaButton')}
            </Link>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
