import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { BookingsTable } from '@/components/dashboard/BookingsTable'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { fetchSellerBookings, loadDashboardUserContext } from '@/lib/dashboard/data'
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
    { title: t('sellerRequestsTitle'), description: t('sellerRequestsDescription') },
    {
      locale,
      pathSegments: ['min-side', 'hjelper', 'foresporsler'],
      indexable: false,
      keywords: ['forespørsler', 'lokale tjenester', 'Hjelpi'],
    },
  )
}

export default async function HjelperForesporslerPage() {
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

  const rows = await fetchSellerBookings(supabase, ctx.providerId)
  const t = await getTranslations('dashboard.sellerRequestsPage')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('title')}
        </h1>
      </div>
      <BookingsTable rows={rows} variant="seller" />
    </div>
  )
}
