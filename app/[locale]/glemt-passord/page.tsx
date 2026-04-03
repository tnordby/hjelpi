import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { withPageSeo } from '@/lib/seo/build-metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return withPageSeo(
    { title: t('forgotTitle'), description: t('forgotDescription') },
    {
      locale,
      pathSegments: ['glemt-passord'],
      indexable: false,
      keywords: ['glemt passord', 'Hjelpi'],
    },
  )
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth.forgot')

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <ForgotPasswordForm />
    </AuthShell>
  )
}
