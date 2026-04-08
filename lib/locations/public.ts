import { createSupabaseAnonServerClient } from '@/lib/supabase/server'

export type PublicLocation = {
  id: string
  name: string
  /** Canonical slug (e.g. kommune number) for provider filters and `/…/i/{sted}` URLs */
  slug: string
  cityName: string
  /** Pretty path segment when set (e.g. oslo) — same as URL segment for city landing */
  publicSlug: string | null
}

export type PublicLocationDirectoryRow = {
  slug: string
  name: string
  cityName: string
  fylke: string
  publicSlug: string | null
}

/** Path segment for a city landing or directory link (`/oslo` or `/0301`). */
export function cityPathSegment(loc: { slug: string; publicSlug: string | null }): string {
  const p =
    typeof loc.publicSlug === 'string' && loc.publicSlug.trim().length > 0
      ? loc.publicSlug.trim()
      : loc.slug
  return p
}

export async function fetchLocationBySlug(
  segment: string,
): Promise<PublicLocation | null> {
  const s = segment.trim()
  if (!s) return null
  const supabase = createSupabaseAnonServerClient()
  const { data, error } = await supabase
    .from('locations')
    .select('id, name, slug, city_name, public_slug')
    .or(`slug.eq.${s},public_slug.eq.${s}`)
    .maybeSingle()
  if (error || !data) return null
  const cityName =
    typeof data.city_name === 'string' && data.city_name.trim().length > 0
      ? data.city_name.trim()
      : String(data.name)
  const publicSlug =
    typeof data.public_slug === 'string' && data.public_slug.trim().length > 0
      ? data.public_slug.trim()
      : null
  return {
    id: String(data.id),
    name: String(data.name),
    slug: String(data.slug),
    cityName,
    publicSlug,
  }
}

/** All locations for the public /byer directory (anon read). */
export async function fetchPublicLocationsDirectory(): Promise<
  PublicLocationDirectoryRow[]
> {
  const supabase = createSupabaseAnonServerClient()
  const { data, error } = await supabase
    .from('locations')
    .select('name, slug, city_name, fylke, public_slug')
    .order('fylke', { ascending: true })
    .order('name', { ascending: true })

  if (error || !data) return []

  return data
    .filter(
      (row) =>
        typeof row.slug === 'string' &&
        row.slug.length > 0 &&
        typeof row.name === 'string',
    )
    .map((row) => ({
      slug: String(row.slug),
      name: String(row.name),
      cityName:
        typeof row.city_name === 'string' && row.city_name.trim().length > 0
          ? row.city_name.trim()
          : String(row.name),
      fylke: typeof row.fylke === 'string' ? row.fylke.trim() : '',
      publicSlug:
        typeof row.public_slug === 'string' && row.public_slug.trim().length > 0
          ? row.public_slug.trim()
          : null,
    }))
}
