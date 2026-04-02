-- Set profile role/active_mode to seller when user signs up with register_as_seller in metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
BEGIN
  IF NULLIF(trim(NEW.raw_user_meta_data->>'register_as_seller'), '') = 'true' THEN
    v_role := 'seller'::public.user_role;
  ELSE
    v_role := 'buyer'::public.user_role;
  END IF;

  INSERT INTO public.profiles (user_id, full_name, role, active_mode)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), 'Bruker'),
    v_role,
    v_role
  );
  RETURN NEW;
END;
$$;
