-- Fix function search path security issue
DROP FUNCTION IF EXISTS public.generate_listing_slug() CASCADE;

CREATE OR REPLACE FUNCTION public.generate_listing_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER set_listing_slug
  BEFORE INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_listing_slug();