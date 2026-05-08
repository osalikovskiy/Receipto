CREATE TABLE subscriptions_tracked (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_name  text NOT NULL,
  amount        numeric(10,2) NOT NULL,
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')),
  last_charge   date,
  last_used     date,
  status        text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'cancelled', 'paused')),
  detected_via  text CHECK (detected_via IN ('bank', 'email', 'manual')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX subscriptions_tracked_user_id_status_idx
  ON subscriptions_tracked (user_id, status);

ALTER TABLE subscriptions_tracked ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own subscriptions"
  ON subscriptions_tracked
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
