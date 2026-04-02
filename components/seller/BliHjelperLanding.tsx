import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'

export async function BliHjelperLanding() {
  const t = await getTranslations('bliHjelperPage')

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-32 md:pt-40">
      <header className="mx-auto max-w-3xl text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
          {t('heroEyebrow')}
        </p>
        <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-primary md:text-5xl">
          {t('heroTitle')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          {t('heroBody')}
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/bli-hjelper/registrer"
            className="rounded-full bg-primary px-10 py-4 text-center text-sm font-extrabold text-on-primary shadow-ambient transition-opacity hover:opacity-90"
          >
            {t('ctaRegister')}
          </Link>
          <Link
            href="/logg-inn"
            className="rounded-full border-2 border-primary px-10 py-4 text-center text-sm font-extrabold text-primary transition-colors hover:bg-primary/5"
          >
            {t('ctaLogin')}
          </Link>
        </div>
      </header>

      <section className="mt-24" aria-labelledby="benefits-heading">
        <h2
          id="benefits-heading"
          className="text-center font-headline text-2xl font-extrabold text-on-surface md:text-3xl"
        >
          {t('benefitsTitle')}
        </h2>
        <ul className="mt-12 grid gap-8 md:grid-cols-3">
          <li className="rounded-3xl bg-surface-container-lowest p-8 shadow-ambient ring-1 ring-outline-variant/15">
            <h3 className="font-headline text-lg font-bold text-primary">{t('benefit1Title')}</h3>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              {t('benefit1Body')}
            </p>
          </li>
          <li className="rounded-3xl bg-surface-container-lowest p-8 shadow-ambient ring-1 ring-outline-variant/15">
            <h3 className="font-headline text-lg font-bold text-primary">{t('benefit2Title')}</h3>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              {t('benefit2Body')}
            </p>
          </li>
          <li className="rounded-3xl bg-surface-container-lowest p-8 shadow-ambient ring-1 ring-outline-variant/15">
            <h3 className="font-headline text-lg font-bold text-primary">{t('benefit3Title')}</h3>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              {t('benefit3Body')}
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-24" aria-labelledby="steps-heading">
        <h2
          id="steps-heading"
          className="text-center font-headline text-2xl font-extrabold text-on-surface md:text-3xl"
        >
          {t('stepsTitle')}
        </h2>
        <ol className="mx-auto mt-12 max-w-xl space-y-6">
          <li className="flex gap-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-on-primary"
              aria-hidden
            >
              1
            </span>
            <p className="pt-1.5 text-on-surface-variant">{t('step1')}</p>
          </li>
          <li className="flex gap-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-on-primary"
              aria-hidden
            >
              2
            </span>
            <p className="pt-1.5 text-on-surface-variant">{t('step2')}</p>
          </li>
          <li className="flex gap-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-on-primary"
              aria-hidden
            >
              3
            </span>
            <p className="pt-1.5 text-on-surface-variant">{t('step3')}</p>
          </li>
        </ol>
      </section>

      <p className="mt-16 text-center text-sm text-on-surface-variant">{t('footnote')}</p>

      <div className="mt-12 flex justify-center">
        <Link
          href="/bli-hjelper/registrer"
          className="rounded-full bg-primary px-10 py-4 text-sm font-extrabold text-on-primary shadow-ambient transition-opacity hover:opacity-90"
        >
          {t('ctaRegister')}
        </Link>
      </div>
    </div>
  )
}
