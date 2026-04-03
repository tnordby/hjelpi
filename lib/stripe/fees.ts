/**
 * Customer pays the listed amount (gross). The marketplace fee is a share of that total;
 * the seller receives gross − fee (e.g. 100 NOK − 15 NOK = 85 NOK at 15%).
 * Amounts in øre; integer math via basis points.
 */
export const PLATFORM_FEE_BPS = 1500

export type BookingAmountsOre = {
  base_amount_ore: number
  buyer_fee_ore: number
  seller_fee_ore: number
  total_amount_ore: number
}

/**
 * @param listedGrossOre Provider’s price for the booking — same as what the customer pays.
 */
export function platformFeesFromBaseOre(listedGrossOre: number): BookingAmountsOre {
  const gross = Math.max(0, Math.round(listedGrossOre))
  const seller_fee_ore = Math.round((gross * PLATFORM_FEE_BPS) / 10_000)
  return {
    base_amount_ore: gross,
    buyer_fee_ore: 0,
    seller_fee_ore,
    total_amount_ore: gross,
  }
}

/**
 * Old model: buyer fee on top of subtotal + separate seller fee on subtotal.
 * Used only to verify webhooks for rows where `buyer_fee_ore` > 0.
 */
export function legacyPlatformFeesFromSubtotalOre(subtotalOre: number): BookingAmountsOre {
  const base = Math.max(0, Math.round(subtotalOre))
  const buyer_fee_ore = Math.round((base * 1200) / 10_000)
  const seller_fee_ore = Math.round((base * 300) / 10_000)
  return {
    base_amount_ore: base,
    buyer_fee_ore,
    seller_fee_ore,
    total_amount_ore: base + buyer_fee_ore,
  }
}
