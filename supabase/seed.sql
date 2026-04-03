-- =============================================================================
-- Hjelpi — demo auth users, providers, and services (local / QA only)
-- =============================================================================
-- Kommuner for `public.locations` kommer fra migrasjon
-- `20260409180000_seed_locations_norway_kommuner.sql` (kjør alle migrasjoner før seed).
-- =============================================================================
-- Run after all migrations, e.g.:
--   supabase db reset
-- or paste into Supabase SQL Editor (service role / postgres).
--
-- Log in via e-post + passord (magic link not seeded):
--   demo-hjelper-renhold@test.hjelpi.local   — seller (renhold)
--   demo-hjelper-foto@test.hjelpi.local      — seller (fotografi)
--   demo-kunde@test.hjelpi.local             — buyer (book the helpers)
-- Password for all three:  DemoHjelpi2026!
--
-- Profil-URL i appen er ALLTID: /{locale}/hjelpere/<providers.id> (IKKE auth.users.id).
-- Etter seed, finn faktiske UUID-er (passer uansett om bruker ble opprettet med fast ID eller via registrering):
--   SELECT u.email, pr.id AS provider_id,
--          'http://localhost:3000/no/hjelpere/' || pr.id::text AS local_url
--   FROM public.providers pr
--   JOIN public.profiles p ON p.id = pr.profile_id
--   JOIN auth.users u ON u.id = p.user_id
--   WHERE u.email ILIKE '%@test.hjelpi.local'
--   ORDER BY u.email;
-- Sjekk også at NEXT_PUBLIC_SUPABASE_URL i .env.local peker på samme prosjekt som du seedet.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  inst uuid;
  pw  text := crypt('DemoHjelpi2026!', gen_salt('bf'));
BEGIN
  SELECT id INTO inst FROM auth.instances LIMIT 1;
  IF inst IS NULL THEN
    inst := '00000000-0000-0000-0000-000000000000'::uuid;
  END IF;

  -- Seller 1 — Kari Renhold (match på e-post: unngår duplikat hvis konto ble opprettet via registrering først)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo-hjelper-renhold@test.hjelpi.local') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '11111111-1111-4111-8111-111111110101'::uuid,
      inst,
      'authenticated',
      'authenticated',
      'demo-hjelper-renhold@test.hjelpi.local',
      pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"first_name":"Kari","last_name":"Renhold","register_as_seller":"true"}'::jsonb,
      now(),
      now(),
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '11111111-1111-4111-8111-111111110101'::uuid,
      '11111111-1111-4111-8111-111111110101'::uuid,
      'email',
      jsonb_build_object(
        'sub', '11111111-1111-4111-8111-111111110101'::text,
        'email', 'demo-hjelper-renhold@test.hjelpi.local'
      ),
      now(),
      now(),
      now()
    );
  END IF;

  -- Seller 2 — Per Foto
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo-hjelper-foto@test.hjelpi.local') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '11111111-1111-4111-8111-111111110102'::uuid,
      inst,
      'authenticated',
      'authenticated',
      'demo-hjelper-foto@test.hjelpi.local',
      pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"first_name":"Per","last_name":"Foto","register_as_seller":"true"}'::jsonb,
      now(),
      now(),
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '11111111-1111-4111-8111-111111110102'::uuid,
      '11111111-1111-4111-8111-111111110102'::uuid,
      'email',
      jsonb_build_object(
        'sub', '11111111-1111-4111-8111-111111110102'::text,
        'email', 'demo-hjelper-foto@test.hjelpi.local'
      ),
      now(),
      now(),
      now()
    );
  END IF;

  -- Buyer — Linn Kunde
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo-kunde@test.hjelpi.local') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '11111111-1111-4111-8111-111111110103'::uuid,
      inst,
      'authenticated',
      'authenticated',
      'demo-kunde@test.hjelpi.local',
      pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"first_name":"Linn","last_name":"Kunde"}'::jsonb,
      now(),
      now(),
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '11111111-1111-4111-8111-111111110103'::uuid,
      '11111111-1111-4111-8111-111111110103'::uuid,
      'email',
      jsonb_build_object(
        'sub', '11111111-1111-4111-8111-111111110103'::text,
        'email', 'demo-kunde@test.hjelpi.local'
      ),
      now(),
      now(),
      now()
    );
  END IF;
END $$;

-- Providers (trigger already created profiles for the users above)
INSERT INTO public.providers (id, profile_id, bio, is_verified, service_radius_km, avg_rating, total_reviews, total_bookings)
SELECT
  '22222222-2222-4222-8222-222222220101'::uuid,
  p.id,
  'Demohjelper for renhold og dyprengjøring. Kun testdata.',
  true,
  30,
  4.90,
  14,
  8
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE lower(u.email) = lower('demo-hjelper-renhold@test.hjelpi.local')
  AND NOT EXISTS (SELECT 1 FROM public.providers x WHERE x.profile_id = p.id);

INSERT INTO public.providers (id, profile_id, bio, is_verified, service_radius_km, avg_rating, total_reviews, total_bookings)
SELECT
  '22222222-2222-4222-8222-222222220102'::uuid,
  p.id,
  'Demohjelper for bedriftsfoto. Kun testdata.',
  true,
  40,
  4.75,
  22,
  15
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE lower(u.email) = lower('demo-hjelper-foto@test.hjelpi.local')
  AND NOT EXISTS (SELECT 1 FROM public.providers x WHERE x.profile_id = p.id);

