'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type Variant = 'kunde' | 'hjelper'

function linksForVariant(v: Variant) {
  if (v === 'kunde') {
    return [
      { href: '/min-side/kunde', key: 'overview' as const, match: (p: string) => p === '/min-side/kunde' },
      {
        href: '/min-side/kunde/bestillinger',
        key: 'bookings' as const,
        match: (p: string) => p.startsWith('/min-side/kunde/bestillinger'),
      },
      {
        href: '/min-side/kunde/meldinger',
        key: 'messages' as const,
        match: (p: string) => p.startsWith('/min-side/kunde/meldinger'),
      },
      {
        href: '/min-side/innstillinger',
        key: 'settings' as const,
        match: (p: string) => p.startsWith('/min-side/innstillinger'),
      },
    ]
  }
  return [
    { href: '/min-side/hjelper', key: 'overview' as const, match: (p: string) => p === '/min-side/hjelper' },
    {
      href: '/min-side/hjelper/tjenester',
      key: 'services' as const,
      match: (p: string) => p.startsWith('/min-side/hjelper/tjenester'),
    },
    {
      href: '/min-side/hjelper/foresporsler',
      key: 'requests' as const,
      match: (p: string) => p.startsWith('/min-side/hjelper/foresporsler'),
    },
    {
      href: '/min-side/hjelper/inntekter',
      key: 'economy' as const,
      match: (p: string) => p.startsWith('/min-side/hjelper/inntekter'),
    },
    {
      href: '/min-side/hjelper/meldinger',
      key: 'messages' as const,
      match: (p: string) => p.startsWith('/min-side/hjelper/meldinger'),
    },
    {
      href: '/min-side/innstillinger',
      key: 'settings' as const,
      match: (p: string) => p.startsWith('/min-side/innstillinger'),
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
    <nav className="-mx-6 border-t border-outline-variant/20 px-6 pt-1" aria-label={t('ariaLabel')}>
      <div className="scrollbar-none flex gap-1 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex min-w-min gap-1">
          {links.map(({ href, key, match }) => {
            const active = match(pathname)
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  className={cn(
                    'relative block whitespace-nowrap px-3 py-3.5 text-sm font-medium tracking-tight transition-colors',
                    active
                      ? 'font-semibold text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary'
                      : 'text-on-surface-variant hover:text-on-surface',
                  )}
                >
                  {t(key)}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
