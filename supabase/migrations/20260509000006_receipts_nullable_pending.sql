-- Pending OCR receipts have no real merchant/date/total yet. Make those nullable
-- so the row honestly represents "we don't know yet" instead of placeholder zeros.
ALTER TABLE receipts
  ALTER COLUMN merchant DROP NOT NULL,
  ALTER COLUMN purchase_date DROP NOT NULL,
  ALTER COLUMN total_amount DROP NOT NULL;
