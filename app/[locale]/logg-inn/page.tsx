import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { LoginForm } from '@/components/auth/LoginForm'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
  }
}

export default async function LoginPage() {
  const t = await getTranslations('auth.login')

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <LoginForm />
    </AuthShell>
  )
}
