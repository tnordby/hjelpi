import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return {
    title: t('forgotTitle'),
    description: t('forgotDescription'),
  }
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth.forgot')
  const tAuth = await getTranslations('auth')

  return (
    <AuthShell
      title={t('title')}
      subtitle={t('subtitle')}
      backLink={{ href: '/', label: tAuth('backToHome') }}
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
