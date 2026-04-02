import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link, redirect } from '@/i18n/routing'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  fetchSellerEarningsByPeriod,
  fetchSellerEarningsSummary,
  loadDashboardUserContext,
} from '@/lib/dashboard/data'
import { formatOreToNok } from '@/lib/dashboard/money'
import { withPageSeo } from '@/lib/seo/build-metadata'

export const dynamic = 'force-dynamic'

type Search = Promise<{ visning?: string }>

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return withPageSeo(
    { title: t('sellerEconomyTitle'), description: t('sellerEconomyDescription') },
    {
      locale,
      pathSegments: ['min-side', 'hjelper', 'inntekter'],
      indexable: false,
      keywords: ['inntekter', 'hjelper', 'Hjelpi'],
    },
  )
}

export default async function HjelperInntekterPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams
  const granularity = sp.visning === 'ar' ? 'year' : 'month'

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

  const [summary, breakdown] = await Promise.all([
    fetchSellerEarningsSummary(supabase, ctx.providerId),
    fetchSellerEarningsByPeriod(supabase, ctx.providerId, granularity),
  ])

  const t = await getTranslations('dashboard.sellerEconomy')
  const monthHref = '/min-side/hjelper/inntekter'
  const yearHref = '/min-side/hjelper/inntekter?visning=ar'

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-on-surface-variant">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-ambient ring-1 ring-outline-variant/15">
          <p className="text-sm font-medium text-on-surface-variant">{t('netTitle')}</p>
          <p className="mt-2 font-headline text-3xl font-extrabold text-primary">
            {formatOreToNok(summary.netOre)}
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">{t('netSubtitle')}</p>
          <p className="mt-4 text-sm text-on-surface-variant">
            {t('completedCount', { count: summary.completedCount })}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t('pendingCount', { count: summary.pendingIncoming })}
          </p>
          <p className="mt-4 text-xs text-on-surface-variant/80">{t('footnote')}</p>
        </div>

        <div className="flex flex-col justify-center gap-3 rounded-2xl bg-surface-container-low/80 p-6 ring-1 ring-outline-variant/15">
          <div className="flex flex-wrap gap-2">
            <Link
              href={monthHref}
              className={
                granularity === 'month'
                  ? 'rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary'
                  : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-on-surface ring-1 ring-outline-variant/30 hover:bg-surface-container-low'
              }
            >
              {t('viewMonth')}
            </Link>
            <Link
              href={yearHref}
              className={
                granularity === 'year'
                  ? 'rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary'
                  : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-on-surface ring-1 ring-outline-variant/30 hover:bg-surface-container-low'
              }
            >
              {t('viewYear')}
            </Link>
          </div>
        </div>
      </div>

      <section>
        <h2 className="font-headline text-lg font-bold text-on-surface">{t('breakdownTitle')}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{t('breakdownSubtitle')}</p>
        {breakdown.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-surface-container-low/80 px-6 py-12 text-center text-on-surface-variant">
            {t('breakdownEmpty')}
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-outline-variant/20">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-on-surface">{t('colPeriod')}</th>
                  <th className="px-4 py-3 font-semibold text-on-surface">{t('colCount')}</th>
                  <th className="px-4 py-3 font-semibold text-on-surface">{t('colNet')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {breakdown.map((row) => (
                  <tr key={row.periodKey} className="bg-surface-container-lowest/80">
                    <td className="px-4 py-3 font-medium text-on-surface">{row.label}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{row.count}</td>
                    <td className="px-4 py-3 tabular-nums text-on-surface">
                      {formatOreToNok(row.netOre)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
