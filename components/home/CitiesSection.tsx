import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { HOME_CITIES } from '@/lib/home/cities'

export async function CitiesSection() {
  const t = await getTranslations('home')
  const nf = new Intl.NumberFormat('nb-NO')

  return (
    <section className="bg-surface-container-low py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <h2 className="mb-12 text-center font-headline text-2xl font-extrabold tracking-tight text-primary">
          {t('cities.title')}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {HOME_CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="group flex flex-col items-center justify-center rounded-2xl bg-surface-container-lowest p-6 text-center shadow-sm transition-all hover:shadow-md"
            >
              <h4 className="font-bold text-on-surface transition-colors group-hover:text-primary">
                {t(`cities.bySlug.${city.slug}`)}
              </h4>
              <p className="mt-1 text-xs text-on-surface-variant">
                {t('cities.expertCount', {
                  count: nf.format(city.expertCount),
                })}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/byer"
            className="text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline"
          >
            {t('cities.seeAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}
