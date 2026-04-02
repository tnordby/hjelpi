/**
 * Platform fee model (see .cursor/product.mdc).
 * 12% buyer-side fee on top of base; 3% seller-side fee deducted from payout.
 * Amounts in øre; use integer math via basis points.
 */
export const BUYER_FEE_BPS = 1200
export const SELLER_FEE_BPS = 300

export type BookingAmountsOre = {
  base_amount_ore: number
  buyer_fee_ore: number
  seller_fee_ore: number
  total_amount_ore: number
}

/** Derive stored booking amounts from the provider’s base (subtotal) in øre. */
export function platformFeesFromBaseOre(baseAmountOre: number): BookingAmountsOre {
  const base = Math.max(0, Math.round(baseAmountOre))
  const buyer_fee_ore = Math.round((base * BUYER_FEE_BPS) / 10_000)
  const seller_fee_ore = Math.round((base * SELLER_FEE_BPS) / 10_000)
  const total_amount_ore = base + buyer_fee_ore
  return {
    base_amount_ore: base,
    buyer_fee_ore,
    seller_fee_ore,
    total_amount_ore,
  }
}
