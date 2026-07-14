import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { HomeSearchBar } from '@/components/home/HomeSearchBar'
import { HeroDecor } from '@/components/home/HeroDecor'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

const TRUST_ITEMS = [
  { icon: 'verified_user', key: 'verified' },
  { icon: 'location_on', key: 'local' },
  { icon: 'volunteer_activism', key: 'free' },
] as const

const HERO_PHOTO_MAIN =
  'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=900&q=80'
const HERO_PHOTO_SMALL =
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80'

export async function HomeHero() {
  const t = await getTranslations('home.hero')

  return (
    <section className="relative overflow-hidden bg-surface pb-20 md:pb-24">
      <HeroDecor />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pt-28 md:pt-36 lg:grid-cols-[7fr_5fr] lg:gap-10">
        <div>
          <h1 className="mb-7 max-w-2xl font-headline text-5xl font-extrabold leading-[1.06] tracking-tight text-on-surface md:text-6xl lg:text-[4.2rem]">
            {t('titleLine1')}
            <span className="mt-3 block">
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute -inset-x-3 inset-y-0 -rotate-1 rounded-2xl bg-secondary"
                />
                <span className="relative text-on-secondary">{t('titleLine2')}</span>
              </span>
            </span>
          </h1>
          <p className="mb-10 max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
            {t('subtitle')}
          </p>
          <HomeSearchBar layout="hero" />
          <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
            {TRUST_ITEMS.map((item) => (
              <li
                key={item.key}
                className="flex items-center gap-2 text-sm font-medium text-on-surface-variant"
              >
                <MaterialIcon
                  name={item.icon}
                  filled
                  className="text-lg text-secondary"
                />
                {t(`trust.${item.key}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative hidden min-h-[34rem] lg:block">
          <div className="absolute right-8 top-0 h-[26rem] w-[19rem] overflow-hidden rounded-b-[2.5rem] rounded-t-full shadow-ambient-md">
            <Image
              src={HERO_PHOTO_MAIN}
              alt={t('imageAlt1')}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 19rem, 0px"
            />
          </div>
          <div className="absolute bottom-4 left-0 h-56 w-48 overflow-hidden rounded-[2rem] border-4 border-surface shadow-ambient-md">
            <Image
              src={HERO_PHOTO_SMALL}
              alt={t('imageAlt2')}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 12rem, 0px"
            />
          </div>
          <svg
            aria-hidden
            className="absolute left-10 top-6 h-12 w-12 -rotate-12 text-secondary"
            viewBox="0 0 48 48"
            fill="currentColor"
          >
            <path d="M24 2c2 10 6 16 10 19s8 4 12 3c-10 2-16 6-19 10s-4 8-3 12c-2-10-6-16-10-19s-8-4-12-3c10-2 16-6 19-10s4-8 3-12z" />
          </svg>
          <svg
            aria-hidden
            className="absolute -left-2 bottom-64 h-7 w-7 rotate-12 text-mint"
            viewBox="0 0 48 48"
            fill="currentColor"
          >
            <path d="M24 2c2 10 6 16 10 19s8 4 12 3c-10 2-16 6-19 10s-4 8-3 12c-2-10-6-16-10-19s-8-4-12-3c10-2 16-6 19-10s4-8 3-12z" />
          </svg>
        </div>
      </div>
    </section>
  )
}
