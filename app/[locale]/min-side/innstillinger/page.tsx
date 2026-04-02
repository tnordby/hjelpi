import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link, redirect } from '@/i18n/routing'
import { SignOutForm } from '@/components/auth/SignOutForm'
import { MinSideProfileSettings } from '@/components/settings/MinSideProfileSettings'
import { SellerStripeConnectCard } from '@/components/settings/SellerStripeConnectCard'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { getStripeSecretKey } from '@/lib/stripe/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { withPageSeo } from '@/lib/seo/build-metadata'

export const dynamic = 'force-dynamic'

type SettingsSearch = Promise<{ stripe_connect?: string }>

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return withPageSeo(
    { title: t('settingsTitle'), description: t('settingsDescription') },
    {
      locale,
      pathSegments: ['min-side', 'innstillinger'],
      indexable: false,
      keywords: ['innstillinger', 'Min side', 'Hjelpi'],
    },
  )
}

export default async function DashboardInnstillingerPage({
  searchParams,
}: {
  searchParams: SettingsSearch
}) {
  const sp = await searchParams
  const stripeConnectQuery = sp.stripe_connect

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) return redirect({ href: '/logg-inn', locale })

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx) return redirect({ href: '/min-konto', locale })

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url, home_location_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: providerRow } = await supabase
    .from('providers')
    .select('id, location_id, stripe_account_id, stripe_onboarded')
    .eq('profile_id', ctx.profileId)
    .maybeSingle()

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')
    .order('name', { ascending: true })

  const locationOptions =
    locations?.map((row) => ({ id: row.id as string, name: row.name as string })) ?? []

  const hasProvider = Boolean(providerRow)
  const isSellerWithProvider = profileRow?.role === 'seller' && hasProvider
  const locationIdForForm = isSellerWithProvider
    ? providerRow?.location_id
      ? String(providerRow.location_id)
      : ''
    : profileRow?.home_location_id
      ? String(profileRow.home_location_id)
      : ''

  const t = await getTranslations('dashboard.settingsPage')
  const tNav = await getTranslations('nav')

  const email = user.email ?? ''
  const needsEmailConfirm = !user.email_confirmed_at && email.length > 0

  const stripeConfigured = Boolean(getStripeSecretKey())
  const stripeOnboarded = Boolean(providerRow?.stripe_onboarded)
  const hasStripeAccount =
    typeof providerRow?.stripe_account_id === 'string' && providerRow.stripe_account_id.length > 0

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-on-surface-variant">{t('subtitle')}</p>
      </div>

      {stripeConnectQuery === 'return' ? (
        <p className="rounded-2xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-on-surface" role="status">
          {t('stripeReturnNotice')}
        </p>
      ) : null}
      {stripeConnectQuery === 'refresh' ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
          {t('stripeRefreshNotice')}
        </p>
      ) : null}

      <MinSideProfileSettings
        firstName={typeof profileRow?.first_name === 'string' ? profileRow.first_name : ''}
        lastName={typeof profileRow?.last_name === 'string' ? profileRow.last_name : ''}
        email={email}
        avatarUrl={typeof profileRow?.avatar_url === 'string' && profileRow.avatar_url.length > 0 ? profileRow.avatar_url : null}
        locationId={locationIdForForm}
        hasProvider={hasProvider}
        needsEmailConfirm={needsEmailConfirm}
        locations={locationOptions}
      />

      {isSellerWithProvider ? (
        <SellerStripeConnectCard
          stripeOnboarded={stripeOnboarded}
          hasStripeAccount={hasStripeAccount}
          stripeConfigured={stripeConfigured}
        />
      ) : null}

      <ul className="space-y-4">
        <li>
          <Link
            href="/min-konto"
            className="block rounded-2xl bg-surface-container-lowest p-5 ring-1 ring-outline-variant/15 transition-colors hover:ring-primary/30"
          >
            <p className="font-semibold text-on-surface">{t('linkAccount')}</p>
            <p className="mt-1 text-sm text-on-surface-variant">{t('linkAccountDesc')}</p>
          </Link>
        </li>
        <li>
          <Link
            href="/glemt-passord"
            className="block rounded-2xl bg-surface-container-lowest p-5 ring-1 ring-outline-variant/15 transition-colors hover:ring-primary/30"
          >
            <p className="font-semibold text-on-surface">{t('linkPassword')}</p>
            <p className="mt-1 text-sm text-on-surface-variant">{t('linkPasswordDesc')}</p>
          </Link>
        </li>
        {!ctx.isSeller ? (
          <li>
            <Link
              href="/bli-hjelper"
              className="block rounded-2xl bg-surface-container-lowest p-5 ring-1 ring-outline-variant/15 transition-colors hover:ring-primary/30"
            >
              <p className="font-semibold text-on-surface">{t('linkBecomeSeller')}</p>
              <p className="mt-1 text-sm text-on-surface-variant">{t('linkBecomeSellerDesc')}</p>
            </Link>
          </li>
        ) : null}
      </ul>

      <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-low/50 p-6">
        <p className="font-semibold text-on-surface">{t('comingTitle')}</p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-on-surface-variant">
          <li>{t('comingItem1')}</li>
          <li>{t('comingItem2')}</li>
          <li>{t('comingItem3')}</li>
          <li>{t('comingItem4')}</li>
        </ul>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 ring-1 ring-outline-variant/15">
        <p className="font-semibold text-on-surface">{t('sessionTitle')}</p>
        <p className="mt-1 text-sm text-on-surface-variant">{t('sessionHint')}</p>
        <div className="mt-4">
          <SignOutForm label={tNav('userMenuSignOut')} />
        </div>
      </div>
    </div>
  )
}
