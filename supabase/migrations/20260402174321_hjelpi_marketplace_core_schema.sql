-- Hjelpi marketplace core schema (see .cursor/architecture.mdc + security.mdc)
-- Applied via Supabase MCP; version matches remote migration name.

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

CREATE TYPE public.user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE public.pricing_type AS ENUM ('fixed', 'hourly', 'quote');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'disputed');
CREATE TYPE public.notification_type AS ENUM (
  'booking_request', 'booking_confirmed', 'booking_cancelled',
  'quote_received', 'quote_accepted', 'quote_declined', 'quote_expired',
  'review_request', 'review_posted', 'message_received',
  'payout_sent', 'verification_approved', 'verification_rejected',
  'dispute_opened', 'dispute_resolved'
);
CREATE TYPE public.cancellation_policy_type AS ENUM ('flexible', 'moderate', 'strict');
CREATE TYPE public.day_of_week AS ENUM ('mon','tue','wed','thu','fri','sat','sun');

CREATE TABLE public.locations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  kommune_nr    text UNIQUE NOT NULL,
  fylke         text NOT NULL,
  lat           double precision NOT NULL,
  lng           double precision NOT NULL,
  geom          extensions.geometry(Point, 4326)
);

CREATE TABLE public.profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text NOT NULL,
  avatar_url      text,
  phone           text,
  role            public.user_role NOT NULL DEFAULT 'buyer',
  active_mode     public.user_role NOT NULL DEFAULT 'buyer',
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.providers (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id            uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_id           uuid REFERENCES public.locations(id),
  bio                   text,
  service_radius_km     int NOT NULL DEFAULT 20,
  avg_rating            numeric(3,2) DEFAULT 0,
  total_reviews         int DEFAULT 0,
  total_bookings        int DEFAULT 0,
  response_rate         numeric(5,2) DEFAULT 0,
  typical_response_min  int,
  is_verified           boolean NOT NULL DEFAULT false,
  stripe_account_id     text,
  stripe_onboarded      boolean NOT NULL DEFAULT false,
  vat_registered        boolean NOT NULL DEFAULT false,
  vat_number            text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text UNIQUE NOT NULL,
  icon_name  text,
  sort_order int DEFAULT 0
);

CREATE TABLE public.subcategories (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id              uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name                     text NOT NULL,
  slug                     text NOT NULL,
  default_pricing_type     public.pricing_type NOT NULL DEFAULT 'fixed',
  UNIQUE (category_id, slug)
);

CREATE TABLE public.cancellation_policies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        public.cancellation_policy_type UNIQUE NOT NULL,
  name        text NOT NULL,
  description text NOT NULL,
  rules       jsonb NOT NULL
);

CREATE TABLE public.provider_services (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id             uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  subcategory_id          uuid REFERENCES public.subcategories(id),
  cancellation_policy_id  uuid REFERENCES public.cancellation_policies(id),
  title                   text NOT NULL,
  description             text,
  pricing_type            public.pricing_type NOT NULL,
  base_price_ore          int,
  instant_book            boolean NOT NULL DEFAULT false,
  is_active               boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.availability_slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  day         public.day_of_week NOT NULL,
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  UNIQUE (provider_id, day, start_time)
);

CREATE TABLE public.availability_exceptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  date          date NOT NULL,
  is_blocked    boolean NOT NULL DEFAULT true,
  start_time    time,
  end_time      time,
  reason        text,
  UNIQUE (provider_id, date)
);

CREATE TABLE public.bookings (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id                 uuid NOT NULL REFERENCES public.profiles(id),
  provider_service_id      uuid NOT NULL REFERENCES public.provider_services(id),
  cancellation_policy_id   uuid REFERENCES public.cancellation_policies(id),
  status                   public.booking_status NOT NULL DEFAULT 'pending',
  scheduled_at             timestamptz NOT NULL,
  duration_minutes         int,
  total_amount_ore         int NOT NULL,
  base_amount_ore          int NOT NULL,
  buyer_fee_ore            int NOT NULL,
  seller_fee_ore           int NOT NULL,
  stripe_payment_intent_id text,
  cancelled_at             timestamptz,
  cancelled_by             uuid REFERENCES public.profiles(id),
  cancellation_reason      text,
  refund_amount_ore        int,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid NOT NULL REFERENCES public.bookings(id),
  reviewer_id   uuid NOT NULL REFERENCES public.profiles(id),
  provider_id   uuid NOT NULL REFERENCES public.providers(id),
  rating        smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  is_public     boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, reviewer_id)
);

CREATE TABLE public.messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES public.profiles(id),
  body        text NOT NULL,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        public.notification_type NOT NULL,
  data        jsonb NOT NULL DEFAULT '{}',
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.saved_providers (
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, provider_id)
);

