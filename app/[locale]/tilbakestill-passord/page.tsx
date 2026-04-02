import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'
import { withPageSeo } from '@/lib/seo/build-metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return withPageSeo(
    { title: t('resetTitle'), description: t('resetDescription') },
    {
      locale,
      pathSegments: ['tilbakestill-passord'],
      indexable: false,
      keywords: ['nytt passord', 'Hjelpi'],
    },
  )
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
