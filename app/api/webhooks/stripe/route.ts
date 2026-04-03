import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/server'
import { stripeConnectExpressAccountReady } from '@/lib/stripe/refresh-connect-status'
import { finalizePaidBookingFromCheckoutSession } from '@/lib/stripe/webhook-booking'
import { createSupabaseServiceRoleClient } from '@/lib/supabase/service-role'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Stripe → Developers → Webhooks → Add endpoint:
 * URL: {NEXT_PUBLIC_BASE_URL}/api/webhooks/stripe
 * Events: account.updated, checkout.session.completed, checkout.session.async_payment_succeeded
 * (Checkout charges the platform; seller net is transferred via /api/cron/process-seller-payouts after service day.)
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

  try {
    const supabase = createSupabaseServiceRoleClient()

    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account
      const ready = stripeConnectExpressAccountReady(account)

      const { error } = await supabase
        .from('providers')
        .update({ stripe_onboarded: ready })
        .eq('stripe_account_id', account.id)

      if (error) {
        return new Response('Database update failed', { status: 500 })
      }
    }

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session
      const result = await finalizePaidBookingFromCheckoutSession(supabase, session)
      if (!result.ok && result.reason !== 'not_paid') {
        console.warn('[stripe webhook] booking finalize skipped', result.reason, session.id)
      }
    }
  } catch {
    return new Response('Server configuration error', { status: 500 })
  }

  return Response.json({ received: true })
}
