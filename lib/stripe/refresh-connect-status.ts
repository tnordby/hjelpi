import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseServiceRoleClient } from '@/lib/supabase/service-role'

/** Same readiness rule as `/api/webhooks/stripe` `account.updated`. */
export function stripeConnectExpressAccountReady(account: Stripe.Account): boolean {
  return (
    account.charges_enabled === true &&
    account.payouts_enabled === true &&
    account.details_submitted === true
  )
}

/**
 * Pull latest Connect status from Stripe and persist `providers.stripe_onboarded`.
 * Call when the user returns from Stripe Hosted Onboarding (webhooks can lag).
 */
export async function syncProviderStripeOnboardedFromStripe(
  supabase: SupabaseClient,
  stripe: Stripe,
  providerId: string,
  stripeAccountId: string,
): Promise<{ ok: boolean; ready: boolean }> {
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId)
    const ready = stripeConnectExpressAccountReady(account)
    const { error } = await supabase
      .from('providers')
      .update({ stripe_onboarded: ready })
      .eq('id', providerId)
      .eq('stripe_account_id', stripeAccountId)

    if (error) {
      console.warn('[stripe] sync connect onboarded:', error.message)
      return { ok: false, ready }
    }
    return { ok: true, ready }
  } catch (e) {
    console.warn('[stripe] sync connect onboarded: retrieve failed', e)
    return { ok: false, ready: false }
  }
}

/**
 * If Stripe says the Connect account can charge and receive payouts, persist
 * `stripe_onboarded` (same rules as `/api/webhooks/stripe` account.updated).
 * Use when webhooks are missing or delayed (e.g. local dev).
 */
export async function refreshProviderStripeOnboardedIfReady(
  stripe: Stripe,
  stripeAccountId: string,
): Promise<boolean> {
  const account = await stripe.accounts.retrieve(stripeAccountId)
  if (!stripeConnectExpressAccountReady(account)) return false

  const supabase = createSupabaseServiceRoleClient()
  const { error } = await supabase
    .from('providers')
    .update({ stripe_onboarded: true })
    .eq('stripe_account_id', stripeAccountId)

  if (error) {
    console.warn('[stripe] refresh connect: failed to update providers', error.message)
    return false
  }
  return true
}
