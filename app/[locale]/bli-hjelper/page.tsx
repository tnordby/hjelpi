import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BliHjelperLanding } from '@/components/seller/BliHjelperLanding'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'bliHjelperPage' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function BliHjelperPage() {
  return (
    <>
      <Navbar />
      <main>
        <BliHjelperLanding />
      </main>
      <Footer />
    </>
  )
}
