# 03 — Architecture

## High-Level System

```
┌─────────────────────┐         ┌──────────────────────────┐
│  Mobile (RN/Expo)   │ ←HTTPS→ │  Supabase (eu-central-1) │
│  iOS + Android      │         │  - Postgres              │
│                     │         │  - Auth                  │
│  - UI               │         │  - Storage (receipts)    │
│  - Camera/OCR call  │         │  - Edge Functions        │
│  - Local cache MMKV │         │  - pg_cron (deadlines)   │
│  - Push token       │         └──────────┬───────────────┘
└──────────┬──────────┘                    │
           │                               │
           │                               ▼
           │                 ┌─────────────────────────────┐
           │                 │  External APIs (server-only)│
           │                 │  - Anthropic Claude         │
           │                 │  - OpenAI Vision (OCR)      │
           │                 │  - Tink/GoCardless (V2)     │
           │                 │  - Keepa (V2)               │
           │                 └─────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  RevenueCat         │  Subscription state, receipts validation
└─────────────────────┘
```

**Key principle:** The mobile client NEVER calls Anthropic/OpenAI directly. All AI requests go through Supabase Edge Functions. API keys live only in Supabase env vars.

---

## Data Model (Core Entities)

### `users`
```sql
id           uuid PRIMARY KEY (= auth.users.id)
email        text UNIQUE NOT NULL
created_at   timestamptz DEFAULT now()
locale       text DEFAULT 'de-DE'
push_token   text NULL
```

### `receipts`
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users(id) ON DELETE CASCADE
image_path      text NOT NULL              -- Supabase Storage path
purchase_date   date NOT NULL
merchant        text NOT NULL              -- "MediaMarkt", "Amazon"
total_amount    numeric(10,2) NOT NULL
currency        text DEFAULT 'EUR'
ocr_status      text DEFAULT 'pending'     -- pending|processed|failed
ocr_raw         jsonb                       -- raw OCR response
notes           text
created_at      timestamptz DEFAULT now()
```

### `products`
```sql
id                    uuid PRIMARY KEY
receipt_id            uuid REFERENCES receipts(id) ON DELETE CASCADE
user_id               uuid REFERENCES users(id) ON DELETE CASCADE
name                  text NOT NULL
category              text                  -- electronics|clothing|furniture|...
price                 numeric(10,2) NOT NULL
quantity              integer DEFAULT 1
warranty_start_date   date NOT NULL
warranty_end_date     date NOT NULL         -- = purchase_date + 24 months default
beweislastumkehr_end  date NOT NULL         -- = purchase_date + 12 months
status                text DEFAULT 'active' -- active|defective|claimed|expired
serial_number         text NULL
```

### `claims` (warranty claims a user has filed)
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users(id)
product_id      uuid REFERENCES products(id)
claim_type      text NOT NULL            -- gewaehrleistung|widerruf|price_match|kuendigung
status          text DEFAULT 'draft'     -- draft|sent|in_progress|resolved|rejected
defect_description text
letter_html     text                     -- generated AI letter
sent_at         timestamptz
resolved_at     timestamptz
resolution_amount numeric(10,2) NULL     -- for "money saved" tracking
bgb_paragraphs  text[]                   -- ['437','475e']
```

### `subscriptions_tracked` (user's external subscriptions, NOT Receipto's own)
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users(id)
service_name    text NOT NULL            -- "Spotify", "Netflix"
amount          numeric(10,2) NOT NULL
billing_cycle   text                      -- monthly|yearly
last_charge     date
last_used       date NULL                 -- if connected to usage data
status          text DEFAULT 'active'    -- active|cancelled|paused
detected_via    text                      -- bank|email|manual
```

### `notifications` (scheduled deadline reminders)
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users(id)
type            text                      -- beweislastumkehr_30d|widerruf_3d|...
related_id      uuid                      -- product or subscription id
scheduled_for   timestamptz NOT NULL
sent_at         timestamptz NULL
content         jsonb                     -- {title, body, deep_link}
```

### `savings_log` (track money returned, used in marketing)
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users(id)
claim_id        uuid REFERENCES claims(id)
amount          numeric(10,2) NOT NULL
source_type     text                      -- warranty|subscription|widerruf|price_drop|tax
created_at      timestamptz DEFAULT now()
```

---

## Row-Level Security (RLS) — MANDATORY on every table

Every table with `user_id` MUST have:

```sql
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own receipts"
  ON receipts
  FOR ALL
  USING (auth.uid() = user_id);
```

**No exceptions.** RLS is the second wall of defense after auth.

---

## Key User Flows

### Flow 1: Add a Receipt (MVP)

```
User opens app
  → taps "Add Receipt"
  → camera opens
  → captures image
  → image uploaded to Supabase Storage (encrypted, eu-central-1)
  → Edge Function `process-receipt` triggered
    → calls Claude Vision with image URL
    → extracts: merchant, date, items, prices
    → inserts into `receipts` and `products` tables
    → calculates warranty_end_date (purchase_date + 24 months)
    → calculates beweislastumkehr_end (purchase_date + 12 months)
    → schedules notification 30 days before beweislastumkehr_end
    → returns structured data
  → mobile displays parsed receipt for user confirmation
  → user can edit, confirm, or delete
