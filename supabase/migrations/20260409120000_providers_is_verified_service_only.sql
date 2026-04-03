-- Only the Supabase service role (server-side after Signicat) may set or clear providers.is_verified.
-- Authenticated users can still update other provider columns via existing RLS.

CREATE OR REPLACE FUNCTION public.providers_guard_is_verified()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  jwt_role text;
BEGIN
  jwt_role := COALESCE(auth.jwt() ->> 'role', '');

  IF TG_OP = 'INSERT' THEN
    IF NEW.is_verified = true AND auth.jwt() IS NOT NULL AND jwt_role <> 'service_role' THEN
      NEW.is_verified := false;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
      IF auth.jwt() IS NOT NULL AND jwt_role <> 'service_role' THEN
        NEW.is_verified := OLD.is_verified;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS providers_guard_is_verified ON public.providers;
CREATE TRIGGER providers_guard_is_verified
  BEFORE INSERT OR UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.providers_guard_is_verified();
