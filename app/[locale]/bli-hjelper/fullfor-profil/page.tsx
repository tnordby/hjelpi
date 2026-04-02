import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { AuthShell } from '@/components/auth/AuthShell'
import { CompleteSellerProfileForm } from '@/components/seller/CompleteSellerProfileForm'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { resolveAccountHrefAfterAuth } from '@/lib/seller/post-auth'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return {
    title: t('sellerOnboardingTitle'),
    description: t('sellerOnboardingDescription'),
  }
}

export default async function FullforProfilPage() {
  const t = await getTranslations('sellerOnboarding.page')
  const tBack = await getTranslations('bliHjelperPage')

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
  if (nextHref === '/min-konto') {
    const locale = await getLocale()
    return redirect({ href: '/min-konto', locale })
  }

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')
    .order('name', { ascending: true })

  const locationOptions =
    locations?.map((row) => ({ id: row.id as string, name: row.name as string })) ?? []

  return (
    <AuthShell
      title={t('title')}
      subtitle={t('subtitle')}
      backLink={{ href: '/bli-hjelper', label: tBack('backToLanding') }}
    >
      <CompleteSellerProfileForm locations={locationOptions} />
    </AuthShell>
  )
}
