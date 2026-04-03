'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import type { SubcategoryProviderItem } from '@/lib/providers/subcategory-providers'
import { formatServicePriceLabel } from '@/lib/provider-services/display'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { hjBtnPrimary } from '@/lib/button-classes'
import posthog from 'posthog-js'

export type SortKey =
  | 'rating_desc'
  | 'rating_asc'
  | 'reviews_desc'
  | 'bookings_desc'
  | 'name_asc'

/** Stable key for grouping/filtering (slug preferred, else name). */
function providerLocationFilterKey(p: SubcategoryProviderItem): string | null {
  if (p.locationSlug) return `s:${p.locationSlug}`
  if (p.locationName) return `n:${p.locationName}`
  return null
}

function locationOptionsFromProviders(providers: SubcategoryProviderItem[]): { value: string; label: string }[] {
  const byKey = new Map<string, string>()
  for (const p of providers) {
    const key = providerLocationFilterKey(p)
    if (!key) continue
    const label = p.locationName?.trim() || p.locationSlug || key.replace(/^[sn]:/, '')
    if (!byKey.has(key)) byKey.set(key, label)
  }
  return Array.from(byKey.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'nb'))
}

function filterProvidersByLocation(
  list: SubcategoryProviderItem[],
  locationKey: string,
): SubcategoryProviderItem[] {
  if (!locationKey) return list
  if (locationKey.startsWith('s:')) {
    const slug = locationKey.slice(2)
    return list.filter((p) => p.locationSlug === slug)
  }
  if (locationKey.startsWith('n:')) {
    const name = locationKey.slice(2)
    return list.filter((p) => p.locationName === name)
  }
  return list
}

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
  const [locationFilter, setLocationFilter] = useState('')

  const locationOptions = useMemo(() => locationOptionsFromProviders(providers), [providers])

  const filtered = useMemo(
    () => filterProvidersByLocation(providers, locationFilter),
    [providers, locationFilter],
  )

  const sorted = useMemo(() => sortProviders(filtered, sort), [filtered, sort])

  function onLocationChange(v: string) {
    setLocationFilter(v)
    posthog.capture('provider_list_location_filtered', { location_key: v || 'all' })
  }

  const toolbar = (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
      {locationOptions.length > 0 ? (
        <label className="flex w-full flex-col gap-1.5 text-sm font-medium text-on-surface sm:min-w-[200px] sm:max-w-xs sm:flex-1">
          <span className="text-on-surface-variant">{t('locationLabel')}</span>
          <select
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            className="cursor-pointer rounded-xl border border-outline-variant/60 bg-white px-4 py-2.5 font-body text-on-surface shadow-sm outline-none ring-primary/20 transition-shadow focus:ring-2"
          >
            <option value="">{t('locationAll')}</option>
            {locationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="flex w-full flex-col gap-1.5 text-sm font-medium text-on-surface sm:ml-auto sm:w-auto sm:min-w-[220px]">
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
  )

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
          className={`${hjBtnPrimary} mt-6`}
        >
          {t('emptyCta')}
        </Link>
      </div>
    )
  }

  if (filtered.length === 0 && locationFilter) {
    return (
      <div>
        {toolbar}
        <div className="rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-low/50 px-8 py-14 text-center">
          <MaterialIcon
            name="location_off"
            className="mx-auto mb-4 text-5xl text-on-surface-variant/40"
          />
          <p className="font-headline text-lg font-semibold text-on-surface">{t('filteredEmptyTitle')}</p>
          <p className="mx-auto mt-2 max-w-md text-on-surface-variant">{t('filteredEmptyBody')}</p>
          <button
            type="button"
            onClick={() => onLocationChange('')}
            className={`${hjBtnPrimary} mt-6`}
          >
            {t('filteredEmptyReset')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {toolbar}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((p) => {
          const priceLabel = formatServicePriceLabel(p.basePriceOre, p.pricingType)
          return (
            <li key={p.providerId} className="min-w-0">
              <Link
                href={`/hjelpere/${p.providerId}/tjenester/${p.serviceId}`}
                onClick={() =>
                  posthog.capture('provider_profile_clicked', {
                    provider_id: p.providerId,
                    provider_name: p.fullName,
                    service_id: p.serviceId,
                    sort_key: sort,
                    location_key: locationFilter || 'all',
                    is_verified: p.isVerified,
                    avg_rating: p.avgRating,
                  })
                }
                className="group flex aspect-square w-full flex-col overflow-hidden rounded-2xl border border-outline-variant/35 bg-white shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="relative min-h-0 flex-1 bg-surface-container-low">
                  {p.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- avatar hosts vary (Supabase, OAuth)
                    <img
                      src={p.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-on-surface-variant/45">
                      <MaterialIcon name="person" className="text-6xl" />
                    </div>
                  )}
                  {p.isVerified ? (
                    <span
                      className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm"
                      title={t('verified')}
                    >
                      <MaterialIcon name="verified" className="text-sm filled" />
                      {t('verifiedShort')}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-1 border-t border-outline-variant/20 p-3">
                  <div className="flex items-start justify-between gap-1">
                    <span className="line-clamp-2 min-w-0 font-headline text-sm font-bold leading-snug text-on-surface group-hover:text-primary">
                      {p.fullName}
                    </span>
                    <MaterialIcon
                      name="chevron_right"
                      className="mt-0.5 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </div>
                  <p className="line-clamp-2 text-xs leading-snug text-on-surface-variant">{p.serviceTitle}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-1 text-xs text-on-surface-variant">
                    <span className="inline-flex items-center gap-0.5 font-medium text-secondary">
                      <MaterialIcon name="star" className="text-base filled text-tertiary" />
                      {p.totalReviews > 0
                        ? `${p.avgRating.toFixed(1)} (${p.totalReviews})`
                        : t('noReviews')}
                    </span>
                    {p.locationName ? (
                      <span className="inline-flex max-w-full items-center gap-0.5 truncate">
                        <MaterialIcon name="location_on" className="shrink-0 text-sm" />
                        <span className="truncate">{p.locationName}</span>
                      </span>
                    ) : null}
                    {priceLabel ? (
                      <span className="w-full font-semibold text-primary">{priceLabel}</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
