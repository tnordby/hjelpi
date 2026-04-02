'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from '@/i18n/routing'
import { createBookingRequestAction, type CreateBookingActionState } from '@/lib/bookings/actions'
import { computeBaseAmountOre } from '@/lib/bookings/compute-base'
import { formatOreToNok } from '@/lib/dashboard/money'
import type { PricingType } from '@/lib/provider-services/types'
import { platformFeesFromBaseOre } from '@/lib/stripe/fees'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import posthog from 'posthog-js'

const inputClass =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none ring-1 ring-outline-variant/20 transition-shadow focus:ring-2 focus:ring-primary/25'
const labelClass = 'mb-1.5 block text-sm font-medium text-on-surface'
const btnPrimary =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-50 sm:w-auto'

const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180, 210, 240, 300, 360, 480, 600, 720, 960]

type Props = {
  providerId: string
  serviceId: string
  pricingType: PricingType
  basePriceOre: number | null
  loginNextPath: string
  isAuthenticated: boolean
  isOwnService: boolean
}

export function ServiceBookingPanel({
  providerId,
  serviceId,
  pricingType,
  basePriceOre,
  loginNextPath,
  isAuthenticated,
  isOwnService,
}: Props) {
  const t = useTranslations('publicService')
  const [error, setError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)
  const [scheduledLocal, setScheduledLocal] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number>(120)
  const [buyerMessage, setBuyerMessage] = useState('')

  const preview = useMemo(() => {
    const base =
      pricingType === 'hourly'
        ? computeBaseAmountOre(pricingType, basePriceOre, durationMinutes)
        : pricingType === 'fixed'
          ? computeBaseAmountOre(pricingType, basePriceOre, null)
          : computeBaseAmountOre('quote', null, null)
    if (base == null && pricingType !== 'quote') return null
    const b = base ?? 0
    return platformFeesFromBaseOre(b)
  }, [pricingType, basePriceOre, durationMinutes])

  const minLocal = useMemo(() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  }, [])

  const loginHref = `/logg-inn?next=${encodeURIComponent(loginNextPath)}`

  if (isOwnService) {
    return (
      <div className="mt-10 border-t border-outline-variant/20 pt-8">
        <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          {t('ownServiceHint')}
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-10 flex flex-col gap-3 border-t border-outline-variant/20 pt-8 sm:flex-row sm:flex-wrap">
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
    const localRaw = fd.get('scheduled_at_local')
    fd.delete('scheduled_at_local')
    if (typeof localRaw === 'string' && localRaw.length > 0) {
      const iso = new Date(localRaw).toISOString()
      fd.set('scheduled_at', iso)
    }
    fd.set('provider_id', providerId)
    fd.set('provider_service_id', serviceId)
    fd.set('pricing_type', pricingType)

    const result: CreateBookingActionState | void = await createBookingRequestAction(undefined, fd)
    setSubmitting(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    posthog.capture('booking_request_submitted', {
      provider_id: providerId,
      service_id: serviceId,
      pricing_type: pricingType,
    })
  }

  return (
    <div className="mt-10 border-t border-outline-variant/20 pt-8">
      <h2 className="font-headline text-lg font-bold text-on-surface">{t('bookingTitle')}</h2>
      <p className="mt-1 text-sm text-on-surface-variant">{t('bookingSubtitle')}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        {error ? (
          <p className="rounded-xl bg-error-container/80 px-4 py-3 text-sm text-on-error-container" role="alert">
            {error}
          </p>
        ) : null}

        <div>
          <label htmlFor="scheduled_at_local" className={labelClass}>
            {t('fieldWhen')}
          </label>
          <input
            id="scheduled_at_local"
            name="scheduled_at_local"
            type="datetime-local"
            required
            min={minLocal}
            value={scheduledLocal}
            onChange={(e) => setScheduledLocal(e.target.value)}
            className={inputClass}
          />
        </div>

        {pricingType === 'hourly' ? (
          <div>
            <label htmlFor="duration_minutes" className={labelClass}>
              {t('fieldDuration')}
            </label>
            <select
              id="duration_minutes"
              name="duration_minutes"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className={inputClass}
            >
              {DURATION_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {t('durationOption', { minutes: m })}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {pricingType === 'quote' ? (
          <div>
            <label htmlFor="buyer_message" className={labelClass}>
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
              className={inputClass}
            />
            <p className="mt-1 text-xs text-on-surface-variant">{t('fieldBriefHint')}</p>
          </div>
        ) : null}

        {preview && pricingType !== 'quote' ? (
          <div className="rounded-2xl bg-primary/5 px-4 py-3 text-sm ring-1 ring-primary/15">
            <p className="font-medium text-on-surface">{t('summaryTitle')}</p>
            <p className="mt-1 text-on-surface-variant">
              {t('summaryBase', { amount: formatOreToNok(preview.base_amount_ore) })}
            </p>
            <p className="text-on-surface-variant">
              {t('summaryBuyerFee', { amount: formatOreToNok(preview.buyer_fee_ore) })}
            </p>
            <p className="mt-2 font-headline font-bold text-primary">
              {t('summaryTotal', { amount: formatOreToNok(preview.total_amount_ore) })}
            </p>
            <p className="mt-2 text-xs text-on-surface-variant">{t('summaryPaymentNote')}</p>
          </div>
        ) : null}

        {pricingType === 'quote' ? (
          <p className="text-sm text-on-surface-variant">{t('quoteFeeNote')}</p>
        ) : null}

        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting ? t('submitting') : t('submitRequest')}
        </button>
      </form>
    </div>
  )
}
