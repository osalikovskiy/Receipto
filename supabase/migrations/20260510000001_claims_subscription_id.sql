-- Allow claims to reference a subscription instead of a product (for Kündigung letters).
-- product_id becomes nullable; exactly one of product_id / subscription_id must be set.

ALTER TABLE claims
  ALTER COLUMN product_id DROP NOT NULL,
  ADD COLUMN subscription_id uuid REFERENCES subscriptions_tracked(id) ON DELETE SET NULL;

CREATE INDEX claims_subscription_id_idx ON claims (subscription_id);

ALTER TABLE claims
  ADD CONSTRAINT claims_product_or_subscription CHECK (
    (product_id IS NOT NULL AND subscription_id IS NULL) OR
    (product_id IS NULL AND subscription_id IS NOT NULL)
  );
