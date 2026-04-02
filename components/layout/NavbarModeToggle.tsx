'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { switchDashboardModeAction } from '@/lib/dashboard/mode-action'
import { cn } from '@/lib/utils'

type Props = {
  isSeller: boolean
}

function IconPersonAdd({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  )
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

export function NavbarModeToggle({ isSeller }: Props) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const onHelperPath =
    pathname.includes('/min-side/hjelper') ||
    (!isSeller && pathname.includes('/bli-hjelper'))
  const buyerActive = !onHelperPath

  const segmentClass = (active: boolean, role: 'buyer' | 'seller') =>
    cn(
      'flex min-h-[2.5rem] w-full min-w-0 cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 py-2.5 text-sm font-semibold tracking-tight transition-all sm:gap-3 sm:py-2.5',
      role === 'buyer'
        ? 'px-5 pr-6 pl-5 sm:px-6 sm:pl-5 sm:pr-8'
        : 'px-4 sm:px-5',
      active
        ? 'bg-white text-on-surface shadow-sm ring-1 ring-on-surface/[0.06]'
        : 'bg-transparent text-on-surface-variant hover:text-on-surface',
    )

  const iconClass = (active: boolean) =>
    cn('h-4 w-4 shrink-0', active ? 'text-primary' : 'text-on-surface-variant')

  return (
    <div
      className="hidden w-full max-w-[min(100%,28rem)] rounded-full bg-on-surface/[0.06] p-1.5 ring-1 ring-on-surface/[0.04] md:flex"
      role="group"
      aria-label={t('roleToggleAria')}
    >
      <form action={switchDashboardModeAction} className="min-w-0 flex-[1.14]">
        <input type="hidden" name="mode" value="buyer" />
        <button
          type="submit"
          className={segmentClass(buyerActive, 'buyer')}
          aria-current={buyerActive ? 'page' : undefined}
        >
          <IconPersonAdd className={iconClass(buyerActive)} />
          <span className="whitespace-nowrap">{t('orderHelp')}</span>
        </button>
      </form>
      {isSeller ? (
        <form action={switchDashboardModeAction} className="min-w-0 flex-[0.86]">
          <input type="hidden" name="mode" value="seller" />
          <button
            type="submit"
            className={segmentClass(onHelperPath, 'seller')}
            aria-current={onHelperPath ? 'page' : undefined}
          >
            <IconBriefcase className={iconClass(onHelperPath)} />
            <span className="whitespace-nowrap">{t('beHelperSegment')}</span>
          </button>
        </form>
      ) : (
        <Link
          href="/min-side/hjelper"
          className={cn('min-w-0 flex-[0.86]', segmentClass(onHelperPath, 'seller'))}
          aria-current={onHelperPath ? 'page' : undefined}
        >
          <IconBriefcase className={iconClass(onHelperPath)} />
          <span className="whitespace-nowrap">{t('beHelperSegment')}</span>
        </Link>
      )}
    </div>
  )
}
