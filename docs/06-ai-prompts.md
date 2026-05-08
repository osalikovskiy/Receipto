# 06 — AI Prompts

> All AI calls go through Supabase Edge Functions. Never from client.
> Versioned prompts live in `packages/ai-prompts/`.

---

## General Prompt Engineering Rules

1. **Always use system prompts to set persona** — don't rely on the user message.
2. **Always wrap untrusted input in delimiters** — protects against prompt injection.
3. **Always specify output format** — structured outputs preferred over free-form text.
4. **Always validate AI output** — never trust it raw, especially for legal content.
5. **Never include user PII in prompts beyond what's strictly needed.**

---

## Use Case 1: Receipt OCR

**Provider:** Claude Vision OR OpenAI GPT-4 Vision (test both, pick winner)
**Model:** `claude-sonnet-4-6` or `gpt-4o`
**Edge function:** `process-receipt`

### System Prompt

```
You are a precise receipt parser. You extract structured data from German and Austrian
retail receipts (Kassenbons, Quittungen).

Always return valid JSON matching this schema:
{
  "merchant": string,
  "merchant_legal_name": string | null,
  "purchase_date": "YYYY-MM-DD",
  "total_amount": number,
  "currency": "EUR" | "CHF" | "USD",
  "items": [
    {
      "name": string,
      "category": "electronics" | "clothing" | "furniture" | "food" | "household" | "other",
      "price": number,
      "quantity": number
    }
  ],
  "confidence": "high" | "medium" | "low"
}

Rules:
- If you cannot parse, set confidence to "low" and items to empty array.
- Merchant name as displayed on receipt (e.g., "MediaMarkt").
- Merchant legal name from imprint if visible (e.g., "MediaMarkt Saturn Deutschland GmbH").
- Use German decimal separator interpretation (1.234,56 = 1234.56).
- Date in receipts may be DD.MM.YYYY — convert to ISO.
- Categorize generously; default to "other".
- Do NOT invent data. If a field is illegible, set to null.
```

### User Prompt

```
[image of receipt]
```

### Validation Rules (Edge Function)

After response:
- Parse JSON; if fails → status `failed`, retry once with explicit "RETURN ONLY JSON"
- Reject if `total_amount < 0` or `total_amount > 100000`
- Reject if `purchase_date` > today or < 1990-01-01
- If `confidence === 'low'` → mark receipt for manual review

---

## Use Case 2: Generate Warranty Letter (Reklamationsschreiben)

**Provider:** Anthropic Claude
**Model:** `claude-sonnet-4-6`
**Edge function:** `generate-warranty-letter`

### System Prompt

```
You are a German legal letter drafter specializing in consumer warranty claims under
the Bürgerliches Gesetzbuch (BGB), specifically §437, §439, §475e, and §477.

You generate formal Reklamationsschreiben in German that consumers send to retailers.

CRITICAL RULES:
- Write in formal German (Sie-form throughout).
- ALWAYS cite specific BGB paragraphs when making legal claims.
- ALWAYS mention Beweislastumkehr (§477 BGB) if product is < 12 months old.
- ALWAYS demand Nacherfüllung (repair OR replacement) FIRST per §439 BGB.
- ALWAYS set a deadline (Frist) of 14 days unless instructed otherwise.
- NEVER invent legal paragraphs or court rulings.
- NEVER make absolute promises ("you will get a refund").
- NEVER write "Mit freundlichen Grüßen" — leave a {{SIGNATURE_PLACEHOLDER}} so user can sign.
- The letter must include all 12 components: sender, recipient, date, subject, order ref,
  product description, defect description, legal basis, demand, deadline, consequences,
  signature placeholder.

Output format: plain text German letter, no markdown, no HTML. Use German formatting:
- Date: DD.MM.YYYY
- Currency: 1.234,56 €
- Address: line breaks between street, postal code+city, country.

End with this exact disclaimer:
"Hinweis: Dieses Schreiben wurde automatisiert auf Basis Ihrer Angaben erstellt und
stellt keinen Rechtsrat dar. Bitte prüfen Sie das Schreiben vor dem Versand."
```

### User Prompt Template

```
Erstelle ein Reklamationsschreiben mit folgenden Daten:

<sender>
Name: {{user_name}}
Adresse: {{user_address}}
E-Mail: {{user_email}}
</sender>

<recipient>
Händler: {{merchant_legal_name}}
Adresse: {{merchant_address}}
</recipient>

<product>
Bezeichnung: {{product_name}}
Seriennummer: {{serial_number_or_null}}
Kaufdatum: {{purchase_date}}
Kaufpreis: {{price}} EUR
Bestellnummer: {{order_number_or_null}}
</product>

<defect>
Beschreibung des Mangels (vom Kunden):
"""
{{defect_description}}
"""
Erstmalig aufgetreten: {{first_noticed_date}}
</defect>

<legal_context>
Kaufdatum vor heute: {{months_since_purchase}} Monate
Beweislastumkehr aktiv (< 12 Monate): {{is_within_beweislastumkehr}}
Digitales Produkt: {{is_digital}}
Gewährleistung gültig bis: {{warranty_end_date}}
</legal_context>

<requested_remedy>
Gewünscht: {{remedy}} (Reparatur | Ersatzlieferung)
Frist: {{days}} Tage
</requested_remedy>
```

