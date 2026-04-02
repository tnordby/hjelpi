import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import type { MessageThreadPreview } from '@/lib/dashboard/data'

type Props = {
  threads: MessageThreadPreview[]
  bookingsLinkHref: string
}

function formatShortDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('no-NO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export async function DashboardMessagesPanel({ threads, bookingsLinkHref }: Props) {
  const t = await getTranslations('dashboard.messagesPage')

  if (threads.length === 0) {
    return (
      <p className="rounded-2xl bg-surface-container-low/80 px-6 py-12 text-center text-on-surface-variant">
        {t('empty')}
      </p>
    )
  }

  return (
    <>
      <ul className="space-y-3">
        {threads.map((th) => (
          <li key={th.bookingId}>
            <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                    {t('threadLabel')}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-on-surface">{th.lastBody}</p>
                  <p className="mt-2 text-xs text-on-surface-variant">
                    {formatShortDate(th.lastAt)}
                  </p>
                </div>
                {th.unreadCount > 0 ? (
                  <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-on-primary">
                    {th.unreadCount}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-xs text-on-surface-variant/80">{t('threadFootnote')}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-center text-sm text-on-surface-variant">
        <Link href={bookingsLinkHref} className="font-bold text-primary hover:underline">
          {t('linkBookings')}
        </Link>
      </p>
    </>
  )
}
