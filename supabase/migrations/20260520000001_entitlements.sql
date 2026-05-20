-- Entitlements table tracks paid and beta users.
-- The free-tier receipt trigger checks this table before blocking inserts.
CREATE TABLE IF NOT EXISTS public.entitlements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan        text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'beta', 'plus')),
  granted_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz,
  UNIQUE (user_id)
);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

-- Users can read their own entitlement row; service role manages writes.
CREATE POLICY "users read own entitlement"
  ON public.entitlements FOR SELECT
  USING (auth.uid() = user_id);

-- Ensure every new user gets a free entitlement row alongside their profile row.
CREATE OR REPLACE FUNCTION public.handle_new_user_entitlement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.entitlements (user_id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_entitlement
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_entitlement();

-- Update the free-tier trigger to skip the receipt limit for beta/plus users.
CREATE OR REPLACE FUNCTION public.enforce_free_tier_receipt_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  user_plan   text;
  current_count integer;
BEGIN
  SELECT plan INTO user_plan
    FROM public.entitlements
   WHERE user_id = NEW.user_id
     AND (expires_at IS NULL OR expires_at > now());

  -- Beta and plus users have no receipt limit
  IF user_plan IN ('beta', 'plus') THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO current_count
    FROM public.receipts
   WHERE user_id = NEW.user_id;

  IF current_count >= 10 THEN
    RAISE EXCEPTION 'free_tier_limit_reached'
      USING ERRCODE = 'P0001',
            HINT = 'Upgrade to Receipto Plus to add more receipts.';
  END IF;

  RETURN NEW;
END;
$$;
