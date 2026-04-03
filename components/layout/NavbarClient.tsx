'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { NavbarModeToggle } from '@/components/layout/NavbarModeToggle'
import type { NavbarUserMenuProps } from '@/components/layout/NavbarUserMenu'
import { NavbarMessagesLink } from '@/components/layout/NavbarMessagesLink'
import { NavbarNotificationBell } from '@/components/layout/NavbarNotificationBell'
import { NavbarUserMenu } from '@/components/layout/NavbarUserMenu'
import type { NavbarNotificationCounts } from '@/lib/dashboard/data'
import { cn } from '@/lib/utils'

type Props = {
  isLoggedIn: boolean
  userMenu: NavbarUserMenuProps | null
  notificationCounts: NavbarNotificationCounts | null
  messagesInbox: { href: string; unreadCount: number } | null
  modeToggle: { isSeller: boolean } | null
  dashboardHomeHref: '/min-side/kunde' | '/min-side/hjelper' | null
}

export function NavbarClient({
  isLoggedIn,
  userMenu,
  notificationCounts,
  messagesInbox,
  modeToggle,
  dashboardHomeHref,
}: Props) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const isServicesIndex = pathname === '/tjenester'
  const isDashboard = pathname.startsWith('/min-side')

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-outline-variant/50 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex min-h-[var(--hj-navbar-height)] w-full max-w-7xl items-center justify-between px-6 py-3 sm:py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-headline text-2xl font-black tracking-tighter text-primary"
          >
            {t('brand')}
          </Link>
          {isLoggedIn && modeToggle && isDashboard ? (
            <NavbarModeToggle isSeller={modeToggle.isSeller} />
          ) : (
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
              {!isLoggedIn ? (
                <Link
                  href="/bli-hjelper"
                  className="font-medium text-on-surface-variant transition-colors hover:text-primary"
                >
                  {t('becomeHelper')}
                </Link>
              ) : null}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <Link
              href="/logg-inn"
              className="hidden font-medium text-on-surface-variant transition-colors hover:text-primary sm:block"
            >
              {t('logIn')}
            </Link>
          ) : null}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {messagesInbox ? (
                <NavbarMessagesLink
                  href={messagesInbox.href}
                  unreadCount={messagesInbox.unreadCount}
                />
              ) : null}
              {notificationCounts ? <NavbarNotificationBell counts={notificationCounts} /> : null}
              <Link
                href={dashboardHomeHref ?? '/min-side/kunde'}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-all hover:opacity-90"
              >
                {t('dashboard')}
              </Link>
              {userMenu ? (
                <NavbarUserMenu
                  avatarUrl={userMenu.avatarUrl}
                  fullName={userMenu.fullName}
                  email={userMenu.email}
                  minSideNavFallback={userMenu.minSideNavFallback}
                />
              ) : null}
            </div>
          ) : (
            <Link
              href="/registrer"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-all hover:opacity-90"
            >
              {t('getStarted')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
