import Stripe from 'stripe'

let stripeSingleton: Stripe | null = null

export function getStripeSecretKey(): string | null {
  const k = process.env.STRIPE_SECRET_KEY?.trim()
  return k && k.length > 0 ? k : null
}

/** Server-only Stripe client. Returns null if STRIPE_SECRET_KEY is unset. */
export function getStripe(): Stripe | null {
  const key = getStripeSecretKey()
  if (!key) return null
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return stripeSingleton
}
