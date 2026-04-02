import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { absoluteSiteUrl } from '@/lib/seo/build-metadata'

type Props = {
  locale: string
  categoryTitle: string
  categorySlug: string
  subTitle: string
  subSlug: string
  /** When set, adds a fifth crumb for /…/i/{citySlug} (city-specific subcategory). */
  cityName?: string
  citySlug?: string
}

export async function SubcategoryBreadcrumbJsonLd({
  locale,
  categoryTitle,
  categorySlug,
  subTitle,
  subSlug,
  cityName,
  citySlug,
}: Props) {
  const t = await getTranslations({ locale, namespace: 'subcategoryPage' })
  const home = absoluteSiteUrl(locale, [])
  const services = absoluteSiteUrl(locale, ['tjenester'])
  const categoryUrl = absoluteSiteUrl(locale, [categorySlug])
  const subUrl = absoluteSiteUrl(locale, [categorySlug, subSlug])
  const inCity =
    cityName &&
    citySlug &&
    cityName.trim().length > 0 &&
    citySlug.trim().length > 0
  const cityUrl = inCity
    ? absoluteSiteUrl(locale, [categorySlug, subSlug, 'i', citySlug])
    : null

  const items: Record<string, unknown>[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: t('breadcrumbHome'),
      item: home,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: t('breadcrumbServices'),
      item: services,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: categoryTitle,
      item: categoryUrl,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: subTitle,
      item: subUrl,
    },
  ]

  if (inCity && cityUrl) {
    items.push({
      '@type': 'ListItem',
      position: 5,
      name: cityName,
      item: cityUrl,
    })
  }

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items,
      }}
    />
  )
}
