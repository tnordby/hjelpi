'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import {
  minSideNavLinksForVariant,
  type MinSideNavVariant,
} from '@/lib/dashboard/min-side-nav-links'
import { cn } from '@/lib/utils'

type Variant = MinSideNavVariant

function linksForVariant(v: Variant) {
  const base = minSideNavLinksForVariant(v)
  return base.map(({ href, key }) => ({
    href,
    key,
    match: (p: string) => (href === '/min-side/kunde' || href === '/min-side/hjelper' ? p === href : p.startsWith(href)),
  }))
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
