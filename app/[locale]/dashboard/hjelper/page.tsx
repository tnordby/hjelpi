import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import {
  countPendingSellerRequests,
  fetchMessageThreads,
  fetchSellerBookings,
  fetchSellerEarningsSummary,
  loadDashboardUserContext,
} from '@/lib/dashboard/data'
import { formatOreToNok } from '@/lib/dashboard/money'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return {
    title: t('sellerDashboardTitle'),
    description: t('sellerDashboardDescription'),
  }
}

function formatShortDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('no-NO', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default async function DashboardHjelperOverviewPage() {
  const t = await getTranslations('dashboard.sellerOverview')
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx?.providerId) return null

  const sellerBookings = await fetchSellerBookings(supabase, ctx.providerId)
  const earnings = await fetchSellerEarningsSummary(supabase, ctx.providerId)
  const threads = await fetchMessageThreads(supabase, ctx.profileId)
  const unreadTotal = threads.reduce((s, x) => s + x.unreadCount, 0)
  const pendingSeller = countPendingSellerRequests(sellerBookings)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">
          {t('greeting', { name: ctx.fullName })}
        </h1>
        <p className="mt-2 text-on-surface-variant">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/hjelper/foresporsler"
          className="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
        >
          <p className="text-sm font-medium text-on-surface-variant">{t('cardRequests')}</p>
          <p className="mt-2 font-headline text-2xl font-extrabold text-primary">{pendingSeller}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{t('cardRequestsHint')}</p>
        </Link>

        <Link
          href="/dashboard/hjelper/inntekter"
          className="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
        >
          <p className="text-sm font-medium text-on-surface-variant">{t('cardEarnings')}</p>
          <p className="mt-2 font-headline text-2xl font-extrabold text-primary">
            {formatOreToNok(earnings.netOre)}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">{t('cardEarningsHint')}</p>
        </Link>

        <Link
          href="/dashboard/hjelper/meldinger"
          className="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
        >
          <p className="text-sm font-medium text-on-surface-variant">{t('cardMessages')}</p>
          <p className="mt-2 font-headline text-2xl font-extrabold text-primary">{threads.length}</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            {unreadTotal > 0
              ? t('cardMessagesUnread', { count: unreadTotal })
              : t('cardMessagesNoneUnread')}
          </p>
        </Link>

        <Link
          href="/dashboard/innstillinger"
          className="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
        >
          <p className="text-sm font-medium text-on-surface-variant">{t('cardSettings')}</p>
          <p className="mt-2 font-headline text-lg font-extrabold text-primary">{t('cardSettingsCta')}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{t('cardSettingsHint')}</p>
        </Link>
      </div>

      {threads.length > 0 ? (
        <section aria-labelledby="recent-messages">
          <h2 id="recent-messages" className="font-headline text-lg font-bold text-on-surface">
            {t('recentMessages')}
          </h2>
          <ul className="mt-4 space-y-3">
            {threads.slice(0, 4).map((th) => (
              <li key={th.bookingId}>
                <Link
                  href="/dashboard/hjelper/meldinger"
                  className="block rounded-xl bg-surface-container-low/80 px-4 py-3 ring-1 ring-outline-variant/15 transition-colors hover:bg-surface-container-low"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm text-on-surface">{th.lastBody}</p>
                    {th.unreadCount > 0 ? (
                      <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-on-primary">
                        {th.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">{formatShortDate(th.lastAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
