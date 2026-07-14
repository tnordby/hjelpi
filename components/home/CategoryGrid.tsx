import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { HOME_CATEGORIES } from '@/lib/home/categories'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'

export async function CategoryGrid() {
  const t = await getTranslations('home')

  return (
    <section id="kategorier" className="bg-surface-container-low py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
          <div>
            <h2 className="mb-4 font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-[2.6rem]">
              {t('categories.title')}
            </h2>
            <p className="max-w-md text-on-surface-variant">
              {t('categories.subtitle')}
            </p>
          </div>
          <Link
            href="/tjenester"
            className="group flex items-center gap-2 rounded-full bg-surface-container-lowest px-5 py-2.5 text-sm font-bold text-primary shadow-ambient-soft ring-1 ring-outline-variant transition-shadow hover:shadow-ambient"
          >
            {t('categories.seeAll')}
            <MaterialIcon
              name="arrow_forward"
              className="text-lg transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {HOME_CATEGORIES.map((cat) => {
            const title = t(`categories.${cat.id}.title`)
            const description =
              cat.id === 'fotografi'
                ? t('categories.fotografi.description')
                : undefined
            const imageAlt = t(`categories.${cat.id}.imageAlt`)

            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={cn(
                  'group relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm transition-all duration-500 hover:bg-surface-bright hover:shadow-xl',
                  cat.large && 'md:col-span-2 md:row-span-2',
                  !cat.large && 'h-64',
                  cat.large && 'min-h-[280px] md:min-h-[420px]',
                )}
              >
                <Image
                  src={cat.imageSrc}
                  alt={imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes={
                    cat.large
                      ? '(min-width: 1024px) 50vw, (min-width: 768px) 66vw, 100vw'
                      : '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw'
                }
                />
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-t to-transparent',
                    cat.large
                      ? 'from-black/80 via-black/20'
                      : 'from-black/70',
                  )}
                />
                <div
                  className={cn(
                    'absolute bottom-0 left-0 text-white',
                    cat.large ? 'p-8' : 'p-6',
                  )}
                >
                  <MaterialIcon
                    name={cat.icon}
                    className={cn('mb-2 text-white/90', cat.large ? 'text-3xl' : 'text-2xl')}
                  />
                  <h3
                    className={cn(
                      'font-headline font-bold tracking-tight',
                      cat.large ? 'mb-2 text-3xl' : 'text-2xl',
                    )}
                  >
                    {title}
                  </h3>
                  {description ? (
                    <p className="max-w-xs text-sm text-white/85">{description}</p>
                  ) : null}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
