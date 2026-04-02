import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DashboardMessagesPanel } from '@/components/dashboard/DashboardMessagesPanel'
import { fetchMessageThreads, loadDashboardUserContext } from '@/lib/dashboard/data'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return {
    title: t('buyerMessagesTitle'),
    description: t('messagesDescription'),
  }
}

export default async function DashboardKundeMeldingerPage() {
  const t = await getTranslations('dashboard.messagesPage')
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx) return null

  const threads = await fetchMessageThreads(supabase, ctx.profileId)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">
          {t('title')}
        </h1>
        <p className="mt-2 text-on-surface-variant">{t('subtitleBuyer')}</p>
      </div>
      <DashboardMessagesPanel threads={threads} bookingsLinkHref="/dashboard/kunde/bestillinger" />
    </div>
  )
}
