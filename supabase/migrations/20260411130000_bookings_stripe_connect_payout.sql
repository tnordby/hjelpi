-- Deferred Connect payouts: customer pays the platform; net seller amount is transferred
-- to the provider's Stripe Connect account the calendar day after scheduled_at (Europe/Oslo).

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_connect_transfer_id text,
  ADD COLUMN IF NOT EXISTS seller_payout_at timestamptz;

COMMENT ON COLUMN public.bookings.stripe_connect_transfer_id IS 'Stripe Transfer id (tr_...) to connected account after service day';
COMMENT ON COLUMN public.bookings.seller_payout_at IS 'When the Connect transfer was created';

CREATE OR REPLACE FUNCTION public.booking_seller_payout_oslo_eligible(p_scheduled_at timestamptz, p_now timestamptz DEFAULT now())
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT (timezone('Europe/Oslo', p_now))::date > (timezone('Europe/Oslo', p_scheduled_at))::date;
$$;

-- Candidates for Connect transfer (service role / cron only).
CREATE OR REPLACE FUNCTION public.bookings_pending_seller_connect_payout(p_limit int DEFAULT 50)
RETURNS TABLE (
  booking_id uuid,
  stripe_payment_intent_id text,
  stripe_account_id text,
  base_amount_ore int,
  seller_fee_ore int
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id,
    b.stripe_payment_intent_id,
    p.stripe_account_id,
    b.base_amount_ore,
    b.seller_fee_ore
  FROM public.bookings b
  INNER JOIN public.provider_services ps ON ps.id = b.provider_service_id
  INNER JOIN public.providers p ON p.id = ps.provider_id
  WHERE b.stripe_payment_intent_id IS NOT NULL
    AND b.stripe_connect_transfer_id IS NULL
    AND b.status IN ('confirmed', 'completed')
    AND p.stripe_account_id IS NOT NULL
    AND length(trim(p.stripe_account_id)) > 0
    AND p.stripe_onboarded IS TRUE
    AND public.booking_seller_payout_oslo_eligible(b.scheduled_at, now())
  ORDER BY b.scheduled_at ASC
  LIMIT greatest(1, least(coalesce(p_limit, 50), 200));
$$;

REVOKE ALL ON FUNCTION public.booking_seller_payout_oslo_eligible(timestamptz, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bookings_pending_seller_connect_payout(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.booking_seller_payout_oslo_eligible(timestamptz, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.bookings_pending_seller_connect_payout(int) TO service_role;
