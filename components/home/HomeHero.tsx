import { getTranslations } from 'next-intl/server'
import { HomeSearchBar } from '@/components/home/HomeSearchBar'
import { HeroDecor } from '@/components/home/HeroDecor'

export async function HomeHero() {
  const t = await getTranslations('home.hero')

  return (
    <section className="relative overflow-hidden bg-white pb-16 md:pb-20">
      <HeroDecor />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 md:pt-40">
        <h1 className="mx-auto mb-5 max-w-3xl text-center font-headline text-4xl font-extrabold leading-[1.12] tracking-tight text-primary md:mb-6 md:text-5xl lg:text-6xl">
          <span className="block">{t('titleLine1')}</span>
          <span className="mt-1 block text-secondary md:mt-2">{t('titleLine2')}</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-center text-base leading-relaxed text-on-surface-variant md:mb-12 md:text-lg">
          {t('subtitle')}
        </p>
        <div className="mx-auto flex max-w-2xl justify-center">
          <HomeSearchBar layout="hero" />
        </div>
      </div>
    </section>
  )
}
