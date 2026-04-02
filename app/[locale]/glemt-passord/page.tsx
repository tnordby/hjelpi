import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return {
    title: t('forgotTitle'),
    description: t('forgotDescription'),
  }
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth.forgot')

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <ForgotPasswordForm />
    </AuthShell>
  )
}
