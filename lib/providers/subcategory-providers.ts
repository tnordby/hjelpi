import { createSupabaseAnonServerClient } from '@/lib/supabase/server'

export type SubcategoryProviderItem = {
  providerId: string
  serviceId: string
  fullName: string
  avatarUrl: string | null
  bio: string | null
  avgRating: number
  totalReviews: number
  totalBookings: number
  isVerified: boolean
  locationName: string | null
  serviceTitle: string
  basePriceOre: number | null
  pricingType: 'fixed' | 'hourly' | 'quote'
}

function num(v: string | number | null | undefined): number {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : Number.parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * Providers offering an active service in the given DB category + subcategory slugs.
 * Returns one row per provider (best avg_rating if multiple services).
 */
export async function fetchProvidersForSubcategory(
  categorySlug: string,
  subcategorySlug: string,
): Promise<SubcategoryProviderItem[]> {
  try {
    const supabase = createSupabaseAnonServerClient()

    const { data: category, error: catErr } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle()

    if (catErr || !category) return []

    const { data: sub, error: subErr } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', category.id)
      .eq('slug', subcategorySlug)
      .maybeSingle()

    if (subErr || !sub) return []

    const { data: rows, error } = await supabase
      .from('provider_services')
      .select(
        `
        id,
        title,
        base_price_ore,
        pricing_type,
        providers!inner (
          id,
          avg_rating,
          total_reviews,
          total_bookings,
          is_verified,
          bio,
          locations (name),
          profiles!inner (full_name, avatar_url, deleted_at)
        )
      `,
      )
      .eq('subcategory_id', sub.id)
      .eq('is_active', true)

    if (error || !rows?.length) return []

    const mapped: SubcategoryProviderItem[] = []

    for (const row of rows) {
      const r = row as Record<string, unknown>
      const rawPr = r.providers
      const pr = Array.isArray(rawPr) ? rawPr[0] : rawPr
      if (!pr || typeof pr !== 'object') continue

      const p = pr as Record<string, unknown>
      const rawProf = p.profiles
      const prof = Array.isArray(rawProf) ? rawProf[0] : rawProf
      if (!prof || typeof prof !== 'object') continue

      const profile = prof as Record<string, unknown>
      if (profile.deleted_at != null) continue
      const fullName = profile.full_name
      if (typeof fullName !== 'string' || !fullName.trim()) continue

      const pricingType = r.pricing_type as SubcategoryProviderItem['pricingType']
      if (pricingType !== 'fixed' && pricingType !== 'hourly' && pricingType !== 'quote') {
        continue
      }

      const rawLoc = p.locations
      const loc = Array.isArray(rawLoc) ? rawLoc[0] : rawLoc
      const locationName =
        loc && typeof loc === 'object' && 'name' in loc && typeof (loc as { name: unknown }).name === 'string'
          ? (loc as { name: string }).name
          : null

      mapped.push({
        providerId: String(p.id),
        serviceId: String(r.id),
        fullName,
        avatarUrl: typeof profile.avatar_url === 'string' ? profile.avatar_url : null,
        bio: typeof p.bio === 'string' ? p.bio : null,
        avgRating: num(p.avg_rating as string | number | null),
        totalReviews: typeof p.total_reviews === 'number' ? p.total_reviews : 0,
        totalBookings: typeof p.total_bookings === 'number' ? p.total_bookings : 0,
        isVerified: Boolean(p.is_verified),
        locationName,
        serviceTitle: typeof r.title === 'string' ? r.title : 'Tjeneste',
        basePriceOre: typeof r.base_price_ore === 'number' ? r.base_price_ore : null,
        pricingType,
      })
    }

    const byProvider = new Map<string, SubcategoryProviderItem>()
    for (const item of mapped) {
      const existing = byProvider.get(item.providerId)
      if (!existing) {
        byProvider.set(item.providerId, item)
        continue
      }
      if (item.avgRating > existing.avgRating) {
        byProvider.set(item.providerId, item)
      } else if (item.avgRating === existing.avgRating && item.totalReviews > existing.totalReviews) {
        byProvider.set(item.providerId, item)
      }
    }

    const list = Array.from(byProvider.values())
    list.sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating
      return b.totalReviews - a.totalReviews
    })

    return list
  } catch {
    return []
  }
}
