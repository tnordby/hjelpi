import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { RegisterForm } from '@/components/auth/RegisterForm'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return {
    title: t('registerTitle'),
    description: t('registerDescription'),
  }
}

export default async function RegisterPage() {
  const t = await getTranslations('auth.register')

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <RegisterForm />
    </AuthShell>
  )
}
