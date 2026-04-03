/** `locations` embed from `providers` select (Supabase may return object or single-element array). */
export function providerLocationName(locationsRelation: unknown): string | null {
  if (locationsRelation == null) return null
  const loc = Array.isArray(locationsRelation) ? locationsRelation[0] : locationsRelation
  if (!loc || typeof loc !== 'object') return null
  const name = 'name' in loc ? String((loc as { name: unknown }).name).trim() : ''
  return name.length > 0 ? name : null
}
