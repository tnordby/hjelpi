import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return {
    title: t('resetTitle'),
    description: t('resetDescription'),
  }
}

export default async function ResetPasswordPage() {
  const t = await getTranslations('auth.reset')

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <UpdatePasswordForm />
    </AuthShell>
  )
}
