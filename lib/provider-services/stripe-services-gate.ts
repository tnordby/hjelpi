import type { SupabaseClient } from '@supabase/supabase-js'
import { refreshProviderStripeOnboardedIfReady } from '@/lib/stripe/refresh-connect-status'
import { getStripe } from '@/lib/stripe/server'

/**
 * When Stripe is configured, sellers must have Connect set up before creating or
 * editing services (same bar as paid checkout). If `STRIPE_SECRET_KEY` is unset,
 * the gate passes so local dev without Stripe still works.
 */
export async function ensureProviderCanPublishServices(
  supabase: SupabaseClient,
  providerId: string,
): Promise<{ ok: true } | { ok: false; code: 'payments_not_ready' }> {
  const stripe = getStripe()
  if (!stripe) return { ok: true }

  const { data: row, error } = await supabase
    .from('providers')
    .select('stripe_account_id, stripe_onboarded')
    .eq('id', providerId)
    .maybeSingle()

  if (error || !row) return { ok: false, code: 'payments_not_ready' }

  let accountId =
    typeof row.stripe_account_id === 'string' && row.stripe_account_id.length > 0
      ? row.stripe_account_id
      : null
  let onboarded = Boolean(row.stripe_onboarded)

  if (accountId && !onboarded) {
    try {
      if (await refreshProviderStripeOnboardedIfReady(stripe, accountId)) onboarded = true
    } catch {
      /* keep onboarded false */
    }
  }

  if (!accountId || !onboarded) return { ok: false, code: 'payments_not_ready' }
  return { ok: true }
}
