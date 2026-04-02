import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Link } from '@/i18n/routing'
import {
  TAXONOMY,
  getCategoryBySlug,
} from '@/lib/categories/taxonomy'
import { getSubcategoryHeroImage } from '@/lib/categories/subcategory-hero'
import { getCategoryMaterialIcon } from '@/lib/categories/category-material-icons'
import { ServiceBreadcrumbs } from '@/components/categories/ServiceBreadcrumbs'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

export const dynamicParams = false

export function generateStaticParams() {
  return TAXONOMY.map((c) => ({ kategori: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; kategori: string }>
}): Promise<Metadata> {
  const { locale, kategori } = await params
  const cat = getCategoryBySlug(kategori)
  if (!cat) return {}
  const t = await getTranslations({
    locale,
    namespace: 'categoryPage',
  })
  return {
    title: t('metaTitle', { category: cat.title }),
    description: t('metaDescription', {
      category: cat.title,
    }),
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; kategori: string }>
}) {
  const { kategori } = await params
  const cat = getCategoryBySlug(kategori)
  if (!cat) notFound()

  const t = await getTranslations('categoryPage')
  const heroSrc = getSubcategoryHeroImage(cat.slug)
  const categoryIcon = getCategoryMaterialIcon(cat.slug)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-lowest">
        <section className="relative min-h-[280px] overflow-hidden md:min-h-[340px]">
          <Image
            src={heroSrc}
            alt={t('heroImageAlt', { category: cat.title })}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/50" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/80"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-tr from-primary/35 via-transparent to-primary/25"
            aria-hidden
          />
          <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-24 md:pb-16">
            <div className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
              <ServiceBreadcrumbs
                variant="inverse"
                items={[
                  { label: t('breadcrumbHome'), href: '/' },
                  { label: t('breadcrumbServices'), href: '/tjenester' },
                  { label: cat.title },
                ]}
              />
              <header className="max-w-3xl text-white">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/90">
                  {t('eyebrow')}
                </p>
                <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
                  {cat.title}
                </h1>
                <p className="text-lg leading-relaxed text-white/95">
                  {t('intro', { category: cat.title })}
                </p>
              </header>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <section aria-labelledby="subs-heading">
            <h2 id="subs-heading" className="sr-only">
              {t('subsHeading', { category: cat.title })}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {cat.subs.map((sub) => (
                <li key={sub.slug}>
                  <Link
                    href={`/${cat.slug}/${sub.slug}`}
                    className="group flex min-h-[6.75rem] items-center gap-4 rounded-2xl border border-outline-variant/30 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md md:min-h-[7.5rem] md:gap-5 md:p-6"
                  >
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 md:h-16 md:w-16"
                      aria-hidden
                    >
                      <MaterialIcon
                        name={categoryIcon}
                        className="text-[1.75rem] md:text-[2rem]"
                      />
                    </span>
                    <span className="min-w-0 flex-1 font-headline text-base font-bold leading-snug text-on-surface transition-colors group-hover:text-primary md:text-lg">
                      {sub.title}
                    </span>
                    <MaterialIcon
                      name="chevron_right"
                      className="shrink-0 text-2xl text-on-surface-variant transition-colors group-hover:text-primary md:text-[1.75rem]"
                      aria-hidden
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
