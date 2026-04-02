import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { HOME_TESTIMONIALS } from '@/lib/home/testimonials'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

export async function TestimonialsSection() {
  const t = await getTranslations('home.testimonials')

  return (
    <section className="overflow-hidden py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <h2 className="mb-12 text-center font-headline text-3xl font-extrabold tracking-tight text-primary">
          {t('title')}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {HOME_TESTIMONIALS.map((item) => (
            <article
              key={item.quoteKey}
              className="rounded-3xl bg-surface-container-lowest p-8 shadow-ambient-soft"
            >
              <div
                className="mb-4 flex text-tertiary"
                role="img"
                aria-label={t('starsLabel')}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <MaterialIcon key={i} name="star" filled className="text-tertiary" />
                ))}
              </div>
              <p className="mb-6 italic text-on-surface">{t(item.quoteKey)}</p>
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
