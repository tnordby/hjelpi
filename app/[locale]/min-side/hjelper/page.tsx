import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link, redirect } from '@/i18n/routing'
import { DashboardMessagesPanel } from '@/components/dashboard/DashboardMessagesPanel'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  countPendingSellerRequests,
  fetchMessageThreads,
  fetchSellerBookings,
  fetchSellerEarningsSummary,
  loadDashboardUserContext,
} from '@/lib/dashboard/data'
import { promoteBuyerToSeller } from '@/lib/seller/promote-buyer'
import { formatOreToNok } from '@/lib/dashboard/money'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { withPageSeo } from '@/lib/seo/build-metadata'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return withPageSeo(
    { title: t('sellerDashboardTitle'), description: t('sellerDashboardDescription') },
    {
      locale,
      pathSegments: ['min-side', 'hjelper'],
      indexable: false,
      keywords: ['Min side', 'hjelper', 'lokale tjenester', 'Hjelpi'],
    },
  )
}

export default async function HjelperDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) return redirect({ href: '/logg-inn', locale })

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx) return redirect({ href: '/min-konto', locale })

  if (!ctx.providerId) {
    if (ctx.role === 'seller') {
      return redirect({ href: '/bli-hjelper/fullfor-profil', locale })
    }
    if (ctx.role === 'buyer') {
      const promoted = await promoteBuyerToSeller(supabase, user.id)
      if (!promoted.ok) {
        return redirect({ href: '/min-konto', locale })
      }
      return redirect({ href: '/bli-hjelper/fullfor-profil', locale })
    }
    return redirect({ href: '/min-side/kunde', locale })
  }

  const t = await getTranslations('dashboard.sellerOverview')
  const [bookings, earnings, threads] = await Promise.all([
    fetchSellerBookings(supabase, ctx.providerId),
    fetchSellerEarningsSummary(supabase, ctx.providerId),
    fetchMessageThreads(supabase, ctx.profileId),
  ])

  const pendingSeller = countPendingSellerRequests(bookings)
  const unreadTotal = threads.reduce((acc, th) => acc + th.unreadCount, 0)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('greeting', { name: ctx.firstName.trim() ? ctx.firstName : 'der' })}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/min-side/hjelper/foresporsler"
          className="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
        >
          <p className="text-sm font-medium text-on-surface-variant">{t('cardRequests')}</p>
          <p className="mt-2 font-headline text-2xl font-extrabold text-primary">{pendingSeller}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{t('cardRequestsHint')}</p>
        </Link>

        <Link
          href="/min-side/hjelper/inntekter"
          className="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
        >
          <p className="text-sm font-medium text-on-surface-variant">{t('cardEarnings')}</p>
          <p className="mt-2 font-headline text-2xl font-extrabold text-primary">
            {formatOreToNok(earnings.netOre)}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">{t('cardEarningsHint')}</p>
        </Link>

        <Link
          href="/min-side/hjelper/meldinger"
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
          href="/min-side/innstillinger"
          className="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
        >
          <p className="text-sm font-medium text-on-surface-variant">{t('cardSettings')}</p>
          <p className="mt-2 font-headline text-lg font-extrabold text-primary">{t('cardSettingsCta')}</p>
        </Link>
      </div>

      <Link
        href="/min-side/hjelper/tjenester"
        className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-ambient ring-1 ring-primary/10 transition-shadow hover:ring-primary/25"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <MaterialIcon name="home_repair_service" className="text-2xl" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-headline font-bold text-on-surface">{t('serviceStripTitle')}</p>
          <p className="mt-1 text-sm text-on-surface-variant">{t('serviceStripBody')}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary">
          {t('serviceStripCta')}
          <MaterialIcon name="chevron_right" className="text-lg" />
        </span>
      </Link>

      {threads.length > 0 ? (
        <section aria-labelledby="recent-messages-seller">
          <h2 id="recent-messages-seller" className="font-headline text-lg font-bold text-on-surface">
            {t('recentMessages')}
          </h2>
          <div className="mt-4 max-w-2xl">
            <DashboardMessagesPanel
              threads={threads.slice(0, 4)}
              bookingsLinkHref="/min-side/hjelper/foresporsler"
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}
