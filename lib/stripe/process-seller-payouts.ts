import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { netSellerOre } from '@/lib/dashboard/money'

export type PendingConnectPayoutRow = {
  booking_id: string
  stripe_payment_intent_id: string
  stripe_account_id: string
  base_amount_ore: number
  seller_fee_ore: number
}

export type ProcessSellerPayoutsResult = {
  processed: number
  failed: number
  errors: string[]
}

/**
 * Transfer net seller amount (base − seller platform fee) to each provider's Connect account.
 * Idempotent per booking via Stripe idempotency key. Call from a secured cron only.
 */
export async function processPendingSellerConnectPayouts(
  stripe: Stripe,
  supabase: SupabaseClient,
  options?: { limit?: number },
): Promise<ProcessSellerPayoutsResult> {
  const limit = options?.limit ?? 50
  const errors: string[] = []
  let processed = 0
  let failed = 0

  const { data: rows, error: rpcErr } = await supabase.rpc('bookings_pending_seller_connect_payout', {
    p_limit: limit,
  })

  if (rpcErr) {
    return { processed: 0, failed: 0, errors: [`rpc: ${rpcErr.message}`] }
  }

  const list = (rows ?? []) as PendingConnectPayoutRow[]
  for (const row of list) {
    const bookingId = row.booking_id
    const destination = row.stripe_account_id?.trim()
    if (!destination) {
      failed += 1
      errors.push(`${bookingId}: missing stripe_account_id`)
      continue
    }

    const amount = netSellerOre(row.base_amount_ore, row.seller_fee_ore)
    if (amount < 1) {
      failed += 1
      errors.push(`${bookingId}: net amount ${amount} < 1 øre`)
      continue
    }

    try {
      const transfer = await stripe.transfers.create(
        {
          amount,
          currency: 'nok',
          destination,
          metadata: {
            booking_id: bookingId,
            stripe_payment_intent_id: row.stripe_payment_intent_id,
          },
        },
        { idempotencyKey: `hjelpi_seller_payout_${bookingId}` },
      )

      const { error: updErr } = await supabase
        .from('bookings')
        .update({
          stripe_connect_transfer_id: transfer.id,
          seller_payout_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .is('stripe_connect_transfer_id', null)

      if (updErr) {
        failed += 1
        errors.push(`${bookingId}: db update failed: ${updErr.message}`)
        continue
      }

      processed += 1
    } catch (e) {
      failed += 1
      const msg = e instanceof Error ? e.message : String(e)
      errors.push(`${bookingId}: ${msg}`)
    }
  }

  return { processed, failed, errors }
}
