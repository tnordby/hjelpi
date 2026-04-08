import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { hjBtnPrimaryPill } from '@/lib/button-classes'
import { cn } from '@/lib/utils'
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
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 text-center outline-none"
    >
      <p className="mb-2 font-headline text-sm font-bold uppercase tracking-widest text-tertiary">
        404
      </p>
      <h1 className="mb-4 font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
        {t('title')}
      </h1>
      <p className="mb-10 max-w-md text-on-surface-variant">{t('description')}</p>
      <Link href="/" className={cn(hjBtnPrimaryPill, 'px-8 py-3')}>
        {t('backHome')}
      </Link>
    </main>
  )
}
