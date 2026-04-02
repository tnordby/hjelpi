import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { withPageSeo } from '@/lib/seo/build-metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return withPageSeo(
    { title: t('registerTitle'), description: t('registerDescription') },
    {
      locale,
      pathSegments: ['registrer'],
      indexable: false,
      keywords: ['registrer', 'Hjelpi', 'lokale tjenester'],
    },
  )
}

export default async function RegisterPage() {
  const t = await getTranslations('auth.register')

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <RegisterForm />
    </AuthShell>
  )
}
