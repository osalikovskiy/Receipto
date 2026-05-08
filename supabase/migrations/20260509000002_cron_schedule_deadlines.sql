-- Daily cron: invoke the schedule-deadlines Edge Function at 07:00 UTC.
-- That maps to 09:00 CEST (summer) / 08:00 CET (winter). Close enough to the
-- 09:00 CET target without dealing with DST in cron.
--
-- Requires Vault secrets created manually via Dashboard → Project Settings → Vault:
--   - project_url       : e.g. https://trdqnooseqolxavcggkh.supabase.co
--   - service_role_key  : the project's service_role key

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.schedule(
  'schedule-deadlines-daily',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/schedule-deadlines',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
