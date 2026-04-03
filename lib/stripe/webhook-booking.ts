import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { legacyPlatformFeesFromSubtotalOre, platformFeesFromBaseOre } from '@/lib/stripe/fees'

/**
 * Mark booking paid after Checkout. Idempotent if stripe_payment_intent_id already set.
 * Call only when payment_status is `paid` (not for unpaid async checkouts on `completed`).
 */
export async function finalizePaidBookingFromCheckoutSession(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (session.mode !== 'payment') return { ok: false, reason: 'wrong_mode' }
  if (session.payment_status !== 'paid') return { ok: false, reason: 'not_paid' }

  const bookingId = session.metadata?.booking_id
  if (!bookingId) return { ok: false, reason: 'missing_metadata' }

  const pi = session.payment_intent
  const piId = typeof pi === 'string' ? pi : pi?.id
  if (!piId) return { ok: false, reason: 'missing_pi' }

  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, status, stripe_payment_intent_id, total_amount_ore, base_amount_ore, buyer_fee_ore, seller_fee_ore')
    .eq('id', bookingId)
    .maybeSingle()

  if (fetchErr || !booking) return { ok: false, reason: 'booking_not_found' }
  if (booking.stripe_payment_intent_id) return { ok: true }
  if (booking.status !== 'pending') return { ok: false, reason: 'bad_status' }

  const amountTotal = session.amount_total
  if (amountTotal == null || session.currency?.toLowerCase() !== 'nok') {
    return { ok: false, reason: 'amount_mismatch' }
  }
  if (amountTotal !== booking.total_amount_ore) {
    return { ok: false, reason: 'amount_mismatch' }
  }

  const base = booking.base_amount_ore as number
  const buyerFee = booking.buyer_fee_ore as number
  const recomputed =
    buyerFee > 0 ? legacyPlatformFeesFromSubtotalOre(base) : platformFeesFromBaseOre(base)
  if (
    recomputed.total_amount_ore !== booking.total_amount_ore ||
    recomputed.buyer_fee_ore !== booking.buyer_fee_ore ||
    recomputed.seller_fee_ore !== booking.seller_fee_ore
  ) {
    return { ok: false, reason: 'corrupt_amounts' }
  }

  const { error: updErr } = await supabase
    .from('bookings')
    .update({ stripe_payment_intent_id: piId, status: 'confirmed' })
    .eq('id', bookingId)
    .eq('status', 'pending')
    .is('stripe_payment_intent_id', null)

  if (updErr) return { ok: false, reason: 'update_failed' }
  return { ok: true }
}
