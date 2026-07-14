import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'

function Sparkle({ className }: { className: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 48 48" fill="currentColor">
      <path d="M24 2c2 10 6 16 10 19s8 4 12 3c-10 2-16 6-19 10s-4 8-3 12c-2-10-6-16-10-19s-8-4-12-3c10-2 16-6 19-10s4-8 3-12z" />
    </svg>
  )
}

export async function SellerCtaSection() {
  const t = await getTranslations('home.cta')

  return (
    <section className="pb-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[3rem] bg-primary p-12 text-center text-on-primary md:p-20">
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-secondary opacity-[0.18] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-mint opacity-[0.12] blur-3xl" />
          <Sparkle className="pointer-events-none absolute right-16 top-12 hidden h-10 w-10 rotate-12 text-mint md:block" />
          <Sparkle className="pointer-events-none absolute left-14 bottom-14 hidden h-7 w-7 -rotate-12 text-secondary md:block" />
          <div className="relative z-10">
            <h2 className="mx-auto mb-8 max-w-3xl font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
              {t('title')}
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-primary-fixed md:text-xl">
              {t('subtitle')}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/bli-hjelper/registrer"
                className="rounded-full bg-secondary px-10 py-4 font-bold text-on-secondary shadow-xl transition-transform hover:scale-[1.03]"
              >
                {t('primary')}
              </Link>
              <Link
                href="/bli-hjelper"
                className="rounded-full border-2 border-primary-fixed/60 bg-transparent px-10 py-4 font-bold text-primary-fixed transition-colors hover:bg-primary-fixed/10"
              >
                {t('secondary')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
