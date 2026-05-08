-- Private bucket: receipts contain personal financial data, never public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  10485760, -- 10 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Expected path: {user_id}/{receipt_id}.{ext}
-- Policy checks that the first path segment matches the authenticated user

CREATE POLICY "Users upload own receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users read own receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own receipts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
