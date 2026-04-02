import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'

export async function SellerCtaSection() {
  const t = await getTranslations('home.cta')

  return (
    <section className="px-6 pb-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[3rem] bg-primary p-12 text-center text-on-primary md:p-20">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-container opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary opacity-20 blur-3xl" />
        <div className="relative z-10">
          <h2 className="mb-8 font-headline text-4xl font-extrabold tracking-tighter md:text-5xl">
            {t('title')}
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-primary-fixed opacity-90 md:text-xl">
            {t('subtitle')}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/bli-hjelper"
              className="rounded-full bg-surface-container-lowest px-10 py-4 font-extrabold text-primary shadow-xl transition-transform hover:scale-105"
            >
              {t('primary')}
            </Link>
            <Link
              href="/bli-hjelper"
              className="rounded-full border-2 border-primary-fixed bg-transparent px-10 py-4 font-extrabold text-primary-fixed transition-colors hover:bg-primary-fixed/10"
            >
              {t('secondary')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
