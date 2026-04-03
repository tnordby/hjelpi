import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { AuthShell } from '@/components/auth/AuthShell'
import { CompleteSellerProfileForm } from '@/components/seller/CompleteSellerProfileForm'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { resolveAccountHrefAfterAuth } from '@/lib/seller/post-auth'
import { withPageSeo } from '@/lib/seo/build-metadata'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return withPageSeo(
    { title: t('sellerOnboardingTitle'), description: t('sellerOnboardingDescription') },
    {
      locale,
      pathSegments: ['bli-hjelper', 'fullfor-profil'],
      indexable: false,
      keywords: ['hjelperprofil', 'Hjelpi', 'lokale tjenester'],
    },
  )
}

export default async function FullforProfilPage() {
  const t = await getTranslations('sellerOnboarding.page')

  if (!isSupabaseConfigured()) {
    return (
      <AuthShell title={t('title')} subtitle={t('configureHint')}>
        <p className="text-sm text-on-surface-variant">{t('configureHint')}</p>
      </AuthShell>
    )
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const locale = await getLocale()
    return redirect({ href: '/logg-inn', locale })
  }

  const nextHref = await resolveAccountHrefAfterAuth(supabase, user.id)
  if (nextHref !== '/bli-hjelper/fullfor-profil') {
    const locale = await getLocale()
    return redirect({ href: nextHref, locale })
  }

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, city_name')
    .order('name', { ascending: true })

  const locationOptions =
    locations?.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      cityName:
        typeof row.city_name === 'string' && row.city_name.trim().length > 0
          ? row.city_name.trim()
          : String(row.name),
    })) ?? []

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <CompleteSellerProfileForm locations={locationOptions} />
    </AuthShell>
  )
}
