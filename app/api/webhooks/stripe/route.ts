import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabase/service-role'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Stripe → Developers → Webhooks → Add endpoint:
 * URL: {NEXT_PUBLIC_BASE_URL}/api/webhooks/stripe
 * Events: account.updated (add payment_intent.* when checkout ships)
 */
export async function POST(req: Request) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!stripe || !webhookSecret) {
    return new Response('Stripe webhook not configured', { status: 503 })
  }

  const body = await req.text()
  const headerStore = await headers()
  const sig = headerStore.get('stripe-signature')
  if (!sig) {
    return new Response('Missing stripe-signature', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account
    const ready =
      account.charges_enabled === true &&
      account.payouts_enabled === true &&
      account.details_submitted === true

    try {
      const supabase = createSupabaseServiceRoleClient()
      const { error } = await supabase
        .from('providers')
        .update({ stripe_onboarded: ready })
        .eq('stripe_account_id', account.id)

      if (error) {
        return new Response('Database update failed', { status: 500 })
      }
    } catch {
      return new Response('Server configuration error', { status: 500 })
    }
  }

  return Response.json({ received: true })
}
