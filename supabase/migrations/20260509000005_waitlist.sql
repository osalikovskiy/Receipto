CREATE TABLE waitlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text UNIQUE NOT NULL,
  source      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX waitlist_created_at_idx ON waitlist (created_at DESC);

-- Public landing page writes via service role from API route. No RLS needed
-- because clients never query this directly.
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
