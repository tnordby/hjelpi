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
    { title: t('sellerRegisterTitle'), description: t('sellerRegisterDescription') },
    {
      locale,
      pathSegments: ['bli-hjelper', 'registrer'],
      indexable: false,
      keywords: ['bli hjelper', 'registrering', 'Hjelpi'],
    },
  )
}

export default async function BliHjelperRegistrerPage() {
  const t = await getTranslations('auth.sellerRegister')

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <RegisterForm variant="seller" />
    </AuthShell>
  )
}
