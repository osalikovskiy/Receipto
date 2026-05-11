-- Fields needed for Kündigung letter generation.
-- has_cancellation_button: per §312k BGB — if false, außerordentliche Kündigung applies.
-- cancellation_notice_days: ordentliche Kündigung notice period (default 30 days).

ALTER TABLE subscriptions_tracked
  ADD COLUMN has_cancellation_button boolean NOT NULL DEFAULT true,
  ADD COLUMN cancellation_notice_days integer NOT NULL DEFAULT 30;
