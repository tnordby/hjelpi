import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link, redirect } from '@/i18n/routing'
import { MinSideProfileSettings } from '@/components/settings/MinSideProfileSettings'
import { SettingsBankIdBuyerHint } from '@/components/settings/SettingsBankIdBuyerHint'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { withPageSeo } from '@/lib/seo/build-metadata'

export const dynamic = 'force-dynamic'

type SettingsSearch = Promise<{ stripe_connect?: string; bankid?: string; bankid_reason?: string }>

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
  const localeEarly = await getLocale()
  if (sp.stripe_connect === 'return' || sp.stripe_connect === 'refresh') {
    return redirect({
      href: `/min-side/hjelper/utbetalinger?stripe_connect=${sp.stripe_connect}`,
      locale: localeEarly,
    })
  }

  if (typeof sp.bankid === 'string' && sp.bankid.length > 0) {
    const q = new URLSearchParams()
    q.set('bankid', sp.bankid)
    if (typeof sp.bankid_reason === 'string' && sp.bankid_reason.length > 0) {
      q.set('bankid_reason', sp.bankid_reason)
    }
    return redirect({ href: `/min-side/hjelper/bankid?${q.toString()}`, locale: localeEarly })
  }

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
    .select('id, location_id')
    .eq('profile_id', ctx.profileId)
    .maybeSingle()

  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('id, name, fylke, city_name')
    .order('name', { ascending: true })

  const locationOptions =
    locations?.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      fylke: typeof row.fylke === 'string' ? row.fylke : '',
      cityName:
        typeof row.city_name === 'string' && row.city_name.trim().length > 0
          ? row.city_name.trim()
          : String(row.name),
    })) ?? []

  const locationsLoadError = Boolean(locationsError)

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

  const email = user.email ?? ''
  const needsEmailConfirm = !user.email_confirmed_at && email.length > 0

  const linkClass = 'text-sm font-medium text-primary underline-offset-2 hover:underline'

  return (
    <div className="space-y-10 pb-4">
      <header>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('title')}
        </h1>
      </header>

      {!isSellerWithProvider ? <SettingsBankIdBuyerHint locale={locale} /> : null}

      <MinSideProfileSettings
        firstName={typeof profileRow?.first_name === 'string' ? profileRow.first_name : ''}
        lastName={typeof profileRow?.last_name === 'string' ? profileRow.last_name : ''}
        email={email}
        avatarUrl={typeof profileRow?.avatar_url === 'string' && profileRow.avatar_url.length > 0 ? profileRow.avatar_url : null}
        locationId={locationIdForForm}
        hasProvider={hasProvider}
        needsEmailConfirm={needsEmailConfirm}
        locations={locationOptions}
        locationsLoadError={locationsLoadError}
      />

      {!ctx.isSeller ? (
        <nav
          className="flex flex-wrap gap-x-5 gap-y-2 border-t border-outline-variant/20 pt-6"
          aria-label={t('footerNavAria')}
        >
          <Link href="/bli-hjelper" className={linkClass}>
            {t('linkBecomeSeller')}
          </Link>
        </nav>
      ) : null}
    </div>
  )
}
