import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { HOME_TESTIMONIALS } from '@/lib/home/testimonials'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'

export async function TestimonialsSection() {
  const t = await getTranslations('home.testimonials')

  return (
    <section className="overflow-hidden py-24 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6">
        <h2 className="mb-14 text-center font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-[2.6rem]">
          {t('title')}
        </h2>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {HOME_TESTIMONIALS.map((item, i) => (
            <article
              key={item.quoteKey}
              className={cn(
                'relative rounded-[2rem] bg-surface-container-lowest p-8 pt-10 shadow-ambient-soft ring-1 ring-outline-variant transition-shadow hover:shadow-ambient',
                i === 1 && 'md:-translate-y-4',
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-1 left-6 font-headline text-7xl font-extrabold leading-none text-secondary/20"
              >
                &ldquo;
              </span>
              <div
                className="mb-4 flex text-tertiary"
                role="img"
                aria-label={t('starsLabel')}
              >
                {Array.from({ length: 5 }).map((_, j) => (
                  <MaterialIcon key={j} name="star" filled className="text-lg" />
                ))}
              </div>
              <p className="mb-7 font-headline text-lg font-medium leading-relaxed text-on-surface">
                {t(item.quoteKey)}
              </p>
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-surface-container">
                  <Image
                    src={item.avatarSrc}
                    alt={t(item.avatarAltKey)}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    {t(item.nameKey)}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {t(item.cityKey)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
