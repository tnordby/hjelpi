import { getTranslations } from 'next-intl/server'
import type { BookingRow } from '@/lib/dashboard/data'
import { formatOreToNok } from '@/lib/dashboard/money'
import { BookingStatusBadge } from '@/components/dashboard/BookingStatusBadge'

const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'disputed',
] as const

function statusLabel(t: (key: string) => string, status: string) {
  if (BOOKING_STATUSES.includes(status as (typeof BOOKING_STATUSES)[number])) {
    return t(`status.${status}`)
  }
  return status
}

type Props = {
  rows: BookingRow[]
  variant: 'buyer' | 'seller'
}

function formatDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export async function BookingsTable({ rows, variant }: Props) {
  const t = await getTranslations('dashboard.requests')
  const locale = 'no-NO'

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl bg-surface-container-low/80 px-6 py-12 text-center text-on-surface-variant">
        {t('empty')}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-outline-variant/20">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-outline-variant/30 bg-surface-container-low/50">
          <tr>
            <th className="px-4 py-3 font-semibold text-on-surface">{t('colWhen')}</th>
            <th className="px-4 py-3 font-semibold text-on-surface">{t('colService')}</th>
            {variant === 'seller' ? (
              <th className="px-4 py-3 font-semibold text-on-surface">{t('colCustomer')}</th>
            ) : null}
            <th className="px-4 py-3 font-semibold text-on-surface">{t('colAmount')}</th>
            <th className="px-4 py-3 font-semibold text-on-surface">{t('colStatus')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {rows.map((row) => (
            <tr key={row.id} className="bg-surface-container-lowest/80">
              <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">
                {formatDate(row.scheduled_at, locale)}
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 font-medium text-on-surface">
                {row.serviceTitle ?? '—'}
              </td>
              {variant === 'seller' ? (
                <td className="px-4 py-3 text-on-surface-variant">
                  {row.buyerName ?? t('unknownCustomer')}
                </td>
              ) : null}
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-on-surface">
                {formatOreToNok(row.total_amount_ore)}
              </td>
              <td className="px-4 py-3">
                <BookingStatusBadge
                  status={row.status}
                  label={statusLabel(t, row.status)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
