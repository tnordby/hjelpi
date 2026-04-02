import { TAXONOMY } from '@/lib/categories/taxonomy'

let cached: Set<string> | null = null

/** `categorySlug/subSlug` pairs that have public routes under /[kategori]/[subkategori]. */
export function getMarketplaceSubcategoryKeys(): Set<string> {
  if (cached) return cached
  const keys = new Set<string>()
  for (const c of TAXONOMY) {
    for (const s of c.subs) {
      keys.add(`${c.slug}/${s.slug}`)
    }
  }
  cached = keys
  return keys
}

export function isMarketplaceSubcategory(categorySlug: string, subSlug: string): boolean {
  return getMarketplaceSubcategoryKeys().has(`${categorySlug}/${subSlug}`)
}
