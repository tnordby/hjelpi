import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HomeHero } from '@/components/home/HomeHero'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
import { CitiesSection } from '@/components/home/CitiesSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { SellerCtaSection } from '@/components/home/SellerCtaSection'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
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
