'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { searchServices, type ServiceSuggestion } from '@/lib/search/service-search'
import {
  searchLocations,
  locateKommune,
  type LocationSuggestion,
} from '@/lib/search/location-search'
import { cn } from '@/lib/utils'
import posthog from 'posthog-js'

const POPULAR_TAGS = ['photographer', 'dogSitting', 'moveClean'] as const
const LAST_LOCATION_KEY = 'hjelpi.lastLocation'

type Layout = 'hero' | 'default'
type ActiveField = 'service' | 'location' | null

export function HomeSearchBar({ layout = 'default' }: { layout?: Layout }) {
  const t = useTranslations('home.hero')
  const router = useRouter()
  const hero = layout === 'hero'

  const [query, setQuery] = useState('')
  const [locationText, setLocationText] = useState('')
  const [service, setService] = useState<ServiceSuggestion | null>(null)
  const [location, setLocation] = useState<LocationSuggestion | null>(null)
  const [active, setActive] = useState<ActiveField>(null)
  const [highlight, setHighlight] = useState(0)
  const [locating, setLocating] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)

  const serviceSuggestions = active === 'service' ? searchServices(query) : []
  const locationSuggestions = active === 'location' ? searchLocations(locationText) : []

  // restore last-used location once
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LAST_LOCATION_KEY)
      if (raw) {
        const loc = JSON.parse(raw) as LocationSuggestion
        if (loc?.navn && loc?.publicSlug) {
          setLocation(loc)
          setLocationText(loc.navn)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // close dropdowns on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setActive(null)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function pickService(s: ServiceSuggestion) {
    setService(s)
    setQuery(s.title)
    setActive('location')
    setHighlight(0)
    locationInputRef.current?.focus()
  }

  function pickLocation(loc: LocationSuggestion) {
    setLocation(loc)
    setLocationText(loc.navn)
    setActive(null)
    try {
      window.localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(loc))
    } catch {
      // ignore
    }
  }

  async function useMyPosition() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = await locateKommune(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
        if (loc) {
          pickLocation(loc)
          posthog.capture('search_geolocation_used', { kommune: loc.navn })
        }
      },
      () => setLocating(false),
      { timeout: 8000 },
    )
  }

  function resolveDestination(): string {
    // exact selection wins; otherwise take the top suggestion for the typed text
    const svc = service ?? searchServices(query, 1)[0] ?? null
    const loc =
      location ?? (locationText.trim() ? searchLocations(locationText, 1)[0] ?? null : null)

    if (svc?.subSlug && loc) return `${svc.href}/i/${loc.publicSlug}`
    if (svc) return svc.href
    if (loc && !query.trim()) return `/${loc.publicSlug}`
    return '/tjenester'
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    const dest = resolveDestination()
    posthog.capture('search_submitted', {
      query: q,
      location: location?.navn ?? (locationText.trim() || null),
      destination: dest,
      layout,
    })
    if (q && dest === '/tjenester') {
      posthog.capture('search_no_results', { query: q, layout })
    }
    setActive(null)
    router.push(dest)
  }

  function onServiceKeyDown(e: React.KeyboardEvent) {
    if (active !== 'service' || serviceSuggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, serviceSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      pickService(serviceSuggestions[highlight] ?? serviceSuggestions[0])
    } else if (e.key === 'Escape') {
      setActive(null)
    }
  }

  function onLocationKeyDown(e: React.KeyboardEvent) {
    if (active !== 'location' || locationSuggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, locationSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && locationSuggestions[highlight]) {
      e.preventDefault()
      pickLocation(locationSuggestions[highlight])
    } else if (e.key === 'Escape') {
      setActive(null)
    }
  }

  return (
    <div ref={rootRef} className={cn('relative w-full', hero ? 'max-w-2xl' : 'max-w-xl')}>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 rounded-3xl border-2 border-on-surface bg-white p-1.5 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 pl-3.5">
          <MaterialIcon name="search" className="shrink-0 text-on-surface" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setService(null)
              setActive('service')
              setHighlight(0)
            }}
            onFocus={() => setActive('service')}
            onKeyDown={onServiceKeyDown}
            className="min-w-0 flex-1 border-none bg-transparent py-2.5 text-base text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
            placeholder={t('searchPlaceholder')}
            autoComplete="off"
            aria-label={t('searchPlaceholder')}
            aria-expanded={active === 'service' && serviceSuggestions.length > 0}
            role="combobox"
            aria-controls="hj-service-suggestions"
          />
        </div>
        <div className="flex items-center gap-2 border-t border-outline-variant pl-3.5 sm:border-l sm:border-t-0 sm:pl-3">
          <MaterialIcon name="location_on" className="shrink-0 text-on-surface-variant" />
          <input
            ref={locationInputRef}
            value={locationText}
            onChange={(e) => {
              setLocationText(e.target.value)
              setLocation(null)
              setActive('location')
              setHighlight(0)
            }}
            onFocus={() => setActive('location')}
            onKeyDown={onLocationKeyDown}
            className="w-full border-none bg-transparent py-2.5 text-base text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none sm:w-36"
            placeholder={t('locationPlaceholder')}
            autoComplete="off"
            aria-label={t('locationPlaceholder')}
            aria-expanded={active === 'location'}
            role="combobox"
            aria-controls="hj-location-suggestions"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-full bg-on-surface px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-container sm:ml-1.5"
        >
          {t('search')}
        </button>
      </form>

      {active === 'service' && serviceSuggestions.length > 0 ? (
        <ul
          id="hj-service-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-white py-2 shadow-ambient-md ring-1 ring-outline-variant"
        >
          {serviceSuggestions.map((s, i) => (
            <li key={s.href} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  pickService(s)
                }}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-left',
                  i === highlight && 'bg-surface-container-low',
                )}
              >
                <MaterialIcon
                  name={s.kind === 'category' ? 'category' : 'arrow_forward'}
                  className="text-lg text-on-surface-variant"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-on-surface">
                    {s.title}
                  </span>
                  {s.categoryTitle ? (
                    <span className="block truncate text-xs text-on-surface-variant">
                      {s.categoryTitle}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {active === 'location' ? (
        <ul
          id="hj-location-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-white py-2 shadow-ambient-md ring-1 ring-outline-variant"
        >
          <li>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                void useMyPosition()
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-primary-container"
            >
              <MaterialIcon name="my_location" className="text-lg" />
              {locating ? t('locating') : t('useMyLocation')}
            </button>
          </li>
          {locationSuggestions.map((loc, i) => (
            <li key={loc.nummer} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  pickLocation(loc)
                }}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-on-surface',
                  i === highlight && 'bg-surface-container-low',
                )}
              >
                <MaterialIcon name="location_on" className="text-lg text-on-surface-variant" />
                {loc.navn}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm text-on-surface-variant">{t('popularLabel')}</span>
        {POPULAR_TAGS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              const tag = t(`popularTags.${key}`)
              setQuery(tag)
              setService(null)
              setActive('service')
              posthog.capture('popular_tag_clicked', { tag, key })
            }}
            className="rounded-full bg-secondary-container/80 px-3.5 py-1.5 text-xs font-semibold text-on-secondary-container transition-colors hover:bg-secondary-container md:text-sm"
          >
            {t(`popularTags.${key}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
