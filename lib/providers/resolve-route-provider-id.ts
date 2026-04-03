import type { SupabaseClient } from '@supabase/supabase-js'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * `/hjelpere/[id]` may use either `providers.id` or `profiles.id` (same as `providers.profile_id`).
 */
export async function resolveRouteProviderId(
  supabase: SupabaseClient,
  routeId: string,
): Promise<string | null> {
  const trimmed = routeId.trim()
  if (!UUID_RE.test(trimmed)) return null

  const { data, error } = await supabase
    .from('providers')
    .select('id')
    .or(`id.eq.${trimmed},profile_id.eq.${trimmed}`)
    .maybeSingle()

  if (error || !data || typeof (data as { id?: unknown }).id !== 'string') return null
  return (data as { id: string }).id
}
