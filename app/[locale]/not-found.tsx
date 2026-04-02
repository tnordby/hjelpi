import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { withPageSeo } from '@/lib/seo/build-metadata'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'notFound' })
  return withPageSeo(
    { title: t('metaTitle'), description: t('metaDescription') },
    {
      locale,
      pathSegments: [],
      indexable: false,
      includeCanonical: false,
    },
  )
}

export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 text-center">
      <p className="mb-2 font-headline text-sm font-bold uppercase tracking-widest text-tertiary">
        404
      </p>
      <h1 className="mb-4 font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
        {t('title')}
      </h1>
      <p className="mb-10 max-w-md text-on-surface-variant">{t('description')}</p>
      <Link
        href="/"
        className="rounded-full bg-primary px-8 py-3 font-bold text-on-primary shadow-ambient transition-opacity hover:opacity-90"
      >
        {t('backHome')}
      </Link>
    </main>
  )
}
