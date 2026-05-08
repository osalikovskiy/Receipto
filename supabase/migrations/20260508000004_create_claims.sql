CREATE TABLE claims (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id        uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  claim_type        text NOT NULL
                      CHECK (claim_type IN ('gewaehrleistung', 'widerruf', 'price_match', 'kuendigung')),
  status            text NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'sent', 'in_progress', 'resolved', 'rejected')),
  defect_description text,
  letter_html       text,
  bgb_paragraphs    text[],
  sent_at           timestamptz,
  resolved_at       timestamptz,
  resolution_amount numeric(10,2),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX claims_user_id_status_idx
  ON claims (user_id, status);

CREATE INDEX claims_product_id_idx
  ON claims (product_id);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own claims"
  ON claims
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
