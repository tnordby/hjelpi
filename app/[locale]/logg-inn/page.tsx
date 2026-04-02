import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { AuthShell } from '@/components/auth/AuthShell'
import { LoginForm } from '@/components/auth/LoginForm'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { parseSafeNextPath } from '@/lib/auth/safe-next-path'
import { resolveAccountHrefAfterAuth } from '@/lib/seller/post-auth'
import { withPageSeo } from '@/lib/seo/build-metadata'

export const dynamic = 'force-dynamic'

type Search = Promise<{ next?: string }>

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.meta' })
  return withPageSeo(
    { title: t('loginTitle'), description: t('loginDescription') },
    {
      locale,
      pathSegments: ['logg-inn'],
      indexable: false,
      keywords: ['logg inn', 'Hjelpi', 'lokale tjenester'],
    },
  )
}

export default async function LoginPage({ searchParams }: { searchParams: Search }) {
  const t = await getTranslations('auth.login')
  const sp = await searchParams
  const nextPath = parseSafeNextPath(sp.next)

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const locale = await getLocale()
      const fallback = await resolveAccountHrefAfterAuth(supabase, user.id)
      const href = nextPath ?? fallback
      return redirect({ href, locale })
    }
  }

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <LoginForm nextPath={nextPath} />
    </AuthShell>
  )
}
