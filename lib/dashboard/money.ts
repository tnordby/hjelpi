/** Amounts in DB are stored in øre (NOK × 100). */
export function formatOreToNok(ore: number): string {
  return new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ore / 100)
}

/** Net to seller after platform fee (schema: base − seller_fee). */
export function netSellerOre(baseAmountOre: number, sellerFeeOre: number): number {
  return Math.max(0, baseAmountOre - sellerFeeOre)
}

/** Label for aggregated earnings rows (month key `YYYY-MM`, year key `YYYY`). */
export function formatEarningsPeriodLabel(
  periodKey: string,
  granularity: 'month' | 'year',
): string {
  if (granularity === 'year') return periodKey
  const [yStr, mStr] = periodKey.split('-')
  const y = Number(yStr)
  const m = Number(mStr)
  if (!Number.isFinite(y) || !Number.isFinite(m)) return periodKey
  return new Intl.DateTimeFormat('no-NO', { month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, 1),
  )
}
