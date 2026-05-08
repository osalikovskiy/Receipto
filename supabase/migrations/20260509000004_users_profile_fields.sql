-- Profile fields used in generated legal letters (sender block)
ALTER TABLE users
  ADD COLUMN full_name text,
  ADD COLUMN address text;
