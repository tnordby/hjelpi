'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'

export function Navbar() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const isServicesIndex = pathname === '/tjenester'

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/70 shadow-ambient backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-headline text-2xl font-black tracking-tighter text-primary"
          >
            {t('brand')}
          </Link>
          <div className="hidden space-x-6 md:flex">
            <Link
              href="/tjenester"
              className={cn(
                'font-medium tracking-tight transition-colors',
                isServicesIndex
                  ? 'border-b-2 border-primary font-bold text-primary'
                  : 'text-on-surface-variant hover:text-primary',
              )}
            >
              {t('findServices')}
            </Link>
            <Link
              href="/bli-hjelper"
              className="font-medium text-on-surface-variant transition-colors hover:text-primary"
            >
              {t('becomeHelper')}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/logg-inn"
            className="hidden font-medium text-on-surface-variant transition-colors hover:text-primary sm:block"
          >
            {t('logIn')}
          </Link>
          <Link
            href="/registrer"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-all hover:opacity-90"
          >
            {t('getStarted')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
