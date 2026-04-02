import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { AuthShell } from '@/components/auth/AuthShell'
import { SignOutForm } from '@/components/auth/SignOutForm'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
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

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const locale = await getLocale()
    redirect(`/${locale}/logg-inn`)
  }

  const email = user.email ?? ''

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-on-surface-variant">{t('emailLabel')}</p>
          <p className="font-medium text-on-surface">{email}</p>
        </div>
        <SignOutForm label={t('signOut')} />
      </div>
    </AuthShell>
  )
}