CREATE TABLE public.deletion_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id),
  requested_at  timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz,
  status        text NOT NULL DEFAULT 'pending'
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), 'Bruker')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_public_read" ON public.locations FOR SELECT USING (true);

CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT
  USING (deleted_at IS NULL OR auth.uid() = user_id);
CREATE POLICY "profiles_own_insert" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "providers_public_read" ON public.providers FOR SELECT USING (true);
CREATE POLICY "providers_own_insert" ON public.providers FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));
CREATE POLICY "providers_own_update" ON public.providers FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "subcategories_public_read" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "cancellation_policies_public_read" ON public.cancellation_policies FOR SELECT USING (true);

CREATE POLICY "services_public_read" ON public.provider_services FOR SELECT USING (true);
CREATE POLICY "services_own_write" ON public.provider_services FOR ALL
  USING (auth.uid() = (SELECT p.user_id FROM public.profiles p
    JOIN public.providers pr ON pr.profile_id = p.id
    WHERE pr.id = provider_id))
  WITH CHECK (auth.uid() = (SELECT p.user_id FROM public.profiles p
    JOIN public.providers pr ON pr.profile_id = p.id
    WHERE pr.id = provider_id));

CREATE POLICY "bookings_participant_read" ON public.bookings FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.profiles WHERE id = buyer_id)
    OR auth.uid() = (SELECT p.user_id FROM public.profiles p
      JOIN public.providers pr ON pr.profile_id = p.id
      JOIN public.provider_services ps ON ps.provider_id = pr.id
      WHERE ps.id = provider_service_id)
  );
CREATE POLICY "bookings_admin_read" ON public.bookings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "bookings_buyer_insert" ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = buyer_id));

CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_own_insert" ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = reviewer_id));

CREATE POLICY "messages_participant_read" ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.profiles buyer ON buyer.id = b.buyer_id
    WHERE b.id = messages.booking_id AND buyer.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.provider_services ps ON ps.id = b.provider_service_id
    JOIN public.providers pr ON pr.id = ps.provider_id
    JOIN public.profiles seller ON seller.id = pr.profile_id
    WHERE b.id = messages.booking_id AND seller.user_id = auth.uid()
  )
);
CREATE POLICY "messages_participant_insert" ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = sender_id)
  AND (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.profiles buyer ON buyer.id = b.buyer_id
      WHERE b.id = booking_id AND buyer.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.provider_services ps ON ps.id = b.provider_service_id
      JOIN public.providers pr ON pr.id = ps.provider_id
      JOIN public.profiles seller ON seller.id = pr.profile_id
      WHERE b.id = booking_id AND seller.user_id = auth.uid()
    )
  )
);

CREATE POLICY "notifications_own_read" ON public.notifications FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id));
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id));

CREATE POLICY "saved_own_all" ON public.saved_providers FOR ALL
  USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

CREATE POLICY "deletion_own_insert" ON public.deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "availability_public_read" ON public.availability_slots FOR SELECT USING (true);
CREATE POLICY "exceptions_public_read" ON public.availability_exceptions FOR SELECT USING (true);
CREATE POLICY "availability_own_write" ON public.availability_slots FOR ALL
  USING (auth.uid() = (
    SELECT p.user_id FROM public.profiles p
    JOIN public.providers pr ON pr.profile_id = p.id
    WHERE pr.id = provider_id
  ))
  WITH CHECK (auth.uid() = (
    SELECT p.user_id FROM public.profiles p
    JOIN public.providers pr ON pr.profile_id = p.id
    WHERE pr.id = provider_id
  ));
CREATE POLICY "exceptions_own_write" ON public.availability_exceptions FOR ALL
  USING (auth.uid() = (
    SELECT p.user_id FROM public.profiles p
    JOIN public.providers pr ON pr.profile_id = p.id
    WHERE pr.id = provider_id
  ))
  WITH CHECK (auth.uid() = (
    SELECT p.user_id FROM public.profiles p
    JOIN public.providers pr ON pr.profile_id = p.id
    WHERE pr.id = provider_id
  ));

INSERT INTO public.cancellation_policies (type, name, description, rules) VALUES
  ('flexible', 'Fleksibel',
   'Full refusjon opptil 24 timer før avtalt start; ingen refusjon etter.',
   '[{"hours_before": 24, "refund_percent": 100}, {"hours_before": 0, "refund_percent": 0}]'::jsonb),
  ('moderate', 'Moderat',
   'Full refusjon opptil 48t før; 50% refusjon 24–48t før; ingen refusjon innen 24t.',
   '[{"hours_before": 48, "refund_percent": 100}, {"hours_before": 24, "refund_percent": 50}, {"hours_before": 0, "refund_percent": 0}]'::jsonb),
  ('strict', 'Streng',
   'Ingen refusjon etter at bestilling er bekreftet.',
   '[{"hours_before": null, "refund_percent": 0}]'::jsonb);
