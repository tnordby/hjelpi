import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { DashboardMessagesPanel } from '@/components/dashboard/DashboardMessagesPanel'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { fetchMessageThreads, loadDashboardUserContext } from '@/lib/dashboard/data'
import { withPageSeo } from '@/lib/seo/build-metadata'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return withPageSeo(
    { title: t('sellerMessagesTitle'), description: t('messagesDescription') },
    {
      locale,
      pathSegments: ['min-side', 'hjelper', 'meldinger'],
      indexable: false,
      keywords: ['meldinger', 'hjelper', 'Hjelpi'],
    },
  )
}

export default async function HjelperMeldingerPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) return redirect({ href: '/logg-inn', locale })

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx?.providerId) {
    if (ctx?.role === 'seller') {
      return redirect({ href: '/bli-hjelper/fullfor-profil', locale })
    }
    return redirect({ href: '/min-side/hjelper', locale })
  }

  const threads = await fetchMessageThreads(supabase, ctx.profileId)
  const t = await getTranslations('dashboard.messagesPage')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-on-surface-variant">{t('subtitleSeller')}</p>
      </div>
      <DashboardMessagesPanel threads={threads} bookingsLinkHref="/min-side/hjelper/foresporsler" />
    </div>
  )
}
