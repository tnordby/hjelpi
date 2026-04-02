import type { PricingType } from '@/lib/provider-services/types'

/** Match server-side logic in `createBookingRequestAction`. */
export function computeBaseAmountOre(
  pricingType: PricingType,
  basePriceOre: number | null,
  durationMinutes: number | null,
): number | null {
  if (pricingType === 'quote') return 0
  if (basePriceOre == null || basePriceOre <= 0) return null
  if (pricingType === 'fixed') return basePriceOre
  if (pricingType === 'hourly') {
    if (durationMinutes == null || durationMinutes <= 0) return null
    return Math.round((basePriceOre * durationMinutes) / 60)
  }
  return null
}
