import { getTranslations } from 'next-intl/server'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

const STEPS = [
  { icon: 'search_check' as const, titleKey: 'howItWorks.step1.title', bodyKey: 'howItWorks.step1.body' },
  { icon: 'reviews' as const, titleKey: 'howItWorks.step2.title', bodyKey: 'howItWorks.step2.body' },
  { icon: 'task_alt' as const, titleKey: 'howItWorks.step3.title', bodyKey: 'howItWorks.step3.body' },
] as const

export async function HowItWorksSection() {
  const t = await getTranslations('home')

  return (
    <section className="bg-surface-container-lowest py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
            {t('howItWorks.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-on-surface-variant">
            {t('howItWorks.subtitle')}
          </p>
        </div>
        <div className="relative grid gap-12 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.titleKey}
              className="group flex flex-col items-center text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-container text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary">
                <MaterialIcon name={step.icon} className="text-4xl" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-on-surface">
                {t(step.titleKey)}
              </h3>
              <p className="leading-relaxed text-on-surface-variant">
                {t(step.bodyKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
