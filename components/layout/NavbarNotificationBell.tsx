'use client'

import type { NavbarNotificationCounts } from '@/lib/dashboard/data'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'

type Props = {
  counts: NavbarNotificationCounts
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

export function NavbarNotificationBell({ counts }: Props) {
  const t = useTranslations('nav.notifications')
  const panelId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const total =
    counts.unreadMessages + counts.pendingBuyer + counts.pendingSeller
  const badge =
    total > 99 ? '99+' : total > 0 ? String(total) : null

  useEffect(() => {
    if (!open) return
    function onDocMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const rowClass =
    'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low'

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className={cn(
          'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          open && 'bg-surface-container-low text-primary',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        aria-label={t('bellAria')}
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon className="h-5 w-5" />
        {badge ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-on-primary">
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="menu"
          className="absolute right-0 z-[60] mt-2 w-[min(100vw-2rem,280px)] rounded-2xl border border-outline-variant/40 bg-white py-2 shadow-lg"
        >
          <p className="border-b border-outline-variant/20 px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            {t('panelTitle')}
          </p>
          {total === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-on-surface-variant">{t('empty')}</p>
          ) : (
            <div className="flex flex-col gap-0.5 px-2 pt-2">
              {counts.unreadMessages > 0 ? (
                <Link
                  href={counts.messagesHref}
                  role="menuitem"
                  className={rowClass}
                  onClick={() => setOpen(false)}
                >
                  <span>{t('unreadMessages')}</span>
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-on-primary">
                    {counts.unreadMessages > 99 ? '99+' : counts.unreadMessages}
                  </span>
                </Link>
              ) : null}
              {counts.pendingBuyer > 0 ? (
                <Link
                  href={counts.buyerBookingsHref}
                  role="menuitem"
                  className={rowClass}
                  onClick={() => setOpen(false)}
                >
                  <span>{t('pendingBuyer')}</span>
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-on-primary">
                    {counts.pendingBuyer > 99 ? '99+' : counts.pendingBuyer}
                  </span>
                </Link>
              ) : null}
              {counts.pendingSeller > 0 ? (
                <Link
                  href={counts.sellerRequestsHref}
                  role="menuitem"
                  className={rowClass}
                  onClick={() => setOpen(false)}
                >
                  <span>{t('pendingSeller')}</span>
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-on-primary">
                    {counts.pendingSeller > 99 ? '99+' : counts.pendingSeller}
                  </span>
                </Link>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
