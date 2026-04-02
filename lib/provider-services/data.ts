import type { SupabaseClient } from '@supabase/supabase-js'
import { getMarketplaceSubcategoryKeys } from '@/lib/categories/marketplace-subcategory-keys'
import { normalizeFaqFromUnknown } from '@/lib/provider-services/schemas'
import type {
  PricingType,
  ProviderServicePublic,
  ServiceFaqItem,
  TaxonomySubcategoryOption,
} from '@/lib/provider-services/types'

function mapGigFields(r: Record<string, unknown>): {
  searchTags: string[]
  deliveryDays: number | null
  revisionsIncluded: number
  faq: ServiceFaqItem[]
} {
  const tags = r.search_tags
  const searchTags = Array.isArray(tags)
    ? [...new Set(tags.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean))].slice(
        0,
        5,
      )
    : []
  const dd = r.delivery_days
  const deliveryDays = typeof dd === 'number' && Number.isFinite(dd) ? dd : null
  const rev = r.revisions_included
  const revisionsIncluded =
    typeof rev === 'number' && Number.isFinite(rev) ? Math.min(20, Math.max(0, Math.round(rev))) : 1
  const faqRaw = r.faq
  const faq = Array.isArray(faqRaw) ? normalizeFaqFromUnknown(faqRaw) : []
  return { searchTags, deliveryDays, revisionsIncluded, faq }
}

type SubcatJoin = {
  name?: string
  categories?: { name?: string } | { name?: string }[] | null
} | null

function subcategoryLabel(raw: SubcatJoin): string | null {
  if (!raw || typeof raw !== 'object') return null
  const subName = typeof raw.name === 'string' ? raw.name : null
  const catRaw = raw.categories
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw
  const catName = cat && typeof cat === 'object' && typeof cat.name === 'string' ? cat.name : null
  if (catName && subName) return `${catName} · ${subName}`
  return subName ?? catName
}

function mapPricingType(v: unknown): PricingType {
  if (v === 'fixed' || v === 'hourly' || v === 'quote') return v
  return 'fixed'
}

/** Subcategories from DB that also exist on public routes (TAXONOMY / [kategori]/[subkategori]). */
export async function fetchTaxonomySubcategories(
  supabase: SupabaseClient,
): Promise<TaxonomySubcategoryOption[]> {
  const { data, error } = await supabase
    .from('subcategories')
    .select('id, name, slug, default_pricing_type, categories ( name, slug, sort_order )')

  if (error || !data?.length) return []

  type RowWithOrder = TaxonomySubcategoryOption & { categorySortOrder: number }

  const rows: RowWithOrder[] = []
  for (const row of data) {
    const r = row as Record<string, unknown>
    const id = typeof r.id === 'string' ? r.id : null
    const name = typeof r.name === 'string' ? r.name : null
    const slug = typeof r.slug === 'string' ? r.slug : null
    const dpt = mapPricingType(r.default_pricing_type)
    const catRaw = r.categories
    const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw
    if (!id || !name || !slug || !cat || typeof cat !== 'object') continue
    const cn = 'name' in cat && typeof cat.name === 'string' ? cat.name : ''
    const cs = 'slug' in cat && typeof cat.slug === 'string' ? cat.slug : ''
    if (!cn) continue
    const sortOrder =
      'sort_order' in cat && typeof (cat as { sort_order?: number }).sort_order === 'number'
        ? (cat as { sort_order: number }).sort_order
        : 999
    rows.push({
      id,
      name,
      slug,
      categoryName: cn,
      categorySlug: cs,
      defaultPricingType: dpt,
      categorySortOrder: sortOrder,
    })
  }

  const listed = getMarketplaceSubcategoryKeys()
  let onMarketplace = rows.filter((row) => listed.has(`${row.categorySlug}/${row.slug}`))

  // If nothing matched, slugs in DB likely drifted from `lib/categories/taxonomy.ts` — still show DB
  // options so Min side works; `upsertProviderServiceAction` enforces marketplace slugs on save.
  if (onMarketplace.length === 0 && rows.length > 0) {
    onMarketplace = rows
  }

  onMarketplace.sort((a, b) => {
    if (a.categorySortOrder !== b.categorySortOrder) return a.categorySortOrder - b.categorySortOrder
    const catCmp = a.categoryName.localeCompare(b.categoryName, 'nb')
    if (catCmp !== 0) return catCmp
    return a.name.localeCompare(b.name, 'nb')
  })

  return onMarketplace.map(({ categorySortOrder: _o, ...rest }) => rest)
}

