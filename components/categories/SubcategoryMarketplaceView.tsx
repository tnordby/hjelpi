import type { ReactNode } from 'react'
import Image from 'next/image'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { ServiceBreadcrumbs } from '@/components/categories/ServiceBreadcrumbs'
import { SubcategoryProviderList } from '@/components/providers/SubcategoryProviderList'
import type { SubcategoryProviderItem } from '@/lib/providers/subcategory-providers'

export type SubcategoryBreadcrumb = { label: string; href?: string }

type Props = {
  jsonLd: ReactNode
  heroSrc: string
  heroAlt: string
  breadcrumbs: SubcategoryBreadcrumb[]
  eyebrow: string
  title: string
  intro: string
  providers: SubcategoryProviderItem[]
}

export function SubcategoryMarketplaceView({
  jsonLd,
  heroSrc,
  heroAlt,
  breadcrumbs,
  eyebrow,
  title,
  intro,
  providers,
}: Props) {
  return (
    <>
      {jsonLd}
      <Navbar />
      <main className="min-h-screen bg-surface-container-lowest">
        <section className="relative min-h-[280px] overflow-hidden md:min-h-[340px]">
          <Image
            src={heroSrc}
            alt={heroAlt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/50" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/80"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-tr from-primary/35 via-transparent to-primary/25"
            aria-hidden
          />
          <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-[6.625rem] md:pb-16">
            <div className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
              <ServiceBreadcrumbs variant="inverse" items={breadcrumbs} />
              <header className="max-w-3xl text-white">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/90">
                  {eyebrow}
                </p>
                <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
                  {title}
                </h1>
                <p className="text-lg leading-relaxed text-white/95">{intro}</p>
              </header>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <SubcategoryProviderList providers={providers} />
        </div>
      </main>
      <Footer />
    </>
  )
}
