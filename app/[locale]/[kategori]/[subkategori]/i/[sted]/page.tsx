import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SubcategoryBreadcrumbJsonLd } from '@/components/seo/SubcategoryBreadcrumbJsonLd'
import { notFound } from 'next/navigation'
import { getSubcategory } from '@/lib/categories/taxonomy'
import { getSubcategoryHeroImage } from '@/lib/categories/subcategory-hero'
import { fetchProvidersForSubcategory } from '@/lib/providers/subcategory-providers'
import { fetchLocationBySlug } from '@/lib/locations/public'
import { seoLowercaseLabel } from '@/lib/seo/display-label'
import { withPageSeo } from '@/lib/seo/build-metadata'
import { SubcategoryMarketplaceView } from '@/components/categories/SubcategoryMarketplaceView'

export const dynamicParams = true
export const revalidate = 120

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string
    kategori: string
    subkategori: string
    sted: string
  }>
}): Promise<Metadata> {
  const { locale, kategori, subkategori, sted } = await params
  const found = getSubcategory(kategori, subkategori)
  if (!found) return {}
  const { category, sub } = found
  const location = await fetchLocationBySlug(sted)
  if (!location) return {}

  const subLc = seoLowercaseLabel(sub.title)
  const categoryLc = seoLowercaseLabel(category.title)
  const t = await getTranslations({
    locale,
    namespace: 'subcategoryPage',
  })
  return withPageSeo(
    {
      title: t('metaTitleInCity', { sub: subLc, city: location.name }),
      description: t('metaDescriptionInCity', {
        sub: subLc,
        category: categoryLc,
        city: location.name,
      }),
    },
    {
      locale,
      pathSegments: [kategori, subkategori, 'i', sted],
      keywords: [
        sub.title,
        subLc,
        location.name,
        category.title,
        categoryLc,
        'fagpersoner',
        'lokale tjenester',
        'Hjelpi',
      ],
    },
  )
}

export default async function SubcategoryInCityPage({
  params,
}: {
  params: Promise<{
    locale: string
    kategori: string
    subkategori: string
    sted: string
  }>
}) {
  const { kategori, subkategori, sted, locale } = await params
  const found = getSubcategory(kategori, subkategori)
  if (!found) notFound()
  const { category, sub } = found
  const subLc = seoLowercaseLabel(sub.title)
  const categoryLc = seoLowercaseLabel(category.title)

  const location = await fetchLocationBySlug(sted)
  if (!location) notFound()

  const t = await getTranslations('subcategoryPage')
  const heroSrc = getSubcategoryHeroImage(category.slug)
  const providers = await fetchProvidersForSubcategory(kategori, subkategori, {
    filterByLocationSlug: location.slug,
  })

  return (
    <SubcategoryMarketplaceView
      jsonLd={
        <SubcategoryBreadcrumbJsonLd
          locale={locale}
          categoryTitle={category.title}
          categorySlug={category.slug}
          subTitle={sub.title}
          subSlug={sub.slug}
          cityName={location.name}
          citySlug={location.slug}
        />
      }
      heroSrc={heroSrc}
      heroAlt={t('heroImageAlt', { sub: subLc })}
      breadcrumbs={[
        { label: t('breadcrumbHome'), href: '/' },
        { label: t('breadcrumbServices'), href: '/tjenester' },
        { label: category.title, href: `/${category.slug}` },
        { label: sub.title, href: `/${category.slug}/${sub.slug}` },
        { label: location.name },
      ]}
      eyebrow={category.title}
      title={sub.title}
      intro={t('introInCity', {
        sub: subLc,
        category: categoryLc,
        city: location.name,
      })}
      providers={providers}
    />
  )
}
