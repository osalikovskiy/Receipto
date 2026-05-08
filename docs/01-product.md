# 01 — Product

## Vision

Receipto turns the strongest consumer protection laws in the EU into something an average user can actually use. We are an **AI lawyer in the user's pocket** — proactively notifying them when they're entitled to money back, and generating the legal letter for them with one tap.

## The User Problem

The average German consumer loses €400–800 per year by not exercising rights they legally have:

- Receipts get lost → no warranty claim possible
- Nobody knows BGB law → 2-year warranty becomes 1-year warranty in practice
- 8–12 active subscriptions, 4–6 actually used → ~€20-40/month wasted
- Price-match policies exist (MediaMarkt, Saturn, Amazon) — almost no one uses them
- 14-day Widerruf rights expire silently
- Tax-deductible business expenses get forgotten by freelancers and Werkstudenten

## Target User

**Primary persona: "Tech-savvy German consumer, 25–40"**
- Lives in Germany, native or fluent in German
- Uses iPhone or Android equally
- Has 3–10 online subscriptions
- Buys electronics, furniture, fashion online (Amazon, Otto, Zalando, MediaMarkt)
- Mildly aware of consumer rights but has never written a complaint letter
- Willing to pay €4-10/month if value is concrete and visible

**Secondary persona: "Budget-conscious household, 30–55"**
- Family or couple, 2 incomes
- Tracks expenses, irritated by zombie subscriptions
- Reads Verbraucherzentrale articles occasionally
- High motivation, low tech skill — UX must be near-zero friction

## Core Value Proposition

> *"Pay €4.99/month. Receipto returns you €40+/month on average."*

The math has to be obvious to the user. Every push notification = a tangible amount of money on the table.

## Features Overview

### Phase 1 — MVP (Months 1–4)

#### 1. Smart Receipt Scanner
- Camera capture or email import
- AI extracts: item name, price, merchant, date, category
- Stores image (encrypted, EU-region) + structured data

#### 2. Gewährleistung Watchdog ⭐ (killer feature)
- Auto-tracks 24-month BGB warranty per purchase
- Highlights critical 12-month Beweislastumkehr deadline
- When user reports defect: AI generates legally grounded letter referencing §437, §439, §475e BGB
- One tap to send via email

#### 3. Subscription Auditor (Abo-Audit)
- PSD2 bank/PayPal connection (read-only)
- Identifies recurring payments
- Flags zombie subscriptions ("not used 60+ days")
- Generates Kündigung letters with §312k BGB Knopf-Lösung leverage

### Phase 2 — V2 (Months 5–9)

#### 4. Price-Drop Refund Tracker
- Monitors prices on Amazon (Keepa API), MediaMarkt, Saturn, Otto
- Detects price drops within retailer return windows (typically 14–30 days)
- Auto-generates price-match request templates

#### 5. Widerruf Tracker (14-Day Cooling-Off)
- Imports order confirmations from email (with user consent)
- Dashboard of active 14-day return windows
- Pre-filled cancellation letters before deadline

### Phase 3 — V3 (Months 10+)

#### 6. Steuer Export
- Tag receipts as `beruflich`
- End-of-year export to ELSTER format
- Estimates Werbungskosten refund value

#### 7. AI Assistant Chat
- Natural language queries:
  - "When did I buy my AirPods?"
  - "How much did I spend on Amazon last quarter?"
  - "Which devices still have Beweislastumkehr active?"

## Out of Scope (explicit)

These are NOT part of Receipto. Don't suggest them:

- ❌ Budgeting / PFM features (Finanzguru's domain)
- ❌ Investment tracking
- ❌ Crypto integration
- ❌ Cashback / affiliate rewards
- ❌ Receipt-based loyalty programs
- ❌ Generic AI chatbot
- ❌ Social features (sharing receipts publicly)
- ❌ Marketplace (selling old items — Rebuy/Wirkaufens already do this)
- ❌ Insurance comparison (Verivox/Check24 already do this)

## Success Metrics

### MVP launch (3–4 months in)
- 500 installs
- 20% trial-to-paid conversion = 100 paying users
- €500 MRR

### Year 1 target
- 10,000 installs
- 2,000 paying users (20% conversion)
- €10,000 MRR (mix of monthly + annual subs)
- App Store rating: 4.5+

### Year 2 target
- 50,000 installs
- 8,000 paying users
- €40,000 MRR
- Expansion to Austria + Switzerland

## Pricing

| Tier | Price | Limits |
|------|-------|--------|
| Free | €0 | 10 receipts max, basic warranty alerts only |
| Pro Monthly | €4.99 | Unlimited everything |
| Pro Annual | €39.99 | (33% savings, anchored against €59.88 monthly equivalent) |

**Marketing hook:** *"Pay €5, save €40+ per month."* — economic ROI must be obvious.

**No "Free forever" tier with full features.** Free tier exists for trust-building, not as a permanent state.
