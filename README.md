# Receipto

> **Your AI-powered consumer rights assistant for Germany & EU.**
> Find money that's legally yours — from forgotten warranties to zombie subscriptions.

---

## 🎯 Product Vision

**Receipto is an AI lawyer in your pocket.** It scans your receipts, tracks your purchases, and tells you — with the exact moment and the exact legal paragraph — when you're entitled to money back. Then it generates the letter for you. One tap, money returned.

We turn the strongest consumer protection laws in the EU (Germany leads with §438 BGB Gewährleistung, §477 BGB Beweislastumkehr, §312k BGB Knopf-Lösung) into something an average user can actually use.

The average German user loses €400–800 per year by not exercising rights they legally have. Receipto closes that gap.

---

## 💡 The Problem

Germans (and EU consumers in general) lose money every day because:

1. **Receipts get lost.** No proof of purchase = no warranty claim.
2. **Nobody knows the law.** §438 BGB gives you 2 years of warranty. §477 BGB shifts the burden of proof to the seller for the first 12 months. Most people don't know either.
3. **Zombie subscriptions drain wallets.** The average German has 8–12 active subscriptions but actively uses 4–6.
4. **Price drops go unnoticed.** MediaMarkt, Saturn, Amazon all have price-match guarantees. Almost no one uses them.
5. **Widerruf periods expire.** 14-day return rights on online purchases pass without action.
6. **Tax-deductible business expenses get forgotten** by freelancers and Werkstudenten.

These aren't edge cases. They happen to everyone, every month.

---

## 🚀 Core Features (MVP → V2)

### MVP — Phase 1 (Months 1–4)

**1. Smart Receipt Scanner**
- Camera-based capture or import from email (Gmail/Outlook order confirmations)
- AI Vision extracts: item, price, merchant, purchase date, warranty period
- Categorizes automatically (electronics, furniture, clothing, etc.)

**2. Gewährleistung Watchdog** *(killer feature)*
- Tracks every purchase against the 24-month BGB warranty period
- Highlights the critical 12-month Beweislastumkehr deadline
- When something breaks: AI generates a legally grounded complaint letter in German referencing the correct BGB paragraphs (§437, §439, §475e)
- One tap to send via email or PDF

**3. Subscription Auditor (Abo-Audit)**
- Bank/PayPal transaction analysis (PSD2 Open Banking, read-only)
- Identifies recurring payments
- Flags zombie subscriptions ("not used in 60+ days")
- Generates Kündigung letters with §312k BGB Knopf-Lösung leverage

### V2 — Phase 2 (Months 5–9)

**4. Price-Drop Refund Tracker**
- Monitors prices on Amazon (Keepa API), MediaMarkt, Saturn, Otto
- Detects price drops within retailer return windows
- Auto-generates price-match request templates

**5. Widerruf Tracker (14-Day Cooling-Off)**
- Imports order confirmations from email
- Dashboard showing active 14-day return windows
- Sends pre-filled cancellation letters before deadline

### V3 — Phase 3 (Months 10+)

**6. Steuer Export**
- Tags receipts as `beruflich` (work-related)
- End-of-year export to ELSTER format or Steuerberater
- Estimates Werbungskosten refund value

**7. AI Assistant Chat**
- "When did I buy my AirPods?"
- "How much did I spend on Amazon last quarter?"
- "Which of my devices still has Beweislastumkehr active?"

---

## 💰 Business Model

**Freemium subscription**

| Tier | Price | Limits |
|------|-------|--------|
| Free | €0 | 10 receipts, basic warranty alerts |
| Pro | €4.99 / month | Unlimited receipts, all features, AI letters |
| Annual | €39.99 / year | (~33% savings) |

**Killer marketing hook:** *"Pay only when we save you money."* Optional 10% success fee on actual money returned (instead of subscription) — used as a viral acquisition tool, not the primary model.

**Realistic year-1 target:** 2,000 paying users → ~€10,000 MRR

---

## 🇩🇪 Why Germany First