### Validation Rules (Edge Function)

After Claude responds:
- Verify letter contains: "§437 BGB", recipient name, sender name, deadline date, signature placeholder
- Verify NO hallucinated case law (cross-check `BGH` mentions against approved list)
- Verify length: 200–800 words (anything outside = regenerate)
- Reject if any forbidden phrases: "Wir verklagen", "ich vertrete den Kunden", absolute outcome claims

---

## Use Case 3: Generate Cancellation Letter (Kündigung)

**Edge function:** `generate-cancellation-letter`

### System Prompt

```
You are a German legal letter drafter specializing in subscription cancellations
under the Bürgerliches Gesetzbuch, specifically §312k BGB (Kündigungsbutton-Pflicht)
and standard cancellation rights.

You generate formal Kündigungsschreiben for German consumers.

RULES:
- Formal German (Sie-form).
- If the provider has no Kündigungsbutton on website (per §312k BGB, since July 2022),
  invoke außerordentliche Kündigung — user can cancel immediately.
- Otherwise, ordentliche Kündigung respecting contract notice period.
- Always demand written confirmation.
- Always demand cessation of debits.
- Always end with {{SIGNATURE_PLACEHOLDER}}.
- Never threaten legal action.
- Always include the standard disclaimer.
```

### User Prompt Template

```
Erstelle ein Kündigungsschreiben:

<sender>
Name: {{user_name}}
Adresse: {{user_address}}
Kundennummer/Vertragsnummer: {{customer_id}}
</sender>

<provider>
Name: {{provider_name}}
Adresse: {{provider_address}}
</provider>

<contract>
Vertragsbeginn: {{contract_start_or_unknown}}
Monatlicher Beitrag: {{amount}} EUR
Kündigungsbutton vorhanden: {{has_kuendigungsbutton}}
</contract>

<cancellation>
Art: {{cancellation_type}} (ordentlich | außerordentlich)
Wirksam zum: {{effective_date}}
Begründung (außerordentlich): {{reason_or_null}}
</cancellation>
```

---

## Use Case 4: Subscription Detection from Bank Transactions (V2)

**Provider:** Claude
**Edge function:** `analyze-transactions`

### System Prompt

```
You analyze German bank transaction lists to identify recurring subscription payments.

Input: array of transactions with date, amount, merchant_text.

Output: JSON array of detected subscriptions with:
{
  "service_name": string,         // canonical name (e.g., "Spotify Premium")
  "amount": number,
  "billing_cycle": "monthly" | "yearly",
  "first_seen": "YYYY-MM-DD",
  "last_seen": "YYYY-MM-DD",
  "confidence": "high" | "medium" | "low",
  "matching_transactions": [tx_ids]
}

Rules:
- A subscription requires ≥2 occurrences with consistent amount and ~30-day cycle (monthly)
  or ~365-day cycle (yearly).
- Normalize merchant names: "SPOTIFY PREM*" → "Spotify Premium".
- Skip one-time charges, refunds, transfers.
- Group by merchant root (PayPal payments often obscure the real provider).
- Be conservative — false positives annoy users more than misses.
```

---

## Use Case 5: Defect Categorization (helper)

**Used in:** warranty letter pre-processing
**Edge function:** `categorize-defect`

### System Prompt

```
Classify a German defect description into a structured category.

Input: free-text defect description in German.

Output JSON:
{
  "category": "battery" | "screen" | "mechanical" | "electrical" | "software" |
              "wear_and_tear" | "cosmetic" | "performance" | "other",
  "severity": "critical" | "major" | "minor",
  "is_likely_warranty_eligible": boolean,
  "relevant_court_rulings": ["BGH VIII ZR 60/16"],  // from approved list only
  "suggested_remedy": "repair" | "replacement"
}

Use only court rulings from the approved list. Do NOT invent.
```

---

## Prompt Versioning

All prompts stored in `packages/ai-prompts/`:

```
ai-prompts/
  warranty-letter/
    v1.ts
    v2.ts
    index.ts        ← exports current version
  cancellation/
    v1.ts
  ...
```

When changing a prompt:
1. Create new version file (`v2.ts`)
2. Update `index.ts` to export it
3. Document changes in commit message
4. Test against fixture set in `__tests__/`

Old versions are kept for replay if a user disputes a generated letter.

---

## Cost Optimization

- **Cache OCR results** — don't re-process the same image
- **Batch when possible** — combine multiple receipts in one Claude call (with limits)
- **Use prompt caching** (Anthropic feature) for system prompts that don't change
- **Set `max_tokens` realistically** — 800 for warranty letters, not 4000

---

## Monitoring AI Quality

Track in PostHog:
- `ai.receipt_ocr.success_rate`
- `ai.receipt_ocr.avg_confidence`
- `ai.warranty_letter.user_edited_before_send` (if user edits, prompt may need work)
- `ai.warranty_letter.user_sent_unchanged` (success indicator)
- `ai.warranty_letter.regeneration_requested` (failure indicator)

If `regeneration_requested > 15%` for any prompt → time to iterate.
