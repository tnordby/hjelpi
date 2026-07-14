import { getTranslations } from 'next-intl/server'

const STEPS = [
  { titleKey: 'howItWorks.step1.title', bodyKey: 'howItWorks.step1.body', tilt: '-rotate-3' },
  { titleKey: 'howItWorks.step2.title', bodyKey: 'howItWorks.step2.body', tilt: 'rotate-2' },
  { titleKey: 'howItWorks.step3.title', bodyKey: 'howItWorks.step3.body', tilt: '-rotate-2' },
] as const

export async function HowItWorksSection() {
  const t = await getTranslations('home')

  return (
    <section className="bg-surface-container-lowest py-24 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
            {t('howItWorks.title')}
          </p>
          <h2 className="mb-4 font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-[2.6rem] md:leading-tight">
            {t('howItWorks.headline')}
          </h2>
          <p className="text-on-surface-variant">{t('howItWorks.subtitle')}</p>
        </div>
        <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.titleKey} className="group relative">
              <div className="mb-6 flex items-center gap-4">
                <span
                  aria-hidden
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-secondary font-headline text-2xl font-extrabold text-on-secondary shadow-ambient transition-transform duration-300 group-hover:rotate-0 ${step.tilt}`}
                >
                  {i + 1}
                </span>
                {i < STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className="hidden flex-1 border-t-2 border-dotted border-secondary/40 md:block"
                  />
                ) : null}
              </div>
              <h3 className="mb-3 font-headline text-xl font-bold text-on-surface">
                {t(step.titleKey)}
              </h3>
              <p className="max-w-sm leading-relaxed text-on-surface-variant">
                {t(step.bodyKey)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
