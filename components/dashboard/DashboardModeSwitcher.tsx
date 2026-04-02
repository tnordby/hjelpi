'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { setDashboardActiveModeAction, type ModeActionState } from '@/lib/dashboard/mode-action'
import { cn } from '@/lib/utils'

type Props = {
  dbActiveMode: 'buyer' | 'seller'
  isSeller: boolean
}

function SubmitButton({
  mode,
  active,
  disabled,
  label,
  pending,
}: {
  mode: 'buyer' | 'seller'
  active: boolean
  disabled: boolean
  label: string
  pending: boolean
}) {
  return (
    <button
      type="submit"
      name="mode"
      value={mode}
      aria-pressed={active}
      disabled={disabled || pending}
      className={cn(
        'min-w-[7rem] flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-colors sm:flex-none',
        active
          ? 'bg-primary text-on-primary shadow-sm'
          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface',
        (disabled || pending) && !active && 'cursor-wait opacity-60',
      )}
    >
      {label}
    </button>
  )
}

function resolvedVisualMode(
  pathname: string,
  dbActive: 'buyer' | 'seller',
): 'buyer' | 'seller' {
  if (pathname.includes('/dashboard/hjelper')) return 'seller'
  if (pathname.includes('/dashboard/kunde')) return 'buyer'
  return dbActive
}

export function DashboardModeSwitcher({ dbActiveMode, isSeller }: Props) {
  const t = useTranslations('dashboard.mode')
  const pathname = usePathname()
  const visual = resolvedVisualMode(pathname, dbActiveMode)
  const [state, formAction, pending] = useActionState(
    setDashboardActiveModeAction,
    {} as ModeActionState,
  )

  return (
    <div className="rounded-2xl bg-surface-container-low/90 p-1.5 ring-1 ring-outline-variant/20">
      <p className="mb-2 px-2 pt-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        {t('label')}
      </p>
      {state?.error ? (
        <p className="mb-2 px-2 text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-stretch gap-2">
        <form action={formAction} className="flex flex-1 flex-wrap gap-2 sm:flex-none">
          <SubmitButton
            mode="buyer"
            active={visual === 'buyer'}
            disabled={false}
            label={t('buyer')}
            pending={pending}
          />
          {isSeller ? (
            <SubmitButton
              mode="seller"
              active={visual === 'seller'}
              disabled={false}
              label={t('seller')}
              pending={pending}
            />
          ) : null}
        </form>
        {!isSeller ? (
          <Link
            href="/bli-hjelper"
            className="flex min-w-[7rem] flex-1 items-center justify-center rounded-full bg-surface-container-high px-4 py-2.5 text-center text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface sm:flex-none"
          >
            {t('sellerCta')}
          </Link>
        ) : null}
      </div>
      {!isSeller ? (
        <p className="mt-2 px-2 pb-1 text-xs text-on-surface-variant">{t('sellerUpsell')}</p>
      ) : null}
    </div>
  )
}
