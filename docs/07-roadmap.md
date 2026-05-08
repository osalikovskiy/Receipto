# 07 — Roadmap

> Living document. Update as priorities shift.
> Solo founder, ~17 hours/week available.

---

## Current Phase

**Pre-development.** Domain registered. Tech stack decided. Documentation in place.

---

## Phase 0 — Foundation (4 weeks before MVP coding)

**Goal:** Don't write production code. Validate, learn, plan.

- [ ] Buy `receipto.de` ✅ (in progress)
- [ ] Set up Supabase project (Frankfurt region)
- [ ] Set up GitHub repo (private)
- [ ] Initialize monorepo with Turborepo + pnpm
- [ ] Set up Sentry + PostHog accounts
- [ ] Set up Apple Developer + Google Play accounts
- [ ] Talk to **5 German friends** about Receipto idea — collect objections
- [ ] Read 3 actual Reklamationsschreiben from Verbraucherzentrale templates
- [ ] Sketch wireframes for 5 key screens (paper or Figma):
  - Onboarding
  - Receipt list
  - Receipt detail with warranty timeline
  - "Generate complaint letter" flow
  - Settings

**Success criteria for Phase 0:** All scaffolding ready. First friend says: *"Wann kann ich das nutzen?"*

---

## Phase 1 — MVP (Months 1–4)

**Goal:** First public release with Receipt Scanner + Gewährleistung Watchdog.
**Target users:** 100 paying users by end of Phase 1.

### Month 1 — Auth + Receipt Scanner

**Mobile:**
- [ ] Expo app scaffolded with router, NativeWind, i18n
- [ ] Auth flow (Apple, Google, email magic link)
- [ ] Camera screen with `expo-camera`
- [ ] Image cropping/preview
- [ ] Upload to Supabase Storage
- [ ] Settings screen with locale + theme

**Backend:**
- [ ] Supabase schema for `users`, `receipts`, `products`
- [ ] RLS policies on all tables
- [ ] Edge function `process-receipt` with Vision API
- [ ] Database types generated and committed

**Test:** Capture 10 real German receipts. OCR accuracy > 80%. Iterate prompt.

### Month 2 — Warranty Watchdog

**Mobile:**
- [ ] Receipt list screen (FlashList, sortable)
- [ ] Product detail screen with warranty timeline
- [ ] "Days remaining" countdown for Beweislastumkehr + Gewährleistung
- [ ] German UI strings polished by native speaker
- [ ] Push notification permission flow

**Backend:**
- [ ] Edge function `schedule-deadlines` (cron daily)
- [ ] Edge function `send-push-notifications` (cron hourly)
- [ ] Notification scheduling logic for: 30d before Beweislastumkehr, 30d before Gewährleistung end

**Test:** Add 5 receipts of varying ages. Verify correct deadlines + notifications fire.

### Month 3 — Letter Generation

**Mobile:**
- [ ] "Reklamation einreichen" flow on product screen
- [ ] Voice-to-text or free-text defect description input
- [ ] Letter preview screen
- [ ] Edit-before-send capability
- [ ] MailComposer integration with pre-filled email

**Backend:**
- [ ] Edge function `generate-warranty-letter` with Claude
- [ ] All 12 letter components validated
- [ ] Letter versioning + storage in `claims` table
- [ ] Prompt fixtures + tests

**Legal review:**
- [ ] Pay €500–800 for German lawyer to review:
  - Privacy policy
  - Terms of Service
  - Sample warranty letter
  - RDG compliance assessment

**Test:** Generate 10 letters across product categories. Lawyer approves each.

### Month 4 — Polish + Launch

**Mobile:**
- [ ] Onboarding tour for new users
- [ ] Empty states for all screens
- [ ] Error handling (offline, API failures)
- [ ] App Store + Google Play screenshots (both DE + EN)
- [ ] App Store + Google Play descriptions
- [ ] Privacy policy + Imprint screens

**Marketing:**
- [ ] Landing page receipto.de live (Next.js + Vercel)
- [ ] Email waitlist with Resend
- [ ] First 5 TikTok videos drafted (German)
- [ ] Reddit posts ready: r/de, r/Finanzen
- [ ] Press list: Heise, t3n, gründerszene contacts

**Subscriptions:**
- [ ] RevenueCat integration
- [ ] Paywall screen with monthly + annual options
- [ ] Free tier limits enforced (10 receipts max)

**Submit to stores:**
- [ ] TestFlight beta with 50 users (recruit from waitlist)
- [ ] Iterate based on beta feedback for 2 weeks
- [ ] Submit to App Store + Google Play

