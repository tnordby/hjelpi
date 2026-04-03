import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link, redirect } from '@/i18n/routing'
import { ProviderServicesPanel } from '@/components/seller/ProviderServicesPanel'
import { hjBtnPrimary } from '@/lib/button-classes'
import { cn } from '@/lib/utils'
import { getStripeSecretKey } from '@/lib/stripe/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import {
  fetchProviderServicesForSeller,
  fetchTaxonomySubcategories,
} from '@/lib/provider-services/data'
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
    { title: t('sellerServicesTitle'), description: t('sellerServicesDescription') },
    {
      locale,
      pathSegments: ['min-side', 'hjelper', 'tjenester'],
      indexable: false,
      keywords: ['mine tjenester', 'lokale tjenester', 'Hjelpi'],
    },
  )
}

export default async function HjelperTjenesterPage() {
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

  const { data: payoutRow } = await supabase
    .from('providers')
    .select('stripe_onboarded')
    .eq('id', ctx.providerId)
    .maybeSingle()

  const [services, taxonomy] = await Promise.all([
    fetchProviderServicesForSeller(supabase, ctx.providerId),
    fetchTaxonomySubcategories(supabase),
  ])

  const t = await getTranslations('dashboard.sellerServicesPage')
  const stripeReady = Boolean(payoutRow?.stripe_onboarded)
  const stripeConfigured = Boolean(getStripeSecretKey())
  const showStripeBanner = stripeConfigured && !stripeReady
  const canManageServices = !stripeConfigured || stripeReady

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('title')}
        </h1>
      </div>

      {showStripeBanner ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 ring-1 ring-primary/10">
          <p className="font-headline font-bold text-on-surface">{t('stripeBannerTitle')}</p>
          <p className="mt-2 text-sm text-on-surface-variant">{t('stripeBannerBody')}</p>
          <Link
            href="/min-side/hjelper/utbetalinger"
            className={cn(hjBtnPrimary, 'mt-4 inline-flex')}
          >
            {t('stripeBannerCta')}
          </Link>
        </div>
      ) : null}

      <ProviderServicesPanel
        providerId={ctx.providerId}
        services={services}
        taxonomy={taxonomy}
        canManageServices={canManageServices}
      />
    </div>
  )
}
