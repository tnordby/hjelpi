-- Fiverr-style gig metadata: search tags, delivery estimate, revisions, FAQ (jsonb).
ALTER TABLE public.provider_services
  ADD COLUMN IF NOT EXISTS search_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS delivery_days int,
  ADD COLUMN IF NOT EXISTS revisions_included smallint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.provider_services
  DROP CONSTRAINT IF EXISTS provider_services_delivery_days_check;
ALTER TABLE public.provider_services
  ADD CONSTRAINT provider_services_delivery_days_check
  CHECK (delivery_days IS NULL OR (delivery_days >= 1 AND delivery_days <= 365));

ALTER TABLE public.provider_services
  DROP CONSTRAINT IF EXISTS provider_services_revisions_check;
ALTER TABLE public.provider_services
  ADD CONSTRAINT provider_services_revisions_check
  CHECK (revisions_included >= 0 AND revisions_included <= 20);
