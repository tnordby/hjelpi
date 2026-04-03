import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { BankIdFlowBanners } from '@/components/settings/BankIdFlowBanners'
import { BankIdVerificationCard } from '@/components/settings/BankIdVerificationCard'
import { SettingsBankIdBuyerHint } from '@/components/settings/SettingsBankIdBuyerHint'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { getSignicatOidcMissingEnvNames, isSignicatOidcConfigured } from '@/lib/signicat/config'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { withPageSeo } from '@/lib/seo/build-metadata'

export const dynamic = 'force-dynamic'

type Search = Promise<{ bankid?: string; bankid_reason?: string }>

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return withPageSeo(
    { title: t('sellerBankIdTitle'), description: t('sellerBankIdDescription') },
    {
      locale,
      pathSegments: ['min-side', 'hjelper', 'bankid'],
      indexable: false,
      keywords: ['BankID', 'verifisering', 'Hjelpi'],
    },
  )
}

export default async function HjelperBankIdPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams
  const bankidQuery = sp.bankid
  const bankidReason = sp.bankid_reason

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
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: providerRow } = await supabase
    .from('providers')
    .select('id, is_verified')
    .eq('profile_id', ctx.profileId)
    .maybeSingle()

  const hasProvider = Boolean(providerRow)
  const isSellerWithProvider = profileRow?.role === 'seller' && hasProvider

  if (ctx.role === 'seller' && !hasProvider) {
    return redirect({ href: '/bli-hjelper/fullfor-profil', locale })
  }

  const t = await getTranslations('dashboard.bankidPage')
  const signicatConfigured = isSignicatOidcConfigured()
  const signicatMissingEnvNames = signicatConfigured ? [] : getSignicatOidcMissingEnvNames()
  const providerVerified = Boolean(providerRow?.is_verified)

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-2 max-w-3xl text-on-surface-variant">{t('subtitle')}</p>
      </div>

      <BankIdFlowBanners bankid={bankidQuery} bankidReason={bankidReason} />

      {isSellerWithProvider ? (
        <BankIdVerificationCard
          locale={locale}
          configured={signicatConfigured}
          isVerified={providerVerified}
          signicatMissingEnvNames={signicatMissingEnvNames}
        />
      ) : (
        <SettingsBankIdBuyerHint locale={locale} />
      )}
    </div>
  )
}
