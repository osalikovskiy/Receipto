CREATE TABLE receipts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_path     text NOT NULL,
  purchase_date  date NOT NULL,
  merchant       text NOT NULL,
  total_amount   numeric(10,2) NOT NULL,
  currency       text NOT NULL DEFAULT 'EUR',
  ocr_status     text NOT NULL DEFAULT 'pending'
                   CHECK (ocr_status IN ('pending', 'processed', 'failed')),
  ocr_raw        jsonb,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX receipts_user_id_purchase_date_idx
  ON receipts (user_id, purchase_date DESC);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own receipts"
  ON receipts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
