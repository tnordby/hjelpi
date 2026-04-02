import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  getAllSubcategoryParams,
  getSubcategory,
} from '@/lib/categories/taxonomy'
import { getSubcategoryHeroImage } from '@/lib/categories/subcategory-hero'
import { ServiceBreadcrumbs } from '@/components/categories/ServiceBreadcrumbs'
import { SubcategoryProviderList } from '@/components/providers/SubcategoryProviderList'
import { fetchProvidersForSubcategory } from '@/lib/providers/subcategory-providers'

export const dynamicParams = false
export const revalidate = 120

export function generateStaticParams() {
  return getAllSubcategoryParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; kategori: string; subkategori: string }>
}): Promise<Metadata> {
  const { locale, kategori, subkategori } = await params
  const found = getSubcategory(kategori, subkategori)
  if (!found) return {}
  const { category, sub } = found
  const t = await getTranslations({
    locale,
    namespace: 'subcategoryPage',
  })
  return {
    title: t('metaTitle', { sub: sub.title, category: category.title }),
    description: t('metaDescription', {
      sub: sub.title,
      category: category.title,
    }),
  }
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ locale: string; kategori: string; subkategori: string }>
}) {
  const { kategori, subkategori } = await params
  const found = getSubcategory(kategori, subkategori)
  if (!found) notFound()
  const { category, sub } = found

  const t = await getTranslations('subcategoryPage')
  const heroSrc = getSubcategoryHeroImage(category.slug)
  const providers = await fetchProvidersForSubcategory(kategori, subkategori)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-lowest">
        <section className="relative min-h-[280px] overflow-hidden md:min-h-[340px]">
          <Image
            src={heroSrc}
            alt={t('heroImageAlt', { sub: sub.title })}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {/* Dark scrim + gradient for readable white text on any photo */}
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
                  { label: category.title, href: `/${category.slug}` },
                  { label: sub.title },
                ]}
              />
              <header className="max-w-3xl text-white">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/90">
                  {category.title}
                </p>
                <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
                  {sub.title}
                </h1>
                <p className="text-lg leading-relaxed text-white/95">
                  {t('intro', {
                    sub: sub.title,
                    category: category.title,
                  })}
                </p>
              </header>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <SubcategoryProviderList providers={providers} />
        </div>
      </main>
      <Footer />
    </>
  )
}
