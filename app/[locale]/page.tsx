import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { HomeStructuredData } from '@/components/seo/HomeStructuredData'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HomeHero } from '@/components/home/HomeHero'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
import { CitiesSection } from '@/components/home/CitiesSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { SellerCtaSection } from '@/components/home/SellerCtaSection'
import { withPageSeo } from '@/lib/seo/build-metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return withPageSeo(
    { title: t('title'), description: t('description') },
    {
      locale,
      pathSegments: [],
      keywords: ['lokale tjenester', 'Hjelpi', 'Norge', 'fagpersoner', 'bestill hjelp'],
    },
  )
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <HomeStructuredData locale={locale} />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <HomeHero />
        <CategoryGrid />
        <HowItWorksSection />
        <CitiesSection />
        <TestimonialsSection />
        <SellerCtaSection />
      </main>
      <Footer />
    </>
  )
}
