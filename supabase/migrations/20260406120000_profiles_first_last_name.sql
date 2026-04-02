-- Split profiles.full_name into first_name + last_name (backfill from existing full_name).

ALTER TABLE public.profiles
  ADD COLUMN first_name text,
  ADD COLUMN last_name text;

UPDATE public.profiles
SET
  first_name = CASE
    WHEN NULLIF(trim(full_name), '') IS NULL THEN 'Bruker'
    WHEN position(' ' in trim(full_name)) > 0 THEN split_part(trim(full_name), ' ', 1)
    ELSE trim(full_name)
  END,
  last_name = CASE
    WHEN NULLIF(trim(full_name), '') IS NULL THEN ''
    WHEN position(' ' in trim(full_name)) > 0 THEN
      trim(substring(trim(full_name) from length(split_part(trim(full_name), ' ', 1)) + 2))
    ELSE ''
  END;

ALTER TABLE public.profiles
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL;

ALTER TABLE public.profiles
  DROP COLUMN full_name;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
  v_first text;
  v_last text;
  v_full text;
BEGIN
  IF NULLIF(trim(NEW.raw_user_meta_data->>'register_as_seller'), '') = 'true' THEN
    v_role := 'seller'::public.user_role;
  ELSE
    v_role := 'buyer'::public.user_role;
  END IF;

  v_first := NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), '');
  v_last := NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), '');
  v_full := NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), '');

  IF v_first IS NULL AND v_full IS NOT NULL THEN
    IF position(' ' in v_full) > 0 THEN
      v_first := split_part(v_full, ' ', 1);
      v_last := trim(substring(v_full from length(split_part(v_full, ' ', 1)) + 2));
    ELSE
      v_first := v_full;
      v_last := '';
    END IF;
  END IF;

  IF v_first IS NULL THEN
    v_first := 'Bruker';
  END IF;

  v_last := COALESCE(v_last, '');

  INSERT INTO public.profiles (user_id, first_name, last_name, role, active_mode)
  VALUES (NEW.id, v_first, v_last, v_role, v_role);

  RETURN NEW;
END;
$$;
