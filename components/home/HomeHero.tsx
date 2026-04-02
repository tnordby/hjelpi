import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { HomeSearchBar } from '@/components/home/HomeSearchBar'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCrnX8eQe1xJvul6fIZJ4rp5eJRyFmENvh0wBjrXlwuEhYAjVyo4lfqv45ryUiHogyeGkhbeBnpM6ln3K4RxLG1kxSlkgNh7WX6bfmI-COR2yhBjwNmnQ_w6pyWW_e0Tmk0V2xj_cbAMM4YhRZ6vmADgfdWNZXo8CZRhOteSHiAu5vpMBy7PmtZYJbh6PK0j0-e-fzp_5tV9mPqOQXFlF8c7fFvOpHzvDdR_dP0G2A0xRGshVX-gWRs3bUXPIM5UPOkyiPgBCR8BMk1'

export async function HomeHero() {
  const t = await getTranslations('home.hero')

  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className="z-10">
          <span className="mb-6 inline-block rounded-full bg-secondary-container px-3 py-1 text-xs font-bold tracking-wider text-on-secondary-container">
            {t('eyebrow')}
          </span>
          <h1 className="mb-8 font-headline text-5xl font-extrabold leading-[1.1] tracking-tight text-primary md:text-7xl">
            {t('titleLine1')}
            <br />
            <span className="text-secondary">{t('titleLine2')}</span>
          </h1>
          <p className="mb-10 max-w-lg text-lg leading-relaxed text-on-surface-variant md:text-xl">
            {t('subtitle')}
          </p>
          <HomeSearchBar />
        </div>
        <div className="relative hidden lg:block">
          <div className="pointer-events-none absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-secondary-container/30 blur-3xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src={HERO_IMAGE}
              alt={t('imageAlt')}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 0px"
              priority
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary">
                  <MaterialIcon name="verified_user" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">{t('trustTitle')}</p>
                  <p className="text-sm text-on-surface-variant">
                    {t('trustSubtitle')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
