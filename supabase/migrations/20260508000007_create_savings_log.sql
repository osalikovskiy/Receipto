CREATE TABLE savings_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  claim_id     uuid REFERENCES claims(id) ON DELETE SET NULL,
  amount       numeric(10,2) NOT NULL,
  source_type  text NOT NULL
                 CHECK (source_type IN ('warranty', 'subscription', 'widerruf', 'price_drop', 'tax')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX savings_log_user_id_idx
  ON savings_log (user_id);

ALTER TABLE savings_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own savings log"
  ON savings_log
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
