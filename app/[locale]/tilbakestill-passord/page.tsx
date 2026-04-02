import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return {
    title: t('resetTitle'),
    description: t('resetDescription'),
  }
}

export default async function ResetPasswordPage() {
  const t = await getTranslations('auth.reset')
  const tAuth = await getTranslations('auth')

  return (
    <AuthShell
      title={t('title')}
      subtitle={t('subtitle')}
      backLink={{ href: '/', label: tAuth('backToHome') }}
    >
      <UpdatePasswordForm />
    </AuthShell>
  )
}
