import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link, redirect } from '@/i18n/routing'
import { DashboardMessagesPanel } from '@/components/dashboard/DashboardMessagesPanel'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  fetchBuyerBookings,
  fetchBuyerSpendSummary,
  fetchMessageThreads,
  loadDashboardUserContext,
} from '@/lib/dashboard/data'
import { formatOreToNok } from '@/lib/dashboard/money'
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
    { title: t('buyerDashboardTitle'), description: t('buyerDashboardDescription') },
    {
      locale,
      pathSegments: ['min-side', 'kunde'],
      indexable: false,
      keywords: ['Min side', 'kunde', 'lokale tjenester', 'Hjelpi'],
    },
  )
}

export default async function KundeDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) return redirect({ href: '/logg-inn', locale })

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx) return redirect({ href: '/min-konto', locale })

  const t = await getTranslations('dashboard.buyerOverview')
  const [bookings, buyerSpend, threads] = await Promise.all([
    fetchBuyerBookings(supabase, ctx.profileId),
    fetchBuyerSpendSummary(supabase, ctx.profileId),
    fetchMessageThreads(supabase, ctx.profileId),
  ])

  const pendingBuyer = bookings.filter((b) => b.status === 'pending').length
  const unreadTotal = threads.reduce((acc, th) => acc + th.unreadCount, 0)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('greeting', { name: ctx.fullName.trim() ? ctx.fullName : 'der' })}
        </h1>
        <p className="mt-2 text-on-surface-variant">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/min-side/kunde/bestillinger"
          className="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
        >
          <p className="text-sm font-medium text-on-surface-variant">{t('cardBookings')}</p>
          <p className="mt-2 font-headline text-2xl font-extrabold text-primary">{pendingBuyer}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{t('cardBookingsHint')}</p>
        </Link>

        <Link
          href="/min-side/kunde/bestillinger"
          className="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
        >
          <p className="text-sm font-medium text-on-surface-variant">{t('cardSpend')}</p>
          <p className="mt-2 font-headline text-2xl font-extrabold text-primary">
            {formatOreToNok(buyerSpend.totalPaidOre)}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">{t('cardSpendHint')}</p>
        </Link>

        <Link
          href="/min-side/kunde/meldinger"
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

      {threads.length > 0 ? (
        <section aria-labelledby="recent-messages">
          <h2 id="recent-messages" className="font-headline text-lg font-bold text-on-surface">
            {t('recentMessages')}
          </h2>
          <div className="mt-4 max-w-2xl">
            <DashboardMessagesPanel
              threads={threads.slice(0, 4)}
              bookingsLinkHref="/min-side/kunde/bestillinger"
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}
