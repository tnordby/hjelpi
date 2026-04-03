import type Stripe from 'stripe'
import type { BookingAmountsOre } from '@/lib/stripe/fees'
import { absoluteAppUrl } from '@/lib/url/app-base'

export type BookingCheckoutSessionParams = {
  bookingId: string
  serviceTitle: string
  amounts: BookingAmountsOre
  connectedAccountId: string
  customerEmail: string | null
  locale: string
}

export async function createBookingCheckoutSession(
  stripe: Stripe,
  p: BookingCheckoutSessionParams,
): Promise<Stripe.Checkout.Session> {
  const name = p.serviceTitle.trim().slice(0, 250) || 'Hjelpi'

  const basePath = '/min-side/kunde/bestillinger'
  const successUrl = `${absoluteAppUrl(p.locale, basePath)}?betaling=ok&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${absoluteAppUrl(p.locale, basePath)}?betaling=avbrutt`

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'nok',
          product_data: { name },
          unit_amount: p.amounts.total_amount_ore,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: p.customerEmail ?? undefined,
    client_reference_id: p.bookingId,
    metadata: { booking_id: p.bookingId, connect_account_id: p.connectedAccountId },
    payment_intent_data: {
      metadata: { booking_id: p.bookingId, connect_account_id: p.connectedAccountId },
    },
  })
}
