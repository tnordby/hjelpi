import { getTranslations } from 'next-intl/server'
import type { SellerPayoutLine } from '@/lib/dashboard/data'
import { formatOreToNok } from '@/lib/dashboard/money'
import { isSellerPayoutOsloCalendarEligible } from '@/lib/stripe/payout-eligible'
import { BookingStatusBadge } from '@/components/dashboard/BookingStatusBadge'

type Props = {
  lines: SellerPayoutLine[]
}

const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'disputed',
] as const

function formatDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('no-NO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function formatDateOnly(iso: string) {
  try {
    return new Intl.DateTimeFormat('no-NO', { dateStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function shortBookingRef(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

function stripePiShort(id: string) {
  if (id.length <= 16) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

function stripeTrShort(id: string) {
  if (id.length <= 16) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

function statusLabel(
  tReq: (key: string) => string,
  status: string,
): string {
  if (BOOKING_STATUSES.includes(status as (typeof BOOKING_STATUSES)[number])) {
    return tReq(`status.${status}`)
  }
  return status
}

export async function SellerPayoutInvoicesList({ lines }: Props) {
  const t = await getTranslations('dashboard.payoutsPage.invoices')
  const tReq = await getTranslations('dashboard.requests')

  if (lines.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low/40 px-6 py-14 text-center text-on-surface-variant">
        {t('empty')}
      </p>
    )
  }

  return (
    <ul className="space-y-6">
      {lines.map((line) => (
        <li
          key={line.id}
          className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-white shadow-sm ring-1 ring-outline-variant/10"
        >
          <div className="grid gap-3 border-b border-outline-variant/15 bg-surface-container-low/40 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-end sm:gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                {t('refLabel')}
              </p>
              <p className="font-mono text-sm font-bold text-on-surface">{shortBookingRef(line.id)}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                {t('recordedAt')}
              </p>
              <p className="text-sm text-on-surface">{formatDateTime(line.createdAt)}</p>
            </div>
            <div className="sm:justify-self-end">
              <BookingStatusBadge status={line.status} label={statusLabel(tReq, line.status)} />
            </div>
          </div>

          <div className="space-y-3 px-5 py-4 text-sm">
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-x-4">
              <span className="text-on-surface-variant">{t('colService')}</span>
              <span className="font-medium text-on-surface">{line.serviceTitle ?? '—'}</span>
            </div>
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-x-4">
              <span className="text-on-surface-variant">{t('colCustomer')}</span>
              <span className="text-on-surface">{line.buyerName ?? t('unknownCustomer')}</span>
            </div>
            <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-x-4">
              <span className="text-on-surface-variant">{t('colAppointment')}</span>
              <span className="text-on-surface">{formatDateOnly(line.scheduledAt)}</span>
            </div>
          </div>

          <div className="border-t border-outline-variant/15 bg-surface-container-lowest/80 px-5 py-4">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-outline-variant/15">
                <tr>
                  <td className="py-2 pr-4 text-on-surface-variant">{t('rowCustomerPaid')}</td>
                  <td className="py-2 text-right font-medium tabular-nums text-on-surface">
                    {formatOreToNok(line.totalAmountOre)}
                  </td>
                </tr>
                {line.buyerFeeOre > 0 || line.totalAmountOre !== line.baseAmountOre ? (
                  <tr>
                    <td className="py-2 pr-4 text-on-surface-variant">{t('rowYourPrice')}</td>
                    <td className="py-2 text-right tabular-nums text-on-surface">
                      {formatOreToNok(line.baseAmountOre)}
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td className="py-2 pr-4 text-on-surface-variant">{t('rowPlatformFee')}</td>
                  <td className="py-2 text-right tabular-nums text-on-surface">
                    −{formatOreToNok(line.sellerFeeOre)}
                  </td>
                </tr>
                <tr className="font-semibold">
                  <td className="py-3 pr-4 text-on-surface">{t('rowNetToYou')}</td>
                  <td className="py-3 text-right text-base tabular-nums text-primary">
                    {formatOreToNok(line.netOre)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 space-y-2 border-t border-outline-variant/10 pt-3 text-xs">
              <p className="text-on-surface-variant">
                <span className="font-sans font-medium text-on-surface-variant">{t('payoutStatusLabel')}</span>
                <span className="mt-1 block text-on-surface">
                  {line.payoutReleased && line.sellerPayoutAt && line.stripeConnectTransferId
                    ? t('payoutTransferred', {
                        date: formatDateTime(line.sellerPayoutAt),
                        ref: stripeTrShort(line.stripeConnectTransferId),
                      })
                    : !isSellerPayoutOsloCalendarEligible(line.scheduledAt)
                      ? t('payoutWaitingServiceDay')
                      : t('payoutQueuedStripe')}
                </span>
              </p>
              <p className="font-mono text-on-surface-variant">
                <span className="font-sans font-medium">{t('paymentRef')} </span>
                {stripePiShort(line.stripePaymentIntentId)}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
