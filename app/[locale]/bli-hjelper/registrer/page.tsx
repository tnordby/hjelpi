import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { RegisterForm } from '@/components/auth/RegisterForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return {
    title: t('sellerRegisterTitle'),
    description: t('sellerRegisterDescription'),
  }
}

export default async function BliHjelperRegistrerPage() {
  const t = await getTranslations('auth.sellerRegister')
  const tBack = await getTranslations('bliHjelperPage')

  return (
    <AuthShell
      title={t('title')}
      subtitle={t('subtitle')}
      backLink={{ href: '/bli-hjelper', label: tBack('backToLanding') }}
    >
      <RegisterForm variant="seller" />
    </AuthShell>
  )
}
