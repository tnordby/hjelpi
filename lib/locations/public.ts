import { createSupabaseAnonServerClient } from '@/lib/supabase/server'

export type PublicLocation = { id: string; name: string; slug: string }

export async function fetchLocationBySlug(
  slug: string,
): Promise<PublicLocation | null> {
  const supabase = createSupabaseAnonServerClient()
  const { data, error } = await supabase
    .from('locations')
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle()
  if (error || !data) return null
  return {
    id: String(data.id),
    name: String(data.name),
    slug: String(data.slug),
  }
}
