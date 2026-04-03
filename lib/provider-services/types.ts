export type PricingType = 'fixed' | 'hourly' | 'quote'

export type TaxonomySubcategoryOption = {
  id: string
  name: string
  slug: string
  categoryName: string
  categorySlug: string
  defaultPricingType: PricingType
}

export type ServiceFaqItem = { q: string; a: string }

export type ProviderServicePublic = {
  id: string
  title: string
  description: string | null
  pricingType: PricingType
  basePriceOre: number | null
  subcategoryLabel: string | null
  subcategoryId: string | null
  /** DB slugs/names for marketplace breadcrumbs (null if join missing). */
  marketplaceCategorySlug: string | null
  marketplaceSubcategorySlug: string | null
  marketplaceCategoryName: string | null
  marketplaceSubcategoryName: string | null
  searchTags: string[]
  deliveryDays: number | null
  revisionsIncluded: number
  faq: ServiceFaqItem[]
}