1. **Strongest consumer law in EU** — §438 + §477 BGB + §312k BGB combined are unique
2. **High purchasing power & willingness to pay subscriptions** — App Store ARPU in DACH is among the top 5 globally
3. **Cultural fit** — Germans are juridically literate and value their consumer rights
4. **No dominant competitor in this exact niche** — aboalarm = subscriptions only; Finanzguru = banking only; warranty trackers = generic and dumb
5. **Founder lives in Germany** — unfair local advantage US founders can't replicate
6. **Scalable to Austria, Switzerland, France** — same legal frameworks (2-year warranty)

---

## 🏆 Competitive Landscape

| Competitor | Strength | Weakness |
|------------|----------|----------|
| **aboalarm + Volders** | Dominate subscription cancellations, 10M users | Only do cancellations, no purchase tracking, no AI |
| **Finanzguru** | Banking analysis, large user base | No receipt/warranty layer, no legal letters |
| **Generic warranty trackers** | Many on App Store | No German law knowledge, no AI, dumb forms |
| **Truebill / Rocket Money (US)** | $1.2B exit proves the category | Doesn't work in EU, no equivalent in DE |

**Receipto's moat:** Combining all 5+ mechanics into one AI-first product, with deep German legal knowledge no foreign player can quickly replicate.

---

## 🛠️ Tech Stack

### Mobile App
- **React Native + Expo SDK 50+** — single codebase for iOS & Android
- **TypeScript** — type safety, fewer runtime bugs
- **Expo Router** — file-based navigation
- **NativeWind** (Tailwind for RN) — fast, consistent styling
- **Zustand** — lightweight state management (NOT Redux, overkill)
- **TanStack Query** — server state, caching, optimistic updates

### Backend
- **Supabase** (primary backend)
  - PostgreSQL database
  - Row-Level Security for multi-tenancy
  - Built-in Auth (email + Apple + Google sign-in)
  - Storage for receipt images
  - Edge Functions (Deno) for server-side AI calls
  - Realtime subscriptions (for live notification updates)
- **EU-hosted region** (`eu-central-1` Frankfurt) — critical for GDPR

### AI / OCR
- **Claude API (Anthropic)** — primary LLM for letter generation, German legal reasoning
- **OpenAI GPT-4 Vision** OR **Claude Vision** — receipt OCR & extraction
- **Whisper API** (optional, future) — voice notes for purchases

### Payments & Subscriptions
- **RevenueCat** — handles iOS + Android subscriptions, free up to $10K MRR
- **Stripe** (later, for web/EU alternative payments under DMA)

### Banking Integration (Phase 2)
- **GoCardless / Tink / FinAPI** — PSD2 Open Banking aggregators (EU-licensed)
- Read-only access, never store credentials

### Email Integration (Phase 2)
- **Nylas** OR **Gmail API + Microsoft Graph** — direct OAuth to scan order confirmations
- Server-side parsing only, never store full inbox

### Push Notifications
- **Expo Push Notifications** (free) — cross-platform out of the box
- **OneSignal** (alternative if scaling notifications get complex)

### Analytics & Monitoring
- **PostHog** (self-hostable, GDPR-friendly) — product analytics, feature flags, session replay
- **Sentry** — error tracking, crash reports
- **Plausible** — privacy-first web analytics for landing page

### Marketing & Web
- **Next.js + Vercel** — landing page (receipto.de)
- **Resend** — transactional emails
- **Beehiiv** OR **ConvertKit** — newsletter / waitlist

### DevOps
- **EAS Build (Expo Application Services)** — CI/CD for mobile builds
- **GitHub Actions** — automated testing, linting
- **GitHub** — version control (private repo until launch)

### Legal & Compliance
- **Iubenda** OR **CookieFirst** — GDPR consent banners + privacy policy generator
- **Auftragsverarbeitungsvertrag (AVV)** with all data processors (Supabase, OpenAI, Anthropic)
- **DPO (Datenschutzbeauftragter)** — only required if 20+ employees, but get a privacy policy reviewed by a German lawyer before launch

---

## 📐 Tech Stack Justification

**Why React Native + Expo (not Flutter, not native):**
- Single codebase = solo developer can maintain both platforms
- Expo SDK 50+ has solved the historic "RN can't do native features" problem
- Camera, OCR, push, biometric, in-app purchases — all production-ready via Expo
- Massive indie-hacker community = answers to every question on Stack Overflow / Reddit

