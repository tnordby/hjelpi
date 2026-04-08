-- Human-readable URL segments for kommuner (e.g. /no/oslo) alongside canonical `slug` (kommune_nr) for filters.
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS public_slug text;

CREATE UNIQUE INDEX IF NOT EXISTS locations_public_slug_unique
  ON public.locations (public_slug)
  WHERE public_slug IS NOT NULL AND length(trim(public_slug)) > 0;

UPDATE public.locations SET public_slug = 'oslo' WHERE kommune_nr = '0301';
UPDATE public.locations SET public_slug = 'bergen' WHERE kommune_nr = '4601';
UPDATE public.locations SET public_slug = 'trondheim' WHERE kommune_nr = '5001';
UPDATE public.locations SET public_slug = 'stavanger' WHERE kommune_nr = '1103';
UPDATE public.locations SET public_slug = 'kristiansand' WHERE kommune_nr = '4204';
UPDATE public.locations SET public_slug = 'drammen' WHERE kommune_nr = '3301';
UPDATE public.locations SET public_slug = 'tromso' WHERE kommune_nr = '5501';
UPDATE public.locations SET public_slug = 'fredrikstad' WHERE kommune_nr = '3107';
