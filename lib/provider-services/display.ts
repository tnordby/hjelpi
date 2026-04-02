import type { PricingType } from '@/lib/provider-services/types'

/** Short price label for listings (matches subcategory provider cards). */
export function formatServicePriceLabel(ore: number | null, pricingType: PricingType): string | null {
  if (pricingType === 'quote' || ore == null) return null
  const kr = ore / 100
  const formatted = new Intl.NumberFormat('nb-NO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kr)
  if (pricingType === 'hourly') return `fra ${formatted} kr/t`
  return `fra ${formatted} kr`
}

/** Full-line label for profile / service page. */
export function formatServicePriceLong(ore: number | null, pricingType: PricingType): string {
  if (pricingType === 'quote') return 'Pris etter avtale'
  if (ore == null) return 'Pris ikke satt'
  const kr = ore / 100
  const formatted = new Intl.NumberFormat('nb-NO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kr)
  if (pricingType === 'hourly') return `${formatted} kr per time`
  return `${formatted} kr (fast pris)`
}
