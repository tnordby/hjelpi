import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BliHjelperLanding } from '@/components/seller/BliHjelperLanding'
import { withPageSeo } from '@/lib/seo/build-metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'bliHjelperPage' })
  return withPageSeo(
    { title: t('metaTitle'), description: t('metaDescription') },
    {
      locale,
      pathSegments: ['bli-hjelper'],
      keywords: ['bli hjelper', 'lokale tjenester', 'Hjelpi', 'Norge'],
    },
  )
}

export default function BliHjelperPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <BliHjelperLanding />
      </main>
      <Footer />
    </>
  )
}
