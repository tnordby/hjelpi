-- Subcategories aligned with transaksjonelle_tjenester.csv gaps (also in 20260405120000 for fresh installs).
-- Idempotent: safe if rows already exist from full taxonomy sync.

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Osteopat', 'osteopat', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'behandling'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Bilpleie', 'bilpleie', 'fixed'),
  ('Hjul og dekkskift', 'hjul-og-dekkskift', 'fixed'),
  ('Kilometerservice', 'kilometerservice', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'bilverksted-og-mekaniker'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Hundepass', 'hundepass', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'dyrepass'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Flyttebyrå', 'flyttebyra', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'flyttehjelp'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Videofotograf', 'videofotograf', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'fotografi'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Frisør', 'frisor', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'frisor'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Saksofonist', 'saksofonist', 'quote'),
  ('Sanger og gitarist', 'sanger-og-gitarist', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'musikk'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Personlig trener (PT)', 'personlig-trener-pt', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'personlig-trener'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Mattehjelp', 'mattehjelp', 'fixed'),
  ('Privatlærer', 'privatlaerer', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'privatundervisning'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Fasadevask', 'fasadevask', 'hourly'),
  ('Rengjøring etter fest', 'rengjoring-etter-fest', 'hourly'),
  ('Takvask', 'takvask', 'hourly'),
  ('Vaskehjelp', 'vaskehjelp', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'renhold'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Persontransport', 'persontransport', 'fixed'),
  ('Pianotransport', 'pianotransport', 'fixed'),
  ('Transport av bil og båt', 'transport-av-bil-og-bat', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'transport-og-bud'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;
