import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { absoluteSiteUrl } from '@/lib/seo/build-metadata'

type Props = { locale: string }

export async function HomeStructuredData({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  const siteUrl = absoluteSiteUrl(locale, [])
  const orgId = `${siteUrl}#organization`
  const webId = `${siteUrl}#website`

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': orgId,
            name: 'Hjelpi',
            legalName: 'Hjelpi AS',
            url: siteUrl,
            description: t('description'),
          },
          {
            '@type': 'WebSite',
            '@id': webId,
            name: 'Hjelpi',
            url: siteUrl,
            description: t('description'),
            publisher: { '@id': orgId },
            inLanguage: locale === 'no' ? 'nb-NO' : 'en',
          },
        ],
      }}
    />
  )
}
