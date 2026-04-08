import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { withPageSeo } from '@/lib/seo/build-metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.personvern' })
  return withPageSeo(
    { title: t('metaTitle'), description: t('metaDescription') },
    { locale, pathSegments: ['personvern'], indexable: true, keywords: ['personvern', 'Hjelpi'] },
  )
}

export default async function PersonvernPage() {
  const t = await getTranslations('legal.personvern')

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-surface-container-lowest pb-20 pt-[var(--hj-navbar-height)] outline-none"
      >
        <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-6 text-lg text-on-surface-variant">{t('lead')}</p>
          <div className="mt-10 max-w-none space-y-6 leading-relaxed text-on-surface">
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
            <p>{t('p3')}</p>
            <p>{t('p4')}</p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