-- Subcategories: prefer known slugs from taxonomy; else any row (needs at least one subcategory in DB)
WITH
  sub_renhold AS (
    SELECT s.id
    FROM public.subcategories s
    JOIN public.categories c ON c.id = s.category_id
    WHERE c.slug = 'renhold' AND s.slug = 'dyprengjoring'
    LIMIT 1
  ),
  sub_any AS (SELECT id FROM public.subcategories LIMIT 1)
INSERT INTO public.provider_services (
  id,
  provider_id,
  subcategory_id,
  cancellation_policy_id,
  title,
  description,
  pricing_type,
  base_price_ore,
  is_active,
  search_tags,
  delivery_days,
  revisions_included,
  faq
)
SELECT
  '33333333-3333-4333-8333-333333330101'::uuid,
  pr.id,
  COALESCE((SELECT id FROM sub_renhold), (SELECT id FROM sub_any)),
  cp.id,
  'Dyprengjøring av leilighet (demo)',
  'Demo: ca. 80 m², kjøkken og bad inkludert. Jeg tar med utstyr. Ikke ekte oppdrag.',
  'fixed'::public.pricing_type,
  189000,
  true,
  ARRAY['renhold', 'demo', 'oslo']::text[],
  5,
  1,
  '[{"q":"Hva trenger du fra meg?","a":"Nøkler eller adgang på avtalt tid. Strøm og vann må være på."}]'::jsonb
FROM public.providers pr
JOIN public.profiles p ON p.id = pr.profile_id
JOIN auth.users u ON u.id = p.user_id
CROSS JOIN public.cancellation_policies cp
WHERE lower(u.email) = lower('demo-hjelper-renhold@test.hjelpi.local')
  AND cp.type = 'flexible'
  AND NOT EXISTS (SELECT 1 FROM public.provider_services WHERE id = '33333333-3333-4333-8333-333333330101'::uuid)
LIMIT 1;

WITH
  sub_foto AS (
    SELECT s.id
    FROM public.subcategories s
    JOIN public.categories c ON c.id = s.category_id
    WHERE c.slug = 'fotografi' AND s.slug = 'bedriftsfotografi'
    LIMIT 1
  ),
  sub_any AS (SELECT id FROM public.subcategories LIMIT 1)
INSERT INTO public.provider_services (
  id,
  provider_id,
  subcategory_id,
  cancellation_policy_id,
  title,
  description,
  pricing_type,
  base_price_ore,
  is_active,
  search_tags,
  delivery_days,
  revisions_included,
  faq
)
SELECT
  '33333333-3333-4333-8333-333333330102'::uuid,
  pr.id,
  COALESCE((SELECT id FROM sub_foto), (SELECT id FROM sub_any)),
  cp.id,
  'Bedriftsfoto på lokasjon (demo)',
  'Demo: timepris, minst én time. Inkluderer enkel retusj. For test av timebestilling.',
  'hourly'::public.pricing_type,
  95000,
  true,
  ARRAY['foto', 'bedrift', 'demo']::text[],
  3,
  2,
  '[]'::jsonb
FROM public.providers pr
JOIN public.profiles p ON p.id = pr.profile_id
JOIN auth.users u ON u.id = p.user_id
CROSS JOIN public.cancellation_policies cp
WHERE lower(u.email) = lower('demo-hjelper-foto@test.hjelpi.local')
  AND cp.type = 'flexible'
  AND NOT EXISTS (SELECT 1 FROM public.provider_services WHERE id = '33333333-3333-4333-8333-333333330102'::uuid)
LIMIT 1;

WITH
  sub_renhold AS (
    SELECT s.id
    FROM public.subcategories s
    JOIN public.categories c ON c.id = s.category_id
    WHERE c.slug = 'renhold' AND s.slug = 'dyprengjoring'
    LIMIT 1
  ),
  sub_any AS (SELECT id FROM public.subcategories LIMIT 1)
INSERT INTO public.provider_services (
  id,
  provider_id,
  subcategory_id,
  cancellation_policy_id,
  title,
  description,
  pricing_type,
  base_price_ore,
  is_active,
  search_tags,
  delivery_days,
  revisions_included,
  faq
)
SELECT
  '33333333-3333-4333-8333-333333330103'::uuid,
  pr.id,
  COALESCE((SELECT id FROM sub_renhold), (SELECT id FROM sub_any)),
  cp.id,
  'Vinduspuss bedrift (pristilbud, demo)',
  'Demo: send bilder og adresse — jeg svarer med tilbud. For test av «pris etter avtale».',
  'quote'::public.pricing_type,
  NULL,
  true,
  ARRAY['vindu', 'næring']::text[],
  NULL,
  0,
  '[]'::jsonb
FROM public.providers pr
JOIN public.profiles p ON p.id = pr.profile_id
JOIN auth.users u ON u.id = p.user_id
CROSS JOIN public.cancellation_policies cp
WHERE lower(u.email) = lower('demo-hjelper-renhold@test.hjelpi.local')
  AND cp.type = 'flexible'
  AND NOT EXISTS (SELECT 1 FROM public.provider_services WHERE id = '33333333-3333-4333-8333-333333330103'::uuid)
LIMIT 1;