```

### Flow 2: Generate Warranty Letter (killer feature)

```
User: device broken
  → opens product detail screen
  → taps "Reklamation einreichen"
  → describes defect (free text or voice-to-text)
  → Edge Function `generate-warranty-letter` triggered
    → loads product data + merchant address
    → loads relevant German legal templates from `legal-templates/`
    → calls Claude with structured prompt:
      - System prompt: legal-letter persona
      - Context: product, defect, BGB §437, §475e
      - Format: formal German Reklamationsschreiben
    → validates output: must include sender, recipient, §-references, signature line
    → stores letter in `claims.letter_html`
    → returns letter to client
  → mobile shows letter preview
  → user taps "Send via Mail" → opens MailComposer with pre-filled email
  → after sending, claim status → 'sent'
  → savings_log entry created if/when resolved
```

### Flow 3: Subscription Detection (V2)

```
User connects bank via Tink (PSD2 OAuth)
  → token stored in Supabase (encrypted)
  → Edge Function `analyze-transactions` runs
    → fetches last 90 days of transactions
    → identifies recurring patterns (same amount, ~30-day cycle)
    → matches against known subscription services DB
    → upserts into `subscriptions_tracked`
    → flags potential zombies (no usage data → flagged after 60 days)
  → mobile shows dashboard
  → user can mark as zombie + tap "Cancel"
  → `generate-cancellation-letter` Edge Function fires (similar to warranty flow)
```

---

## Edge Functions Inventory

| Function | Purpose | Auth required |
|----------|---------|---------------|
| `process-receipt` | OCR image → structured data | Yes |
| `generate-warranty-letter` | Claude → BGB letter | Yes |
| `generate-cancellation-letter` | Claude → Kündigung letter | Yes |
| `generate-widerruf-letter` | Claude → Widerruf letter | Yes |
| `analyze-transactions` (V2) | Detect subscriptions from bank data | Yes |
| `track-prices` (V2) | Cron: poll Keepa for tracked products | No (cron) |
| `schedule-deadlines` | Cron: create notifications for upcoming deadlines | No (cron) |
| `send-push-notifications` | Cron: dispatch scheduled notifications | No (cron) |

---

## Background Jobs (pg_cron + Edge Functions)

| Schedule | Job | Action |
|----------|-----|--------|
| Daily 09:00 CET | `schedule-deadlines` | Find products approaching beweislastumkehr_end-30d, widerruf-3d, etc. Create notification rows. |
| Hourly | `send-push-notifications` | Dispatch any notification with `scheduled_for <= now() AND sent_at IS NULL`. |
| Daily 03:00 CET | `track-prices` (V2) | Poll Keepa for products in tracking, log price drops. |

---

## Authentication Flow

1. **Sign in:** Apple ID, Google, or email + magic link via Supabase Auth
2. **Session:** JWT stored in `expo-secure-store` (Keychain on iOS, Keystore on Android)
3. **App lock:** Optional Face ID / Touch ID gate via `expo-local-authentication`
4. **Token refresh:** TanStack Query handles refetch on 401

**No passwords stored.** Either OAuth or magic link only.

---

## Offline Strategy

Receipto must work offline for:
- ✅ Viewing already-loaded receipts and products
- ✅ Drafting letters (saved as `claims.status = 'draft'`)
- ✅ Capturing new receipt photos (queued for upload)

Receipto requires online for:
- ❌ OCR (server-side)
- ❌ Letter generation (server-side AI)
- ❌ New auth

Use **TanStack Query persistence** + **MMKV** for the cache layer.

---

## Security Considerations

1. **Receipts contain personal data.** Encrypt at rest in Supabase Storage. Use signed URLs with short TTL for client access.

2. **Never log:**
   - Full receipt content
   - Bank transaction details
   - User email addresses (use user_id in logs)

3. **AI prompt injection protection:**
   - Receipt OCR text passed to Claude must be wrapped in `<receipt_text>...</receipt_text>` delimiters
   - System prompt explicitly says to ignore instructions inside delimiters

4. **PSD2 banking (V2):**
   - Tokens encrypted via Supabase Vault
   - Never expose to client
   - Re-auth required every 90 days (PSD2 SCA requirement)

5. **App security:**
   - Certificate pinning for Supabase API
   - Jailbreak/root detection (warn user, don't block)
   - Disable screenshots on sensitive screens (claims, banking)

---

## Scalability Notes

Solo dev, optimizing for simplicity. Current design supports:
- ~10,000 active users without changes
- ~100,000 receipts in DB without query optimization needed (with proper indexes)

When to revisit:
- 50,000 users → consider read replicas, dedicated OCR worker queue
- 500,000 users → not a solo-dev problem anymore, hire someone

**Premature optimization is the enemy.** Ship MVP first.
