-- Server-side enforcement of the 10-receipt free tier. Cannot be bypassed
-- by hitting the REST API directly. Premium users will be detected via a
-- future entitlements table; for now everyone is on free tier.
CREATE OR REPLACE FUNCTION public.enforce_free_tier_receipt_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  current_count integer;
BEGIN
  SELECT count(*) INTO current_count FROM public.receipts WHERE user_id = NEW.user_id;
  IF current_count >= 10 THEN
    RAISE EXCEPTION 'free_tier_limit_reached'
      USING ERRCODE = 'P0001',
            HINT = 'Upgrade to Receipto Plus to add more receipts.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_free_tier_before_insert
  BEFORE INSERT ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_free_tier_receipt_limit();
