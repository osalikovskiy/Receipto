# 08 — Glossary

> German legal and product-domain terms with English explanations.
> Use this when the AI agent encounters German terms in code, documentation, or user-facing strings.

---

## Legal Terms

### Gewährleistung
**Statutory warranty.** The legal obligation under §438 BGB that a seller is liable for defects in goods for **2 years** from delivery. Cannot be reduced for B2C consumer sales. Distinct from `Garantie` (manufacturer's voluntary warranty).

### Garantie
**Manufacturer's voluntary warranty.** Optional, additional to Gewährleistung. Often shorter (e.g., 1 year) but sellers cannot use this to override the statutory 2-year Gewährleistung.

### Beweislastumkehr
**Burden of proof reversal.** Per §477 BGB, in the first **12 months** after purchase (24 months for digital goods per §475e), if a defect appears, the law assumes it existed at the time of delivery. **Seller must prove otherwise.** This is the strongest position for the consumer.

### Widerruf / Widerrufsrecht
**Right of withdrawal.** Per §312g BGB, consumers can return online/distance purchases within **14 days** without giving a reason. Seller bears return shipping (with minor exceptions).

### Reklamation / Reklamationsschreiben
**Complaint / complaint letter.** The formal letter a consumer sends to invoke their warranty rights. Receipto generates these.

### Nacherfüllung
**Subsequent performance.** Per §439 BGB, the seller's obligation when a defect is reported. Either repair (Nachbesserung) or replacement (Ersatzlieferung). Buyer chooses.

### Rücktritt
**Withdrawal from contract.** Returning the goods for full refund. Only available after Nacherfüllung has failed twice (typically).

### Minderung
**Price reduction.** Alternative to Rücktritt: keep the defective item but get partial refund.

### Schadensersatz
**Damages.** Compensation for losses caused by the defect. Requires fault by the seller.

### Frist
**Deadline.** A reasonable period (typically 14 days) given to the seller to fulfill obligations before next legal step.

### Kündigung
**Cancellation/Termination.** Of a subscription or contract. Two types:
- **Ordentliche Kündigung** — regular cancellation respecting notice period
- **Außerordentliche Kündigung** — extraordinary cancellation, immediate, requires legal grounds

### Knopf-Lösung / Kündigungsbutton
**Cancellation button rule.** Per §312k BGB (since July 2022), online services must provide a one-click cancellation button. If absent, user can cancel without notice period.

### BGB (Bürgerliches Gesetzbuch)
**German Civil Code.** The primary source of German consumer law. Receipto cites BGB paragraphs in generated letters.

### BGH (Bundesgerichtshof)
**Federal Court of Justice.** Germany's highest civil court. Its rulings interpret BGB and are binding precedent.

### UWG (Gesetz gegen den unlauteren Wettbewerb)
**Act Against Unfair Competition.** Used as escalation when sellers behave dishonestly.

### Verbraucherzentrale (VZ) / Verbraucherzentrale Bundesverband (VZBV)
**Consumer protection association.** Trusted authority. Long-term partnership target for Receipto.

### Rechtsdienstleistung / Rechtsdienstleistungsgesetz (RDG)
**Legal services / Legal Services Act.** Regulates who can provide legal services. Receipto must avoid being classified as a `Rechtsdienstleister` — generating templates is fine; representing clients is not.

### Impressum
**Imprint.** Required by §5 TMG for any commercial website/app in Germany. Contains operator info.

### AGB (Allgemeine Geschäftsbedingungen)
**Terms and Conditions.** Standard contract terms. Receipto needs its own.

### Datenschutzerklärung
**Privacy policy.** Required by GDPR. Must be in German for German users.

### DSGVO (Datenschutz-Grundverordnung)
**GDPR.** German abbreviation for the EU regulation.

### AVV (Auftragsverarbeitungsvertrag)
**Data processing agreement.** Required contract between Receipto and any third-party that processes user data on Receipto's behalf (Supabase, Anthropic, etc.).

---

## Tax Terms

### Werbungskosten
**Income-related expenses.** Tax-deductible expenses for employees and freelancers (e.g., laptop used for work). Phase 3 Receipto feature.

### ELSTER
**Elektronische Steuererklärung.** German official electronic tax filing system. Receipto's Steuer Export targets this.

### Kleinunternehmerregelung (§19 UStG)
**Small-business regulation.** If annual revenue < €25,000 (and projected < €100,000 next year, as of 2025), no VAT must be charged or paid. Receipto founder will likely use this initially.

### Freiberufler
**Freelancer / liberal profession.** App development is classified here per §18 EStG. No Gewerbeschein needed; no Gewerbesteuer paid. Receipto founder registers as Freiberufler.

### Gewerbeschein / Gewerbesteuer
**Business license / business tax.** Required for trades but NOT for liberal professions like software development.

### Finanzamt
**Tax office.** Where Receipto founder registers as Freiberufler.

### Fragebogen zur steuerlichen Erfassung
**Tax registration questionnaire.** Filed via ELSTER online to register as Freiberufler.

---

## Product / Domain Terms

### Kassenbon / Quittung / Beleg / Rechnung
- **Kassenbon** — POS receipt (paper)
- **Quittung** — generic receipt
- **Beleg** — proof of payment, used in tax context
- **Rechnung** — invoice (more formal, with VAT details)

Receipto handles all of these.

### Bestellbestätigung
**Order confirmation.** Email sent after online purchase. Contains date, items, prices, shipping info. Phase 2 Receipto parses these.

### Tiefpreisgarantie
**Lowest-price guarantee.** Retailer policy (MediaMarkt, Saturn) promising to refund the difference if product price drops within 14–30 days. Phase 2 Receipto monitors this.

---

## Technical Terms (German UI)

When showing UI in German, use these (don't translate technical English literally):

| English | German |
|---------|--------|
| Receipt | Beleg / Kassenbon (depending on context) |
| Warranty | Gewährleistung |
| Manufacturer warranty | Herstellergarantie |
| Refund | Rückerstattung |
| Cancellation | Kündigung |
| Subscription | Abonnement (formal) / Abo (casual) |
| Settings | Einstellungen |
| Notifications | Benachrichtigungen |
| Profile | Profil |
| Sign out | Abmelden |
| Sign in | Anmelden |
| Delete account | Konto löschen |
| Privacy | Datenschutz |
| Terms | AGB |
| About | Über |

---

## Greetings / Tone in Letters

Formal German is mandatory in legal letters:

| Casual | Formal (use this) |
|--------|-------------------|
| Hallo | Sehr geehrte Damen und Herren |
| Tschüss | Mit freundlichen Grüßen |
| Du | Sie |
| Dein | Ihr |
| Bitte gib mir... | Ich bitte Sie, mir... zu übermitteln |

In casual UI strings (notifications, in-app messages), informal `Du` is okay if consistent throughout the app. Pick one and stick with it.

**Receipto's choice:** Formal `Sie` in app UI (matches our serious-tool brand). Always formal in letters.

---

## Common Phrases for Letters

### Opening
> "Sehr geehrte Damen und Herren,"

### Stating purchase
> "am [DATE] habe ich bei Ihnen das Produkt [PRODUCT] zum Preis von [PRICE] € erworben (Bestellnummer: [ORDER_NR])."

### Stating defect
> "Bei der Nutzung des Produkts ist folgender Mangel aufgetreten: [DEFECT_DESCRIPTION]"

### Demanding remedy (with Beweislastumkehr)
> "Da das Produkt innerhalb der ersten 12 Monate nach Kauf einen Mangel aufweist, gilt gemäß § 477 BGB die Beweislastumkehr. Ich fordere Sie hiermit auf, gemäß § 437 Nr. 1 BGB i.V.m. § 439 BGB Nacherfüllung in Form von [REPAIR/REPLACEMENT] zu leisten."

### Setting deadline
> "Hierzu setze ich Ihnen eine Frist bis zum [DATE]."

### Warning of consequences
> "Sollten Sie diese Frist verstreichen lassen, behalte ich mir vor, vom Kaufvertrag zurückzutreten, den Kaufpreis zu mindern oder Schadensersatz zu verlangen."

### Closing (Receipto leaves placeholder for user signature)
> "Mit freundlichen Grüßen,
> {{SIGNATURE_PLACEHOLDER}}"
