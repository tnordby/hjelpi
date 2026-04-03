'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from '@/i18n/routing'
import { createBookingRequestAction, type CreateBookingActionState } from '@/lib/bookings/actions'
import type { PricingType } from '@/lib/provider-services/types'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'
import posthog from 'posthog-js'

const btnPrimary =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-on-primary shadow-sm transition-[opacity,transform] hover:opacity-95 active:scale-[0.99] disabled:opacity-50'

const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180, 210, 240, 300, 360, 480, 600, 720, 960]

function localYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function localHm(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
}

type Props = {
  providerId: string
  serviceId: string
  pricingType: PricingType
  basePriceOre: number | null
  loginNextPath: string
  isAuthenticated: boolean
  isOwnService: boolean
  /** Sidebar card: no top border, tighter heading. */
  variant?: 'default' | 'embedded'
}

export function ServiceBookingPanel({
  providerId,
  serviceId,
  pricingType,
  basePriceOre: _basePriceOre,
  loginNextPath,
  isAuthenticated,
  isOwnService,
  variant = 'default',
}: Props) {
  const t = useTranslations('publicService')
  const embedded = variant === 'embedded'
  const [error, setError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)
  const [dateStr, setDateStr] = useState('')
  const [timeStr, setTimeStr] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number>(120)
  const [buyerMessage, setBuyerMessage] = useState('')

  const todayStr = useMemo(() => localYmd(new Date()), [])

  const minTimeStr = useMemo(() => {
    if (dateStr !== todayStr) return undefined
    return localHm(new Date())
  }, [dateStr, todayStr])

  const loginHref = `/logg-inn?next=${encodeURIComponent(loginNextPath)}`

  const fieldLabelClass =
    'text-[0.65rem] font-bold uppercase tracking-[0.06em] text-on-surface-variant'

  const nativeInputClass =
    'mt-1.5 block w-full cursor-pointer border-0 bg-transparent p-0 font-body text-[0.9375rem] font-semibold text-on-surface outline-none focus:ring-0 [color-scheme:light] placeholder:text-on-surface-variant/50'

  if (isOwnService) {
    return (
      <div
        className={cn(
          embedded ? 'mt-6' : 'mt-10 border-t border-outline-variant/20 pt-8',
        )}
      >
        <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          {t('ownServiceHint')}
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          'flex flex-col gap-3 sm:flex-row sm:flex-wrap',
          embedded ? 'mt-6' : 'mt-10 border-t border-outline-variant/20 pt-8',
        )}
      >
        <Link href={loginHref} className={btnPrimary}>
          <MaterialIcon name="calendar_month" className="text-xl" />
          {t('ctaBook')}
        </Link>
        <p className="self-center text-sm text-on-surface-variant">{t('ctaHintLogin')}</p>
      </div>
    )
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setSubmitting(true)
    const form = e.currentTarget
    const fd = new FormData(form)

    const combined =
      dateStr && timeStr ? `${dateStr}T${timeStr}` : ''
    if (!combined) {
      setError(t('scheduleIncomplete'))
      setSubmitting(false)
      return
    }

    fd.set('scheduled_at', new Date(combined).toISOString())
    fd.set('provider_id', providerId)
    fd.set('provider_service_id', serviceId)
    fd.set('pricing_type', pricingType)

    const result: CreateBookingActionState | void = await createBookingRequestAction(undefined, fd)
    setSubmitting(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    if (result?.checkoutUrl) {
      posthog.capture('booking_checkout_started', {
        provider_id: providerId,
        service_id: serviceId,
        pricing_type: pricingType,
      })
      window.location.assign(result.checkoutUrl)
      return
    }
    posthog.capture('booking_request_submitted', {
      provider_id: providerId,
      service_id: serviceId,
      pricing_type: pricingType,
    })
  }

  return (
    <div className={cn(embedded ? 'mt-6' : 'mt-10 border-t border-outline-variant/20 pt-8')}>
      <h2
        className={cn(
          'font-headline font-bold text-on-surface',
          embedded ? 'text-base' : 'text-lg',
        )}
      >
        {t('bookingTitle')}
      </h2>
      <p className={cn('text-on-surface-variant', embedded ? 'mt-1 text-xs leading-relaxed' : 'mt-1 text-sm')}>
        {t('bookingSubtitle')}
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-5">
        {error ? (
          <p className="rounded-xl bg-error-container/80 px-4 py-3 text-sm text-on-error-container" role="alert">
            {error}
          </p>
        ) : null}

        {/* Airbnb-style split schedule + duration */}
        <div
          className={cn(
            'overflow-hidden rounded-xl border border-outline-variant/40 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
            'ring-1 ring-black/[0.04]',
          )}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-outline-variant/30">
            <label className="block cursor-pointer px-4 py-3.5 transition-colors hover:bg-on-surface/[0.02] sm:py-4">
              <span className={fieldLabelClass}>{t('fieldDate')}</span>
              <input
                type="date"
                required
                min={todayStr}
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className={nativeInputClass}
              />
            </label>
            <label className="block cursor-pointer border-t border-outline-variant/30 px-4 py-3.5 transition-colors hover:bg-on-surface/[0.02] sm:border-t-0 sm:py-4">
              <span className={fieldLabelClass}>{t('fieldTime')}</span>
              <input
                type="time"
                required
                min={minTimeStr}
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className={nativeInputClass}
              />
            </label>
          </div>

          {pricingType === 'hourly' ? (
            <div className="border-t border-outline-variant/30 px-4 py-3.5 hover:bg-on-surface/[0.02] sm:py-4">
              <label htmlFor="duration_minutes" className="block cursor-pointer">
                <span className={fieldLabelClass}>{t('fieldDuration')}</span>
                <div className="relative mt-1.5">
                  <select
                    id="duration_minutes"
                    name="duration_minutes"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className={cn(nativeInputClass, 'w-full appearance-none pr-9 font-semibold')}
                  >
                    {DURATION_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {t('durationOption', { minutes: m })}
                      </option>
                    ))}
                  </select>
                  <MaterialIcon
                    name="expand_more"
                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    aria-hidden
                  />
                </div>
              </label>
            </div>
          ) : null}
        </div>

        {pricingType === 'quote' ? (
          <div>
            <label htmlFor="buyer_message" className="mb-1.5 block text-sm font-medium text-on-surface">
              {t('fieldBrief')}
            </label>
            <textarea
              id="buyer_message"
              name="buyer_message"
              required
              rows={4}
              maxLength={4000}
              value={buyerMessage}
              onChange={(e) => setBuyerMessage(e.target.value)}
              placeholder={t('fieldBriefPlaceholder')}
              className="w-full rounded-xl border border-outline-variant/35 bg-surface-container-low/40 px-4 py-3 text-on-surface outline-none ring-0 transition-shadow placeholder:text-on-surface-variant/50 focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-on-surface-variant">{t('fieldBriefHint')}</p>
          </div>
        ) : null}

        {pricingType === 'quote' ? (
          <p className="text-sm text-on-surface-variant">{t('quoteFeeNote')}</p>
        ) : null}

        <div className="space-y-3 pt-1">
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting
              ? t('submitting')
              : pricingType === 'quote'
                ? t('submitRequest')
                : t('submitPay')}
          </button>
          {pricingType !== 'quote' ? (
            <p className="text-left text-xs leading-relaxed text-on-surface-variant">{t('notChargedYet')}</p>
          ) : null}
        </div>
      </form>
    </div>
  )
}
