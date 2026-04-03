/** Calendar-day rule for releasing seller funds (matches DB `booking_seller_payout_oslo_eligible`). */
const OSLO = 'Europe/Oslo'

function osloYmd(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: OSLO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function isSellerPayoutOsloCalendarEligible(scheduledAtIso: string, now: Date = new Date()): boolean {
  const scheduled = new Date(scheduledAtIso)
  if (Number.isNaN(scheduled.getTime())) return false
  return osloYmd(now) > osloYmd(scheduled)
}
