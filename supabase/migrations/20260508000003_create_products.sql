CREATE TABLE products (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id           uuid NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  user_id              uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                 text NOT NULL,
  category             text,
  price                numeric(10,2) NOT NULL,
  quantity             integer NOT NULL DEFAULT 1,
  warranty_start_date  date NOT NULL,
  warranty_end_date    date NOT NULL,
  beweislastumkehr_end date NOT NULL,
  status               text NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'defective', 'claimed', 'expired')),
  serial_number        text,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_user_id_warranty_end_idx
  ON products (user_id, warranty_end_date);

CREATE INDEX products_receipt_id_idx
  ON products (receipt_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own products"
  ON products
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
