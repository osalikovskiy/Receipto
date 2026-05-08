# 04 — Legal & Compliance

> **Critical file.** Receipto generates legal letters. Mistakes here = users send wrong letters = brand destroyed = potential lawsuits.
> Cross-reference every claim with this file. When in doubt, use a placeholder template and ask the founder.

---

## German Civil Code (BGB) — Core Paragraphs

### §437 BGB — Buyer's Rights for Defective Goods

When a purchased item is defective, the buyer can demand:
1. **Nacherfüllung** (subsequent performance) — repair OR replacement (buyer's choice)
2. **Rücktritt** (withdrawal from contract) — only after Nacherfüllung fails
3. **Minderung** (price reduction) — alternative to Rücktritt
4. **Schadensersatz** (damages) — if seller is at fault

**Default order:** Step 1 first. Steps 2–4 only after step 1 fails or seller refuses.

### §438 BGB — Limitation Period

- **2 years** from delivery for movable goods (most consumer products)
- **5 years** for buildings/construction materials
- This is **statutory** — sellers cannot reduce it for B2C consumer sales (§476 BGB)

### §475e BGB — Digital Goods (added 2022)

Digital goods (software, ebooks, streaming) — **2-year liability period** with continuous updates obligation. Beweislastumkehr applies for the **entire 2 years**, not just 12 months (this is unique to digital).

### §476 BGB — Burden of Proof Reversal

Original §476 covered "Beweislastumkehr 6 months." **Updated 2022 — now 12 months for physical goods, 24 months for digital goods.**

(Note: depending on revision date, §476 was renumbered §477 in some textbooks. The substantive rule is what matters.)

**What this means for letters:**
- Within 12 months of purchase: **seller must prove** the product was not defective at delivery
- Months 13–24: **buyer must prove** the defect existed at delivery
- For digital goods: 24 months full reversal

This is the **single most important fact** for warranty letters. Always cite it when product is <12 months old.

### §312g BGB — Right of Withdrawal (Widerruf) for Distance Contracts

- **14 days** unconditional return for online/distance purchases
- Period starts when goods are delivered
- No reason needed
- Seller bears return costs (unless explicitly otherwise stated and product < €40)

### §312k BGB — Cancellation Button (Knopf-Lösung) — since July 2022

If a contract was concluded via website, the website **must** provide a one-click cancellation button. If they don't:
- User can cancel **at any time without notice period**
- This is **außerordentliche Kündigung** based on contract violation

This is huge for the Subscription Auditor. Many providers still don't comply.

### §17 UWG — Unfair Competition

**Not Receipto's tool**, but relevant: companies that block users from cancelling are violating UWG. Receipto can mention this as escalation lever.

---

## Common Court Rulings (BGH) — Quote-able References

| Case | Ruling | When to use |
|------|--------|-------------|
| BGH VIII ZR 60/16 | Battery degradation in <2 years = manufacturing defect, not wear | Phone/laptop battery cases |
| BGH VIII ZR 27/12 | Consumer doesn't need to specify defect cause, only describe symptom | Letters describing failures |
| BGH VIII ZR 218/18 | Wear-and-tear must be "extraordinary" to deny warranty | Mechanical failures |
| BGH VIII ZR 80/14 | Beweislastumkehr applies even if defect manifests later, if root cause was at delivery | Latent defects |

When citing BGH cases in generated letters, use format: *"vgl. BGH, Urt. v. [date], [case-number]"*.

---

## Legal Letter Requirements

A legally effective Reklamationsschreiben in Germany should include:

1. **Sender** — full name + address
2. **Recipient** — exact merchant legal entity (e.g., "MediaMarkt Saturn Deutschland GmbH" not "MediaMarkt")
3. **Date**
4. **Subject (Betreff)** — clear: "Reklamation und Aufforderung zur Nacherfüllung"
5. **Order/invoice reference** — Bestellnummer, Rechnungsnummer
6. **Description of goods** — model, serial number, purchase date, price
7. **Description of defect** — what fails, when noticed
8. **Legal basis** — cite §437 BGB, mention Beweislastumkehr if <12 months
9. **Demand** — "Nacherfüllung gemäß §437 Nr. 1 BGB durch [Reparatur/Ersatzlieferung]"
10. **Deadline (Frist)** — typically 14 days
11. **Consequences if ignored** — Rücktritt, Minderung, Schadensersatz
12. **Signature** + printed name

**AI generation rule:** All 12 points MUST be present. Validate before showing to user.

---

## GDPR (DSGVO in German) Requirements

### Data Categories Receipto Handles

| Category | Examples | Sensitivity |
|----------|----------|-------------|
| Personal identifiers | email, name | Standard |
| Financial data | receipts, prices, merchants | High |
| Banking data (V2) | transaction history | High |
| Email content (V2) | order confirmations | High |
| Behavioral | app usage, claims history | Standard |

### Required Documentation

1. **Privacy Policy (Datenschutzerklärung)** — must be in German, accessible from app + website
2. **Imprint (Impressum)** — required by §5 TMG for any commercial site/app in Germany
3. **Cookie banner** (web only) — only essential cookies without consent
4. **AVV (Auftragsverarbeitungsvertrag)** — signed contracts with:
   - Supabase (use their EU DPA)
   - Anthropic (use their DPA)
   - OpenAI (use their DPA)
   - RevenueCat
   - PostHog
   - Sentry
   - Tink/GoCardless (V2)

### User Rights (DSGVO Art. 15–22)

App must support:
- ✅ **Right to access** (Art. 15) — "Download my data" button → JSON export of all user data
- ✅ **Right to rectification** (Art. 16) — edit any field
- ✅ **Right to erasure** (Art. 17) — "Delete my account" → cascade delete in 30 days
- ✅ **Right to portability** (Art. 20) — JSON export
- ✅ **Right to object** (Art. 21) — opt-out of marketing communications

Implement these in Settings screen from MVP. Don't postpone.

### Data Retention

| Data type | Retention |
|-----------|-----------|
| Active user data | While account active |
| Deleted account | 30 days soft-delete, then hard delete |
| Receipts of deleted users | Hard deleted with account |
| Logs | 90 days max |
| Analytics (PostHog) | 12 months |
| Backups | 30 days rolling |

### Data Processing Locations

- **Supabase EU region** — Frankfurt only
- **Anthropic** — has EU data processing under their EU addendum
- **OpenAI** — EU data processing available, must enable
- **PostHog EU cloud** — if used, EU only

**No data leaves EU without contractual safeguards (SCCs).**

---

## Legal Disclaimers (Required in App)

### In every generated letter (footer):

```
Hinweis: Dieses Dokument wurde automatisiert auf Grundlage Ihrer Angaben erstellt
und stellt keinen Rechtsrat dar. Bei rechtlichen Fragen wenden Sie sich an einen
Rechtsanwalt oder die Verbraucherzentrale.
```

### In Terms of Service / EULA:

- Receipto is a tool, not a legal advisor
- Templates are based on current German law but legal landscape can change
- User is responsible for verifying letter content before sending
- No liability for outcomes of letters sent

### When user generates first letter, show one-time modal:

> *"Receipto erstellt Schreiben auf Basis Ihrer Eingaben und der aktuellen Rechtslage. Bitte prüfen Sie das Schreiben vor dem Versand. Receipto ersetzt keinen Anwalt."*

User must tap "Verstanden" to proceed. Log consent in DB.

---

## Things Receipto MUST NOT Do (Legal Risks)

1. **Do not call Receipto a "Verbraucherschutz" service.** That term is regulated and could imply official endorsement.

2. **Do not make absolute claims** like "Wir holen Ihr Geld zurück." Use "Wir helfen Ihnen, Ihre gesetzlichen Rechte einzufordern."

3. **Do not represent the user.** Receipto generates letters; user sends them. We never write "Im Auftrag des Kunden."

4. **Do not act as a Rechtsdienstleister** without RDG registration. Generating templates is fine. Negotiating on behalf of user is not.

5. **Do not display ads** to free users targeting their financial data. AdTech + GDPR + financial data = legal nightmare.

6. **Do not auto-send letters.** User must always tap "Send" themselves. This is critical for liability.

---

## Verbraucherzentrale Partnership (Future Opportunity)

The Verbraucherzentrale (German consumer protection org) is the trusted authority. Long-term goal:

- Get featured/endorsed by VZBV (Verbraucherzentrale Bundesverband)
- Have their lawyers review letter templates
- Partner program where VZ members get discount

This is post-MVP, but architecturally allow for "Verbraucherzentrale verifies templates" badge later.

---

## Imprint Template (for receipto.de + app About screen)

```
Angaben gemäß § 5 TMG

[Name]
[Address]
[City, Country]

Kontakt:
E-Mail: hello@receipto.de

[If Kleinunternehmer:]
Umsatzsteuer-ID: Gemäß §19 UStG wird keine Umsatzsteuer ausgewiesen.

Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
[Name]
[Address]
```

---

## When to Consult a Real Lawyer

Before launch, get a German lawyer to review:
1. Privacy policy (Datenschutzerklärung)
2. Terms of Service (AGB)
3. Sample warranty letter template (final version)
4. RDG compliance assessment (am I providing Rechtsdienstleistung?)

Estimated cost: **€500–1500** one-time. **Non-negotiable** before public launch.

Recommended: a "Rechtsanwalt für IT-Recht und Verbraucherrecht" — not a general lawyer.
