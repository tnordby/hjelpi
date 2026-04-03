import { getStripe } from '@/lib/stripe/server'
import { processPendingSellerConnectPayouts } from '@/lib/stripe/process-seller-payouts'
import { createSupabaseServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * Secured cron: transfer net seller funds to Stripe Connect after the service calendar day (Oslo).
 *
 * Vercel: add CRON_SECRET in project env; schedule hits this route with
 * Authorization: Bearer <CRON_SECRET>.
 *
 * Manual: curl -H "Authorization: Bearer $CRON_SECRET" "$BASE/api/cron/process-seller-payouts"
 */
export async function GET(req: Request) {
  return run(req)
}

export async function POST(req: Request) {
  return run(req)
}

async function run(req: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    return Response.json({ ok: false, error: 'CRON_SECRET not configured' }, { status: 503 })
  }

  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const stripe = getStripe()
  if (!stripe) {
    return Response.json({ ok: false, error: 'Stripe not configured' }, { status: 503 })
  }

  try {
    const supabase = createSupabaseServiceRoleClient()
    const result = await processPendingSellerConnectPayouts(stripe, supabase, { limit: 50 })
    return Response.json({ ok: true, ...result })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return Response.json({ ok: false, error: message }, { status: 500 })
  }
}
