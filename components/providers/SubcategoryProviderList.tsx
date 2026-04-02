'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import type { SubcategoryProviderItem } from '@/lib/providers/subcategory-providers'
import { formatServicePriceLabel } from '@/lib/provider-services/display'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import posthog from 'posthog-js'

export type SortKey =
  | 'rating_desc'
  | 'rating_asc'
  | 'reviews_desc'
  | 'bookings_desc'
  | 'name_asc'

function sortProviders(list: SubcategoryProviderItem[], key: SortKey): SubcategoryProviderItem[] {
  const out = [...list]
  switch (key) {
    case 'rating_desc':
      out.sort((a, b) => b.avgRating - a.avgRating || b.totalReviews - a.totalReviews)
      break
    case 'rating_asc':
      out.sort((a, b) => a.avgRating - b.avgRating || a.totalReviews - b.totalReviews)
      break
    case 'reviews_desc':
      out.sort((a, b) => b.totalReviews - a.totalReviews || b.avgRating - a.avgRating)
      break
    case 'bookings_desc':
      out.sort((a, b) => b.totalBookings - a.totalBookings || b.avgRating - a.avgRating)
      break
    case 'name_asc':
      out.sort((a, b) => a.fullName.localeCompare(b.fullName, 'nb'))
      break
    default:
      break
  }
  return out
}

export function SubcategoryProviderList({
  providers,
}: {
  providers: SubcategoryProviderItem[]
}) {
  const t = useTranslations('subcategoryPage.providers')
  const [sort, setSort] = useState<SortKey>('rating_desc')

  const sorted = useMemo(() => sortProviders(providers, sort), [providers, sort])

  if (providers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-low/50 px-8 py-14 text-center">
        <MaterialIcon
          name="group_off"
          className="mx-auto mb-4 text-5xl text-on-surface-variant/40"
        />
        <p className="font-headline text-lg font-semibold text-on-surface">{t('emptyTitle')}</p>
        <p className="mx-auto mt-2 max-w-md text-on-surface-variant">{t('emptyBody')}</p>
        <Link
          href="/bli-hjelper"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary hover:opacity-90"
        >
          {t('emptyCta')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline text-2xl font-bold text-primary md:text-3xl">
            {t('sectionTitle')}
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t('sectionSubtitle', { count: providers.length })}
          </p>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-on-surface sm:min-w-[220px]">
          <span className="text-on-surface-variant">{t('sortLabel')}</span>
          <select
            value={sort}
            onChange={(e) => {
              const newSort = e.target.value as SortKey
              setSort(newSort)
              posthog.capture('provider_list_sorted', { sort_key: newSort })
            }}
            className="cursor-pointer rounded-xl border border-outline-variant/60 bg-white px-4 py-2.5 font-body text-on-surface shadow-sm outline-none ring-primary/20 transition-shadow focus:ring-2"
          >
            <option value="rating_desc">{t('sortRatingHigh')}</option>
            <option value="rating_asc">{t('sortRatingLow')}</option>
            <option value="reviews_desc">{t('sortReviews')}</option>
            <option value="bookings_desc">{t('sortBookings')}</option>
            <option value="name_asc">{t('sortName')}</option>
          </select>
        </label>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {sorted.map((p) => {
          const priceLabel = formatServicePriceLabel(p.basePriceOre, p.pricingType)
          return (
            <li key={p.providerId}>
              <Link
                href={`/hjelpere/${p.providerId}/tjenester/${p.serviceId}`}
                onClick={() =>
                  posthog.capture('provider_profile_clicked', {
                    provider_id: p.providerId,
                    provider_name: p.fullName,
                    service_id: p.serviceId,
                    sort_key: sort,
                    is_verified: p.isVerified,
                    avg_rating: p.avgRating,
                  })
                }
                className="group flex h-full gap-4 rounded-2xl border border-outline-variant/35 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface-container-low">
                  {p.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- avatar hosts vary (Supabase, OAuth)
                    <img
                      src={p.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      width={80}
                      height={80}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-on-surface-variant/50">
                      <MaterialIcon name="person" className="text-4xl" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-headline text-lg font-bold text-on-surface group-hover:text-primary">
                      {p.fullName}
                    </span>
                    {p.isVerified ? (
                      <span
                        className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                        title={t('verified')}
                      >
                        <MaterialIcon name="verified" className="text-sm filled" />
                        {t('verifiedShort')}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-on-surface-variant">
                    {p.serviceTitle}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant">
                    <span className="inline-flex items-center gap-1 font-medium text-secondary">
                      <MaterialIcon name="star" className="text-lg filled text-amber-500" />
                      {p.totalReviews > 0
                        ? `${p.avgRating.toFixed(1)} (${p.totalReviews})`
                        : t('noReviews')}
                    </span>
                    {p.locationName ? (
                      <span className="inline-flex items-center gap-1">
                        <MaterialIcon name="location_on" className="text-base" />
                        {p.locationName}
                      </span>
                    ) : null}
                    {priceLabel ? (
                      <span className="font-semibold text-primary">{priceLabel}</span>
                    ) : null}
                  </div>
                </div>
                <MaterialIcon
                  name="chevron_right"
                  className="shrink-0 self-center text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
