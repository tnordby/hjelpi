import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SubcategoryBreadcrumbJsonLd } from '@/components/seo/SubcategoryBreadcrumbJsonLd'
import { notFound } from 'next/navigation'
import {
  getAllSubcategoryParams,
  getSubcategory,
} from '@/lib/categories/taxonomy'
import { getSubcategoryHeroImage } from '@/lib/categories/subcategory-hero'
import { fetchProvidersForSubcategory } from '@/lib/providers/subcategory-providers'
import { seoLowercaseLabel } from '@/lib/seo/display-label'
import { withPageSeo } from '@/lib/seo/build-metadata'
import { SubcategoryMarketplaceView } from '@/components/categories/SubcategoryMarketplaceView'

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
  const subLc = seoLowercaseLabel(sub.title)
  const categoryLc = seoLowercaseLabel(category.title)
  const t = await getTranslations({
    locale,
    namespace: 'subcategoryPage',
  })
  return withPageSeo(
    {
      title: t('metaTitle', { sub: subLc }),
      description: t('metaDescription', {
        sub: subLc,
        category: categoryLc,
      }),
    },
    {
      locale,
      pathSegments: [kategori, subkategori],
      keywords: [
        sub.title,
        subLc,
        category.title,
        categoryLc,
        'fagpersoner',
        'nær deg',
        'lokale tjenester',
        'Hjelpi',
      ],
    },
  )
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ locale: string; kategori: string; subkategori: string }>
}) {
  const { kategori, subkategori, locale } = await params
  const found = getSubcategory(kategori, subkategori)
  if (!found) notFound()
  const { category, sub } = found
  const subLc = seoLowercaseLabel(sub.title)
  const categoryLc = seoLowercaseLabel(category.title)

  const t = await getTranslations('subcategoryPage')
  const heroSrc = getSubcategoryHeroImage(category.slug)
  const providers = await fetchProvidersForSubcategory(kategori, subkategori)

  return (
    <SubcategoryMarketplaceView
      jsonLd={
        <SubcategoryBreadcrumbJsonLd
          locale={locale}
          categoryTitle={category.title}
          categorySlug={category.slug}
          subTitle={sub.title}
          subSlug={sub.slug}
        />
      }
      heroSrc={heroSrc}
      heroAlt={t('heroImageAlt', { sub: subLc })}
      breadcrumbs={[
        { label: t('breadcrumbHome'), href: '/' },
        { label: t('breadcrumbServices'), href: '/tjenester' },
        { label: category.title, href: `/${category.slug}` },
        { label: sub.title },
      ]}
      eyebrow={category.title}
      title={sub.title}
      intro={t('intro', {
        sub: subLc,
        category: categoryLc,
      })}
      providers={providers}
    />
  )
}