export async function fetchFlexibleCancellationPolicyId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data } = await supabase
    .from('cancellation_policies')
    .select('id')
    .eq('type', 'flexible')
    .maybeSingle()
  return data && typeof (data as { id?: string }).id === 'string'
    ? (data as { id: string }).id
    : null
}

export type ProviderServiceSellerRow = ProviderServicePublic & { isActive: boolean }

export async function fetchProviderServicesForSeller(
  supabase: SupabaseClient,
  providerId: string,
): Promise<ProviderServiceSellerRow[]> {
  const { data, error } = await supabase
    .from('provider_services')
    .select(
      `
      id,
      title,
      description,
      pricing_type,
      base_price_ore,
      is_active,
      subcategory_id,
      search_tags,
      delivery_days,
      revisions_included,
      faq,
      subcategories ( id, name, categories ( name ) )
    `,
    )
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => {
    const r = row as Record<string, unknown>
    const rawSub = r.subcategories as SubcatJoin
    const subId =
      typeof r.subcategory_id === 'string'
        ? r.subcategory_id
        : rawSub && typeof rawSub === 'object' && 'id' in rawSub && typeof (rawSub as { id?: unknown }).id === 'string'
          ? (rawSub as { id: string }).id
          : null
    const gig = mapGigFields(r)
    return {
      id: String(r.id),
      title: typeof r.title === 'string' ? r.title : '',
      description: typeof r.description === 'string' ? r.description : null,
      pricingType: mapPricingType(r.pricing_type),
      basePriceOre: typeof r.base_price_ore === 'number' ? r.base_price_ore : null,
      subcategoryLabel: subcategoryLabel(rawSub),
      subcategoryId: subId,
      isActive: Boolean(r.is_active),
      ...gig,
    }
  })
}

export async function fetchPublicProviderServices(
  supabase: SupabaseClient,
  providerId: string,
): Promise<ProviderServicePublic[]> {
  const { data, error } = await supabase
    .from('provider_services')
    .select(
      `
      id,
      title,
      description,
      pricing_type,
      base_price_ore,
      subcategory_id,
      search_tags,
      delivery_days,
      revisions_included,
      faq,
      subcategories ( id, name, categories ( name ) )
    `,
    )
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => {
    const r = row as Record<string, unknown>
    const rawSub = r.subcategories as SubcatJoin
    const subId =
      typeof r.subcategory_id === 'string'
        ? r.subcategory_id
        : rawSub && typeof rawSub === 'object' && 'id' in rawSub && typeof (rawSub as { id?: unknown }).id === 'string'
          ? (rawSub as { id: string }).id
          : null
    const gig = mapGigFields(r)
    return {
      id: String(r.id),
      title: typeof r.title === 'string' ? r.title : '',
      description: typeof r.description === 'string' ? r.description : null,
      pricingType: mapPricingType(r.pricing_type),
      basePriceOre: typeof r.base_price_ore === 'number' ? r.base_price_ore : null,
      subcategoryLabel: subcategoryLabel(rawSub),
      subcategoryId: subId,
      ...gig,
    }
  })
}

export async function fetchPublicProviderServiceById(
  supabase: SupabaseClient,
  providerId: string,
  serviceId: string,
): Promise<ProviderServicePublic | null> {
  const { data, error } = await supabase
    .from('provider_services')
    .select(
      `
      id,
      title,
      description,
      pricing_type,
      base_price_ore,
      subcategory_id,
      search_tags,
      delivery_days,
      revisions_included,
      faq,
      subcategories ( id, name, categories ( name ) )
    `,
    )
    .eq('id', serviceId)
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) return null

  const r = data as Record<string, unknown>
  const rawSub = r.subcategories as SubcatJoin
  const subId =
    typeof r.subcategory_id === 'string'
      ? r.subcategory_id
      : rawSub && typeof rawSub === 'object' && 'id' in rawSub && typeof (rawSub as { id?: unknown }).id === 'string'
        ? (rawSub as { id: string }).id
        : null
  const gig = mapGigFields(r)
  return {
    id: String(r.id),
    title: typeof r.title === 'string' ? r.title : '',
    description: typeof r.description === 'string' ? r.description : null,
    pricingType: mapPricingType(r.pricing_type),
    basePriceOre: typeof r.base_price_ore === 'number' ? r.base_price_ore : null,
    subcategoryLabel: subcategoryLabel(rawSub),
    subcategoryId: subId,
    ...gig,
  }
}
