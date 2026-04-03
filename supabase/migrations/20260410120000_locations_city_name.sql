-- By/tettsted label for UI (defaults to kommune name; can differ e.g. after manual updates).
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS city_name text;

UPDATE public.locations SET city_name = name WHERE city_name IS NULL;

ALTER TABLE public.locations ALTER COLUMN city_name SET NOT NULL;
