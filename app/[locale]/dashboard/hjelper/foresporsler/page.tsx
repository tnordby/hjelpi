import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BookingsTable } from '@/components/dashboard/BookingsTable'
import { fetchSellerBookings, loadDashboardUserContext } from '@/lib/dashboard/data'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return {
    title: t('sellerRequestsTitle'),
    description: t('sellerRequestsDescription'),
  }
}

export default async function DashboardHjelperForesporslerPage() {
  const t = await getTranslations('dashboard.sellerRequestsPage')
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx?.providerId) return null

  const sellerRows = await fetchSellerBookings(supabase, ctx.providerId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">
          {t('title')}
        </h1>
        <p className="mt-2 text-on-surface-variant">{t('subtitle')}</p>
      </div>
      <BookingsTable rows={sellerRows} variant="seller" />
    </div>
  )
}
