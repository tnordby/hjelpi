import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { absoluteSiteUrl } from '@/lib/seo/build-metadata'

type Props = {
  locale: string
  categoryTitle: string
  categorySlug: string
}

export async function CategoryBreadcrumbJsonLd({
  locale,
  categoryTitle,
  categorySlug,
}: Props) {
  const t = await getTranslations({ locale, namespace: 'categoryPage' })
  const home = absoluteSiteUrl(locale, [])
  const services = absoluteSiteUrl(locale, ['tjenester'])
  const categoryUrl = absoluteSiteUrl(locale, [categorySlug])

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
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
        ],
      }}
    />
  )
}
