import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link, redirect } from '@/i18n/routing'
import { AuthShell } from '@/components/auth/AuthShell'
import { ResendSignupEmailForm } from '@/components/auth/ResendSignupEmailForm'
import { SignOutForm } from '@/components/auth/SignOutForm'
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
    title: t('accountTitle'),
    description: t('accountDescription'),
  }
}

export default async function MinKontoPage() {
  const t = await getTranslations('auth.account')
  const tAuth = await getTranslations('auth')

  if (!isSupabaseConfigured()) {
    return (
      <AuthShell title={t('title')} subtitle={t('notConfigured')}>
        <Link
          href="/"
          className="inline-block font-bold text-primary hover:underline"
        >
          {tAuth('backToHome')}
        </Link>
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

  const accountHref = await resolveAccountHrefAfterAuth(supabase, user.id)
  if (accountHref === '/bli-hjelper/fullfor-profil') {
    const locale = await getLocale()
    return redirect({ href: '/bli-hjelper/fullfor-profil', locale })
  }

  const email = user.email ?? ''
  const needsEmailConfirm = !user.email_confirmed_at && email.length > 0

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .maybeSingle()

  const displayName = profile?.full_name?.trim() || null

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <div className="space-y-6">
        {displayName ? (
          <div>
            <p className="text-sm text-on-surface-variant">{t('nameLabel')}</p>
            <p className="font-medium text-on-surface">{displayName}</p>
          </div>
        ) : null}
        <div>
          <p className="text-sm text-on-surface-variant">{t('emailLabel')}</p>
          <p className="font-medium text-on-surface">{email}</p>
        </div>
        {needsEmailConfirm ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low/80 px-4 py-4">
            <p className="mb-3 text-sm text-on-surface-variant">{t('unverifiedHint')}</p>
            <ResendSignupEmailForm email={email} />
          </div>
        ) : null}
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard"
            className="inline-flex w-full justify-center rounded-full bg-primary py-3.5 text-center text-sm font-bold text-on-primary shadow-ambient transition-opacity hover:opacity-90 sm:w-auto sm:px-8"
          >
            {t('openDashboard')}
          </Link>
          <p className="text-center text-xs text-on-surface-variant sm:text-left">{t('openDashboardDesc')}</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/glemt-passord"
              className="text-sm font-bold text-primary underline-offset-2 hover:underline"
            >
              {t('changePassword')}
            </Link>
            <SignOutForm label={t('signOut')} />
          </div>
        </div>
      </div>
    </AuthShell>
  )
}
