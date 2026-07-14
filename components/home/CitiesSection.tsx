import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { HOME_CITIES } from '@/lib/home/cities'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

export async function CitiesSection() {
  const t = await getTranslations('home')

  return (
    <section className="bg-surface-container-low py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <h2 className="mb-12 text-center font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('cities.title')}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {HOME_CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="group flex flex-col items-center justify-center rounded-[1.5rem] bg-surface-container-lowest p-6 text-center shadow-ambient-soft ring-1 ring-outline-variant transition-all hover:-translate-y-0.5 hover:shadow-ambient"
            >
              <h4 className="font-headline text-lg font-semibold text-on-surface transition-colors group-hover:text-secondary">
                {t(`cities.bySlug.${city.slug}`)}
              </h4>
              <p className="mt-1 text-xs font-medium text-on-surface-variant">
                {t('cities.cardTagline')}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/byer"
            className="group flex items-center gap-2 text-sm font-bold text-primary underline-offset-4 transition-colors hover:underline"
          >
            {t('cities.seeAll')}
            <MaterialIcon
              name="arrow_forward"
              className="text-base transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
