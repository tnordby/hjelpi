import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { BookingsTable } from '@/components/dashboard/BookingsTable'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { fetchBuyerBookings, loadDashboardUserContext } from '@/lib/dashboard/data'
import { withPageSeo } from '@/lib/seo/build-metadata'

export const dynamic = 'force-dynamic'

type Search = Promise<{ forespurt?: string; betaling?: string }>

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return withPageSeo(
    { title: t('buyerBookingsTitle'), description: t('buyerBookingsDescription') },
    {
      locale,
      pathSegments: ['min-side', 'kunde', 'bestillinger'],
      indexable: false,
      keywords: ['bestillinger', 'lokale tjenester', 'Hjelpi'],
    },
  )
}

export default async function KundeBestillingerPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams
  const showRequestSent = sp.forespurt === '1'
  const paymentOk = sp.betaling === 'ok'
  const paymentCancelled = sp.betaling === 'avbrutt'

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) return redirect({ href: '/logg-inn', locale })

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx) return redirect({ href: '/min-konto', locale })

  const rows = await fetchBuyerBookings(supabase, ctx.profileId)
  const t = await getTranslations('dashboard.buyerBookingsPage')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-on-surface-variant">{t('subtitle')}</p>
      </div>
      {showRequestSent ? (
        <p
          className="rounded-2xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-on-surface"
          role="status"
        >
          {t('requestSent')}
        </p>
      ) : null}
      {paymentOk ? (
        <p
          className="rounded-2xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-on-surface"
          role="status"
        >
          {t('paymentSucceeded')}
        </p>
      ) : null}
      {paymentCancelled ? (
        <p
          className="rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm text-on-surface"
          role="status"
        >
          {t('paymentCancelled')}
        </p>
      ) : null}
      <BookingsTable rows={rows} variant="buyer" />
    </div>
  )
}
