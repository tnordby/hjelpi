import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import {
  fetchSellerEarningsByPeriod,
  fetchSellerEarningsSummary,
  loadDashboardUserContext,
} from '@/lib/dashboard/data'
import { formatOreToNok } from '@/lib/dashboard/money'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return {
    title: t('sellerEconomyTitle'),
    description: t('sellerEconomyDescription'),
  }
}

function parseGranularity(
  visning: string | string[] | undefined,
): 'month' | 'year' {
  const raw = Array.isArray(visning) ? visning[0] : visning
  return raw === 'ar' ? 'year' : 'month'
}

export default async function DashboardHjelperInntekterPage({
  searchParams,
}: {
  searchParams: Promise<{ visning?: string | string[] }>
}) {
  const sp = await searchParams
  const granularity = parseGranularity(sp.visning)
  const t = await getTranslations('dashboard.sellerEconomy')
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx?.providerId) return null

  const [sellerSummary, periodRows] = await Promise.all([
    fetchSellerEarningsSummary(supabase, ctx.providerId),
    fetchSellerEarningsByPeriod(supabase, ctx.providerId, granularity),
  ])

  const monthHref = '/dashboard/hjelper/inntekter'
  const yearHref = '/dashboard/hjelper/inntekter?visning=ar'

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">
          {t('title')}
        </h1>
        <p className="mt-2 text-on-surface-variant">{t('subtitle')}</p>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-ambient ring-1 ring-outline-variant/15">
        <h2 className="font-headline text-lg font-bold text-on-surface">{t('netTitle')}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{t('netSubtitle')}</p>
        <p className="mt-6 font-headline text-3xl font-extrabold text-primary">
          {formatOreToNok(sellerSummary.netOre)}
        </p>
        <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
          <li>{t('completedCount', { count: sellerSummary.completedCount })}</li>
          <li>{t('pendingCount', { count: sellerSummary.pendingIncoming })}</li>
        </ul>
        <p className="mt-4 text-xs text-on-surface-variant">{t('footnote')}</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              {t('breakdownTitle')}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-on-surface-variant">
              {t('breakdownSubtitle')}
            </p>
          </div>
          <div
            className="inline-flex shrink-0 rounded-2xl bg-surface-container-low/90 p-1 ring-1 ring-outline-variant/20"
            role="group"
            aria-label={t('breakdownTitle')}
          >
            <Link
              href={monthHref}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-bold transition-colors',
                granularity === 'month'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
              )}
              aria-current={granularity === 'month' ? 'true' : undefined}
            >
              {t('viewMonth')}
            </Link>
            <Link
              href={yearHref}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-bold transition-colors',
                granularity === 'year'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
              )}
              aria-current={granularity === 'year' ? 'true' : undefined}
            >
              {t('viewYear')}
            </Link>
          </div>
        </div>

        {periodRows.length === 0 ? (
          <p className="rounded-2xl bg-surface-container-low/80 px-6 py-12 text-center text-on-surface-variant">
            {t('breakdownEmpty')}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl ring-1 ring-outline-variant/20">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-on-surface">{t('colPeriod')}</th>
                  <th className="px-4 py-3 font-semibold text-on-surface">{t('colCount')}</th>
                  <th className="px-4 py-3 font-semibold text-on-surface">{t('colNet')}</th>
                </tr>
              </thead>
              <tbody>
                {periodRows.map((row) => (
                  <tr
                    key={row.periodKey}
                    className="border-b border-outline-variant/15 last:border-0"
                  >
                    <td className="px-4 py-3 capitalize text-on-surface">{row.label}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{row.count}</td>
                    <td className="px-4 py-3 font-medium text-on-surface">
                      {formatOreToNok(row.netOre)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