**Why Supabase (not Firebase, not custom backend):**
- Postgres > Firestore for relational data (receipts ↔ products ↔ warranties)
- EU-hosted = GDPR-compliant out of the box
- Open source = no vendor lock-in
- Edge Functions = server-side AI calls without managing infrastructure
- Free tier covers 0 → 10K users easily

**Why RevenueCat:**
- iOS + Android + Stripe subscriptions in one SDK
- Free until $10K MRR (matches when you'd want to optimize anyway)
- Saves weeks of building receipt validation, refunds, subscription state machine

**Why Claude over GPT-4:**
- Better at long-form German legal reasoning (tested on §437 BGB letter generation)
- Lower hallucination rate on legal citations
- 200K context = can read full BGH judgments for reference

---

## 📂 Suggested Project Structure

```
receipto/
├── apps/
│   ├── mobile/              # React Native + Expo app
│   │   ├── app/             # Expo Router screens
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/             # API clients, utils
│   │   └── stores/          # Zustand stores
│   └── web/                 # Next.js landing page (receipto.de)
├── packages/
│   ├── shared/              # Shared TypeScript types, constants
│   ├── legal-templates/     # German legal letter templates (BGB)
│   └── ai-prompts/          # Versioned AI prompt library
├── supabase/
│   ├── migrations/          # SQL migrations
│   └── functions/           # Edge functions
└── docs/
    ├── legal/               # BGB references, court rulings
    └── architecture/        # Diagrams, decisions
```

Use a **monorepo with pnpm workspaces** or **Turborepo** for managing both apps + shared packages.

---

## 🗓️ Roadmap

### Q3 2026 (Aug–Oct) — Foundation
- [ ] Set up monorepo + Expo + Supabase
- [ ] Receipt OCR prototype with Vision API
- [ ] Basic warranty timeline UI
- [ ] Authentication flow

### Q4 2026 (Nov–Jan) — MVP
- [ ] Gewährleistung Watchdog feature complete
- [ ] AI letter generation (German, BGB-grounded)
- [ ] Push notifications for warranty deadlines
- [ ] Subscription Auditor v1 (manual entry)
- [ ] TestFlight + Google Play internal beta (50 users)

### Q1 2027 (Feb–Apr) — Public Launch
- [ ] App Store + Google Play release
- [ ] receipto.de landing page
- [ ] TikTok + Instagram Reels content strategy
- [ ] Reddit launch (r/de, r/Finanzen)
- [ ] Open Banking integration for Subscription Auditor

### Q2 2027 (May–Jul) — Growth
- [ ] Price-Drop Tracker
- [ ] Widerruf Tracker
- [ ] Year-1 retention review
- [ ] Target: 2,000 paying users / €10K MRR

### Q3 2027+ — Expansion
- [ ] Austrian + Swiss localization
- [ ] French market entry (same 2-year warranty law)
- [ ] Steuer Export feature

---

## 🎬 Marketing Strategy

**Primary channel: TikTok (German-speaking)**
- Format: "AI returned me €X using a law you didn't know about"
- Real case studies, real receipts (anonymized)
- Aim: 1 viral video per week generates organic installs

**Secondary channels:**
- **Reddit** — r/de, r/Finanzen, r/Verbraucherzentrale (be helpful, not spammy)
- **Verbraucherzentrale partnership** — pitch them as a tool that empowers their users
- **Press** — Heise, t3n, gründerszene love stories about indie founders fighting for consumer rights
- **App Store ASO** — German keywords: "garantie", "kündigen", "geld zurück", "verbraucherrecht"

---

## ⚖️ Legal Notes (Important)

- Receipto generates **template letters**, not legal advice. Disclaimer required: *"Dies ist kein Rechtsrat. Bei rechtlichen Fragen wenden Sie sich an einen Anwalt."*
- Privacy policy must explicitly cover: receipt images, banking data (if PSD2 used), AI processing
- AVV with Anthropic, OpenAI, Supabase mandatory (all have EU data processing addenda)
- Consider partnership with Verbraucherzentrale or a Verbraucheranwalt for credibility + legal review of templates

---

## 👤 Founder

**Oleh** — 21, fullstack developer based in Germany (NRW).
Building Receipto solo during IT-Ausbildung (Aug 2026 – Jul 2029).
Stack: TypeScript, React, React Native, Node.js.

---

## 📜 License

Proprietary. All rights reserved.
Repository private until public launch.
