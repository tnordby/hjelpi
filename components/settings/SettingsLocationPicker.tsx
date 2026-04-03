'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { findNearestLocationFromCoordsAction } from '@/lib/profile/actions'
import {
  locationKommuneLabel,
  locationMatchesSearch,
  locationSettingsInputValue,
} from '@/lib/locations/display'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'

export type SettingsLocationOption = {
  id: string
  name: string
  fylke: string
  /** By / tettsted (often same as kommune name; can differ per row). */
  cityName: string
}

const inputClass =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none ring-1 ring-outline-variant/20 transition-shadow focus:ring-2 focus:ring-primary/25'

type Props = {
  locations: SettingsLocationOption[]
  initialLocationId: string
  loadError?: boolean
}

export function SettingsLocationPicker({ locations, initialLocationId, loadError = false }: Props) {
  const t = useTranslations('dashboard.settingsPage.form')
  const listId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [selectedId, setSelectedId] = useState(initialLocationId)
  const [query, setQuery] = useState(() => {
    const sel = locations.find((l) => l.id === initialLocationId)
    return sel ? locationSettingsInputValue(sel) : ''
  })
  const [open, setOpen] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoMessage, setGeoMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    setSelectedId(initialLocationId)
    const sel = locations.find((l) => l.id === initialLocationId)
    setQuery(sel ? locationSettingsInputValue(sel) : '')
    // Sync when server-sent selection changes after save/refresh — not on every `locations` reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocationId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return locations
    return locations.filter((l) => locationMatchesSearch(l, q))
  }, [locations, query])

  const grouped = useMemo(() => {
    const map = new Map<string, SettingsLocationOption[]>()
    for (const loc of filtered) {
      const arr = map.get(loc.fylke) ?? []
      arr.push(loc)
      map.set(loc.fylke, arr)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.name.localeCompare(b.name, 'nb'))
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'nb'))
  }, [filtered])

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!open) return
      if (containerRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open])

  const pick = useCallback((loc: SettingsLocationOption) => {
    setSelectedId(loc.id)
    setQuery(locationSettingsInputValue(loc))
    setOpen(false)
    setGeoMessage(null)
    inputRef.current?.blur()
  }, [])

  const onQueryChange = (value: string) => {
    setQuery(value)
    setOpen(true)
    setGeoMessage(null)
    if (value.trim() === '') {
      setSelectedId('')
      return
    }
    const v = value.trim().toLowerCase()
    const match = locations.find(
      (l) => locationSettingsInputValue(l).toLowerCase() === v || l.name.toLowerCase() === v,
    )
    if (match) {
      setSelectedId(match.id)
    } else if (selectedId) {
      const still = locations.find((l) => l.id === selectedId)
      if (still) {
        const q = value.trim().toLowerCase()
        const canonical = locationSettingsInputValue(still).toLowerCase()
        if (q.length > 0 && q !== canonical && !canonical.startsWith(q)) {
          setSelectedId('')
        }
      }
    }
  }

  const onUseMyLocation = () => {
    setGeoMessage(null)
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoMessage({ type: 'err', text: t('geoUnavailable') })
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await findNearestLocationFromCoordsAction(
          pos.coords.latitude,
          pos.coords.longitude,
        )
        setGeoLoading(false)
        if (res.ok) {
          setSelectedId(res.id)
          setQuery(res.displayLabel)
          setOpen(false)
          setGeoMessage({ type: 'ok', text: t('geoNearestPicked', { label: res.displayLabel }) })
        } else {
          setGeoMessage({ type: 'err', text: res.error })
        }
      },
      (err) => {
        setGeoLoading(false)
        if (err.code === 1) {
          setGeoMessage({ type: 'err', text: t('geoDenied') })
        } else if (err.code === 3) {
          setGeoMessage({ type: 'err', text: t('geoTimeout') })
        } else {
          setGeoMessage({ type: 'err', text: t('geoPositionError') })
        }
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 300_000 },
    )
  }

  if (loadError) {
    return (
      <p className="rounded-xl bg-error-container/80 px-4 py-3 text-sm text-on-error-container" role="alert">
        {t('locationQueryFailed')}
      </p>
    )
  }

  if (locations.length === 0) {
    return (
      <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant" role="status">
        {t('locationEmpty')}
      </p>
    )
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      <input type="hidden" name="locationId" value={selectedId} />

      <div className="relative">
        <label htmlFor="location-search" className="mb-2 block text-sm font-medium text-on-surface">
          {t('locationLabel')}
        </label>
        <input
          ref={inputRef}
          id="location-search"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={t('locationSearchPlaceholder')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
          }}
          className={inputClass}
        />
        {open ? (
          <div
            id={listId}
            role="listbox"
            aria-label={t('locationListAria')}
            className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-auto rounded-xl bg-surface-container-lowest py-2 shadow-lg ring-1 ring-outline-variant/25 sm:max-h-80"
          >
            {grouped.length === 0 ? (
              <p className="px-4 py-3 text-sm text-on-surface-variant" role="status">
                {t('locationNoMatches')}
              </p>
            ) : (
              grouped.map(([fylke, items]) => (
                <div key={fylke} role="group" aria-label={fylke}>
                  <div className="sticky top-0 bg-surface-container-lowest px-4 py-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                    {fylke}
                  </div>
                  <div className="pb-1">
                    {items.map((loc) => {
                      const cityLine = (loc.cityName || loc.name).trim()
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          role="option"
                          aria-selected={selectedId === loc.id}
                          className={cn(
                            'flex w-full flex-col gap-0.5 px-4 py-2.5 text-left text-sm transition-colors',
                            selectedId === loc.id
                              ? 'bg-primary/12'
                              : 'hover:bg-surface-container-low',
                          )}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pick(loc)}
                        >
                          <span className="font-medium text-on-surface">{cityLine}</span>
                          <span className="text-xs text-on-surface-variant">
                            {locationKommuneLabel(loc.name)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={geoLoading}
          onClick={onUseMyLocation}
          className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-white px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MaterialIcon name="my_location" className="text-xl text-primary" />
          {geoLoading ? t('useMyLocationLoading') : t('useMyLocation')}
        </button>
      </div>

      {geoMessage ? (
        <p
          role={geoMessage.type === 'err' ? 'alert' : 'status'}
          className={cn(
            'rounded-xl px-4 py-3 text-sm',
            geoMessage.type === 'err'
              ? 'bg-error-container/80 text-on-error-container'
              : 'bg-primary/10 text-on-surface',
          )}
        >
          {geoMessage.text}
        </p>
      ) : null}
    </div>
  )
}
