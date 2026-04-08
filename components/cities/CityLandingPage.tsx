import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { ServiceBreadcrumbs } from '@/components/categories/ServiceBreadcrumbs'
import { Link } from '@/i18n/routing'
import { TAXONOMY } from '@/lib/categories/taxonomy'
import { getSubcategoryHeroImage } from '@/lib/categories/subcategory-hero'
import { getCategoryMaterialIcon } from '@/lib/categories/category-material-icons'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { cityPathSegment, type PublicLocation } from '@/lib/locations/public'
import { cn } from '@/lib/utils'
import { hjBtnPrimaryPill } from '@/lib/button-classes'
import { seoLowercaseLabel } from '@/lib/seo/display-label'

type Props = {
  location: PublicLocation
}

export async function CityLandingPage({ location }: Props) {
  const t = await getTranslations('cityPage')
  const cityLabel = location.cityName
  const cityLc = seoLowercaseLabel(cityLabel)
  const stedSeg = cityPathSegment(location)
  const heroSrc = getSubcategoryHeroImage(TAXONOMY[0]!.slug)

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-surface-container-lowest outline-none"
      >
        <section className="relative min-h-[260px] overflow-hidden md:min-h-[300px]">
          <Image
            src={heroSrc}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/45" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/75" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-[6.625rem] md:pb-14">
            <div className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
              <ServiceBreadcrumbs
                variant="inverse"
                items={[
                  { label: t('breadcrumbHome'), href: '/' },
                  { label: t('breadcrumbCities'), href: '/byer' },
                  { label: cityLabel },
                ]}
              />
              <header className="max-w-3xl text-white">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/90">
                  {t('eyebrow')}
                </p>
                <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
                  {t('title', { city: cityLabel })}
                </h1>
                <p className="text-lg leading-relaxed text-white/95">{t('intro', { city: cityLc })}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/tjenester"
                    className={cn(hjBtnPrimaryPill, 'inline-flex items-center justify-center bg-white text-primary hover:opacity-95')}
                  >
                    {t('ctaBrowse')}
                  </Link>
                  <Link
                    href="/bli-hjelper"
                    className="inline-flex items-center justify-center rounded-full border-2 border-white/90 px-8 py-3 text-sm font-extrabold text-white transition-colors hover:bg-white/10"
                  >
                    {t('ctaHelper')}
                  </Link>
                </div>
              </header>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <h2 className="mb-2 font-headline text-2xl font-bold text-primary">{t('categoriesHeading')}</h2>
          <p className="mb-10 max-w-2xl text-on-surface-variant">{t('categoriesSub', { city: cityLabel })}</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TAXONOMY.map((cat) => {
              const firstSub = cat.subs[0]
              const href = firstSub
                ? `/${cat.slug}/${firstSub.slug}/i/${stedSeg}`
                : `/${cat.slug}`
              const categoryIcon = getCategoryMaterialIcon(cat.slug)
              return (
                <li key={cat.slug}>
                  <Link
                    href={href}
                    className="group flex min-h-[5.5rem] items-center gap-4 rounded-2xl border border-outline-variant/30 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
                  >
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/15"
                      aria-hidden
                    >
                      <MaterialIcon name={categoryIcon} className="text-[1.5rem]" />
                    </span>
                    <span className="min-w-0 flex-1 font-headline text-base font-bold text-on-surface group-hover:text-primary">
                      {cat.title}
                    </span>
                    <MaterialIcon
                      name="chevron_right"
                      className="shrink-0 text-2xl text-on-surface-variant group-hover:text-primary"
                      aria-hidden
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  )
}
