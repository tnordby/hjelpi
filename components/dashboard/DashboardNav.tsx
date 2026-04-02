'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type Variant = 'kunde' | 'hjelper'

function linksForVariant(v: Variant) {
  if (v === 'kunde') {
    return [
      { href: '/dashboard/kunde', key: 'overview' as const, match: (p: string) => p === '/dashboard/kunde' },
      {
        href: '/dashboard/kunde/bestillinger',
        key: 'bookings' as const,
        match: (p: string) => p.startsWith('/dashboard/kunde/bestillinger'),
      },
      {
        href: '/dashboard/kunde/meldinger',
        key: 'messages' as const,
        match: (p: string) => p.startsWith('/dashboard/kunde/meldinger'),
      },
      {
        href: '/dashboard/innstillinger',
        key: 'settings' as const,
        match: (p: string) => p.startsWith('/dashboard/innstillinger'),
      },
    ]
  }
  return [
    { href: '/dashboard/hjelper', key: 'overview' as const, match: (p: string) => p === '/dashboard/hjelper' },
    {
      href: '/dashboard/hjelper/foresporsler',
      key: 'requests' as const,
      match: (p: string) => p.startsWith('/dashboard/hjelper/foresporsler'),
    },
    {
      href: '/dashboard/hjelper/inntekter',
      key: 'economy' as const,
      match: (p: string) => p.startsWith('/dashboard/hjelper/inntekter'),
    },
    {
      href: '/dashboard/hjelper/meldinger',
      key: 'messages' as const,
      match: (p: string) => p.startsWith('/dashboard/hjelper/meldinger'),
    },
    {
      href: '/dashboard/innstillinger',
      key: 'settings' as const,
      match: (p: string) => p.startsWith('/dashboard/innstillinger'),
    },
  ]
}

type Props = {
  variant: Variant
}

export function DashboardNav({ variant }: Props) {
  const t = useTranslations('dashboard.nav')
  const pathname = usePathname()
  const links = linksForVariant(variant)

  return (
    <nav
      className="flex shrink-0 flex-col gap-1 border-b border-outline-variant/30 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6"
      aria-label={t('ariaLabel')}
    >
      <p className="mb-2 hidden font-headline text-sm font-extrabold text-primary md:block">
        {variant === 'kunde' ? t('sectionBuyer') : t('sectionSeller')}
      </p>
      <ul className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-0.5 md:overflow-visible md:pb-0">
        {links.map(({ href, key, match }) => {
          const active = match(pathname)
          return (
            <li key={href} className="shrink-0 md:shrink">
              <Link
                href={href}
                className={cn(
                  'block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:py-2',
                  active
                    ? 'bg-primary/10 font-bold text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
                )}
              >
                {t(key)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
