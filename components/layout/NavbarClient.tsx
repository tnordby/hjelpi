'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { NavbarModeToggle } from '@/components/layout/NavbarModeToggle'
import type { NavbarUserMenuProps } from '@/components/layout/NavbarUserMenu'
import { NavbarMessagesLink } from '@/components/layout/NavbarMessagesLink'
import { NavbarNotificationBell } from '@/components/layout/NavbarNotificationBell'
import { NavbarUserMenu } from '@/components/layout/NavbarUserMenu'
import type { NavbarNotificationCounts } from '@/lib/dashboard/data'
import { hjBtnPrimaryPill } from '@/lib/button-classes'
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

  const dashboardModeToggle = isLoggedIn && modeToggle && isDashboard

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-outline-variant/50 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex min-h-[var(--hj-navbar-height)] w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-6 py-3 sm:py-4 md:flex-nowrap md:justify-between">
        <Link
          href="/"
          className="shrink-0 font-headline text-2xl font-black tracking-tighter text-primary"
        >
          {t('brand')}
        </Link>
        {dashboardModeToggle ? (
          <div className="order-3 w-full basis-full md:order-none md:w-auto md:max-w-[min(100%,28rem)] md:flex-1 md:basis-auto">
            <NavbarModeToggle isSeller={modeToggle.isSeller} />
          </div>
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
        <div className="ml-auto flex shrink-0 items-center gap-4 md:ml-0">
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
                className={hjBtnPrimaryPill}
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
              className={hjBtnPrimaryPill}
            >
              {t('getStarted')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
