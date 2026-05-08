-- Users profile table, mirrors auth.users (id = auth.users.id)
CREATE TABLE users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text UNIQUE NOT NULL,
  locale      text NOT NULL DEFAULT 'de-DE',
  push_token  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own profile"
  ON users
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
