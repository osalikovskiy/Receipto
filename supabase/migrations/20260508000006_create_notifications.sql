CREATE TABLE notifications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type           text NOT NULL,
  related_id     uuid,
  scheduled_for  timestamptz NOT NULL,
  sent_at        timestamptz,
  content        jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Cron job `send-push-notifications` queries unsent notifications due now
CREATE INDEX notifications_unsent_scheduled_idx
  ON notifications (user_id, scheduled_for)
  WHERE sent_at IS NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own notifications"
  ON notifications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