**Goal:** Public launch end of Month 4.

---

## Phase 2 — V2: Subscriptions + Price Tracking (Months 5–9)

**Goal:** €5,000 MRR. 1,000 paying users.

### Month 5 — Subscription Auditor (Manual)

- [ ] Manual subscription entry screen
- [ ] Subscription list with "last used" tracking
- [ ] Zombie detection (60+ days unused)
- [ ] Cancellation letter generation (`generate-cancellation-letter`)

### Month 6 — Bank Connection

- [ ] Tink (or GoCardless/FinAPI) integration
- [ ] PSD2 OAuth flow
- [ ] Edge function `analyze-transactions`
- [ ] Auto-detect subscriptions from transaction history
- [ ] Match against known service DB

### Month 7 — Price-Drop Tracker

- [ ] Keepa API integration for Amazon products
- [ ] Custom scrapers for MediaMarkt, Saturn (research feasibility)
- [ ] Edge function `track-prices` (cron daily)
- [ ] Push notifications for price drops within return windows
- [ ] Auto-generate price-match letters

### Month 8 — Widerruf Tracker

- [ ] Email connection (Nylas or direct OAuth)
- [ ] Parse order confirmations server-side
- [ ] Dashboard of active 14-day windows
- [ ] Pre-filled cancellation letters

### Month 9 — Growth + Polish

- [ ] Dashboard summary screen ("you saved €X this month")
- [ ] Referral program (1 month free for each friend referred)
- [ ] Year-in-review feature for marketing
- [ ] iOS Widgets (warranty deadlines on home screen)
- [ ] Android Widgets

---

## Phase 3 — V3: Expansion (Months 10+)

**Goal:** €20,000 MRR. Multi-country.

- [ ] Austrian localization (same BGB-equivalent: ABGB)
- [ ] Swiss localization (OR — Obligationenrecht)
- [ ] Steuer Export feature (ELSTER format)
- [ ] AI Assistant Chat ("when did I buy X?")
- [ ] Web app (read-only at first, then full)
- [ ] Family/household plan

---

## Marketing Cadence (parallel to development)

### From Day 1
- 1 TikTok video per week (German, focused on consumer-rights stories)
- 1 Reddit comment/post per week (genuinely helpful, not promotional)
- Newsletter: bi-weekly, growing waitlist

### Post-launch
- 3 TikTok per week
- Verbraucherzentrale outreach (partnership pitch)
- Tech press: t3n, Heise, gründerszene
- App Store ASO optimization (German keywords)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OCR accuracy too low on real receipts | Medium | High | Multi-model fallback (Claude + GPT-4V); manual entry option |
| Legal liability for wrong letters | Medium | Critical | Lawyer review pre-launch; clear disclaimers; user must approve before send |
| aboalarm builds same product | Medium | High | Move fast; build moat in warranty (their weak spot) |
| App Store rejection | Low | High | Read guidelines carefully; mention legal disclaimers; have lawyer-vetted privacy policy |
| GDPR fine for data mishandling | Low | Critical | EU hosting only; AVVs signed; privacy by design; periodic audit |
| Solo founder burnout during Ausbildung | High | High | 17h/week max; sabbatical weeks every 2 months; honest timeline |
| Tink/PSD2 integration takes longer than planned | Medium | Medium | Phase 2 only; start without bank connection (manual entry) |
| TikTok algorithm doesn't pick up content | High | Medium | Multi-channel: Reddit, press, App Store ASO as fallback |

---

## Decision Log

Document major architectural decisions here as they're made. Format:

### YYYY-MM-DD: [Decision Title]
- **Context:** What problem are we solving?
- **Decision:** What did we choose?
- **Alternatives considered:** What else was on the table?
- **Consequences:** What does this enable / prevent?

### 2026-05: React Native + Expo over Native + Flutter
- **Context:** Need cross-platform, solo dev, founder knows RN.
- **Decision:** React Native + Expo SDK 50+.
- **Alternatives:** Native Swift + Kotlin (too slow for solo); Flutter (founder doesn't know Dart, smaller ecosystem).
- **Consequences:** Slightly worse perf than native (acceptable for our use case); much faster shipping; one codebase to maintain.

### 2026-05: Supabase over Firebase + custom backend
- **Context:** Need backend with auth, DB, storage, server functions; GDPR critical.
- **Decision:** Supabase EU region.
- **Alternatives:** Firebase (Google, GDPR weak); custom Node + Postgres (too much ops for solo); AWS Amplify (overkill).
- **Consequences:** EU-hosted by default; Postgres > Firestore for our relational data; Edge Functions enable AI proxy; can self-host if needed later.
