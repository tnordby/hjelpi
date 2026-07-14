import KOMMUNER from '@/data/kommuner.json'
import { normalizeSearchText } from '@/lib/search/normalize'

export type LocationSuggestion = {
  /** Kommune number, canonical slug in the locations table */
  nummer: string
  /** Display name, e.g. "Oslo" */
  navn: string
  /** URL segment for /{kategori}/{sub}/i/{sted} and city landings */
  publicSlug: string
}

const ALL: LocationSuggestion[] = KOMMUNER as LocationSuggestion[]

export function searchLocations(query: string, limit = 6): LocationSuggestion[] {
  const q = normalizeSearchText(query)
  if (q.length < 2) return []
  const starts: LocationSuggestion[] = []
  const contains: LocationSuggestion[] = []
  for (const k of ALL) {
    const n = normalizeSearchText(k.navn)
    if (n.startsWith(q)) starts.push(k)
    else if (n.includes(q)) contains.push(k)
    if (starts.length >= limit) break
  }
  return [...starts, ...contains].slice(0, limit)
}

export function findLocationBySlug(slug: string): LocationSuggestion | undefined {
  return ALL.find((k) => k.publicSlug === slug || k.nummer === slug)
}

/** Resolve browser coordinates to a kommune via Kartverket (no key needed). */
export async function locateKommune(
  lat: number,
  lon: number,
): Promise<LocationSuggestion | undefined> {
  try {
    const res = await fetch(
      `https://api.kartverket.no/kommuneinfo/v1/punkt?nord=${lat}&ost=${lon}&koordsys=4258`,
      { signal: AbortSignal.timeout(5000) },
    )
    if (!res.ok) return undefined
    const data = (await res.json()) as { kommunenummer?: string }
    if (!data.kommunenummer) return undefined
    return ALL.find((k) => k.nummer === data.kommunenummer)
  } catch {
    return undefined
  }
}
