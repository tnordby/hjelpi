import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { SellerPayoutInvoicesList } from '@/components/dashboard/SellerPayoutInvoicesList'
import { SellerStripeConnectCard } from '@/components/settings/SellerStripeConnectCard'
import { fetchSellerPayoutLines, loadDashboardUserContext } from '@/lib/dashboard/data'
import { syncProviderStripeOnboardedFromStripe } from '@/lib/stripe/refresh-connect-status'
import { getStripe, getStripeSecretKey } from '@/lib/stripe/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { withPageSeo } from '@/lib/seo/build-metadata'

export const dynamic = 'force-dynamic'

type Search = Promise<{ stripe_connect?: string }>

const bannerClass = 'rounded-2xl px-4 py-3 text-sm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return withPageSeo(
    { title: t('sellerPayoutsTitle'), description: t('sellerPayoutsDescription') },
    {
      locale,
      pathSegments: ['min-side', 'hjelper', 'utbetalinger'],
      indexable: false,
      keywords: ['utbetalinger', 'Stripe', 'Hjelpi'],
    },
  )
}

export default async function HjelperUtbetalingerPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams
  const stripeConnectQuery = sp.stripe_connect

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) return redirect({ href: '/logg-inn', locale })

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx?.providerId) {
    if (ctx?.role === 'seller') {
      return redirect({ href: '/bli-hjelper/fullfor-profil', locale })
    }
    return redirect({ href: '/min-side/hjelper', locale })
  }

  const [{ data: providerRow }, payoutLines] = await Promise.all([
    supabase.from('providers').select('stripe_account_id, stripe_onboarded').eq('id', ctx.providerId).maybeSingle(),
    fetchSellerPayoutLines(supabase, ctx.providerId),
  ])

  const t = await getTranslations('dashboard.payoutsPage')

  const stripeConfigured = Boolean(getStripeSecretKey())
  const stripe = getStripe()
  const hasStripeAccount =
    typeof providerRow?.stripe_account_id === 'string' && providerRow.stripe_account_id.length > 0

  let stripeOnboarded = Boolean(providerRow?.stripe_onboarded)
  let stripeDetailsSubmitted = false

  if (stripe && hasStripeAccount && providerRow?.stripe_account_id) {
    const sync = await syncProviderStripeOnboardedFromStripe(
      supabase,
      stripe,
      ctx.providerId,
      providerRow.stripe_account_id as string,
    )
    if (sync.retrieved) {
      stripeOnboarded = sync.ready
      stripeDetailsSubmitted = sync.detailsSubmitted
    }
  }

  const stripeAwaitingApproval = hasStripeAccount && stripeDetailsSubmitted && !stripeOnboarded

  const showStripeBanners =
    stripeConnectQuery === 'return' || stripeConnectQuery === 'refresh'

  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('title')}
        </h1>

        {showStripeBanners ? (
          <div className="flex flex-col gap-3">
            {stripeConnectQuery === 'return' ? (
              <p
                className={
                  stripeOnboarded
                    ? `${bannerClass} border border-primary/30 bg-primary/10 text-on-surface`
                    : stripeAwaitingApproval
                      ? `${bannerClass} border border-sky-200/80 bg-sky-50 text-sky-950`
                      : `${bannerClass} border border-outline-variant/30 bg-surface-container-low text-on-surface`
                }
                role="status"
              >
                {stripeOnboarded
                  ? t('stripeConnectReturnVerified')
                  : stripeAwaitingApproval
                    ? t('stripeConnectReturnAwaitingStripe')
                    : t('stripeConnectReturnPending')}
              </p>
            ) : null}
            {stripeConnectQuery === 'refresh' ? (
              <p className={`${bannerClass} border border-amber-200 bg-amber-50 text-amber-950`} role="status">
                {t('stripeConnectRefreshNotice')}
              </p>
            ) : null}
          </div>
        ) : null}

        <SellerStripeConnectCard
          stripeOnboarded={stripeOnboarded}
          hasStripeAccount={hasStripeAccount}
          stripeAwaitingApproval={stripeAwaitingApproval}
          stripeConfigured={stripeConfigured}
        />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">{t('invoices.sectionTitle')}</h2>
          <p className="mt-1 max-w-3xl text-sm text-on-surface-variant">{t('invoices.sectionSubtitle')}</p>
        </div>
        <SellerPayoutInvoicesList lines={payoutLines} />
      </section>
    </div>
  )
}
