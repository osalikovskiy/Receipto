# CLAUDE.md — Receipto Project Context

> **You are Claude Code working on Receipto, an AI-powered consumer rights app for Germany.**
> This file is your primary context. Always read it first.
> Internal planning docs (`docs/*.md`) are kept locally and are not part of this public repo.

---

## 🎯 Project in One Sentence

Receipto helps German consumers reclaim money they're legally entitled to — from forgotten warranties (§438 BGB), zombie subscriptions (§312k BGB), price-match policies, and Widerruf rights — by combining receipt OCR, AI-generated legal letters, and proactive notifications.

## 👤 The Founder (the person you're talking to)

- **Name:** Oleh, 21 years old
- **Location:** Germany (NRW)
- **Background:** Fullstack developer (TypeScript, React, React Native, Node.js)
- **Status:** Solo founder, building during 3-year IT-Ausbildung (starts Aug 2026)
- **Available time:** ~17 hours per week (evenings + weekends)
- **Native languages:** Russian, learning German
- **Communication:** Russian or English with the founder. NEVER write code or commits in Russian.

**Implication for you:** Code must be self-explanatory. Comments in English. Variable names in English. NEVER mix languages in code or commits.

---

## 📖 Reading Order for Every Session

When starting a new conversation or task, read in this order:

1. **This file (`CLAUDE.md`)** — always
2. **Local `docs/*.md`** (if present on this machine) — roadmap, product scope, architecture, legal compliance, coding standards, AI prompts, glossary. These are internal planning docs and are not checked into the public repo.

**Don't read everything every time.** Read this file + the 1–2 relevant docs.

---

## 🧭 Core Principles (apply to ALL decisions)

1. **Solo-developer scale.** Every choice optimizes for one person maintaining the codebase. Avoid microservices. Avoid premature abstractions. Avoid 5 different state managers. ONE way to do things.

2. **GDPR-first, not bolted-on.** Receipts are personal financial data. Banking data is even more sensitive. Privacy is the marketing moat in Germany — design for it from day one.

3. **Ship over perfect.** MVP first, refactor later. If a feature takes >2 weeks for the MVP, cut scope.

4. **German legal accuracy is non-negotiable.** Wrong BGB references = users sending broken letters = brand destroyed. When generating legal content, you must cite specific paragraphs from `docs/04-legal-compliance.md` and never invent law. If unsure, defer to template and ask the founder.

5. **iOS + Android parity from day one.** React Native + Expo, not native. No "we'll do Android later" — German market is Android-heavy.

6. **Cost-conscious.** Founder has ~€100-200/month for infrastructure. Use free tiers wisely. No SaaS that costs >€20/mo until product has paying users.

---

## 🛠️ Technology Stack (canonical — DO NOT introduce alternatives without explicit approval)

### Mobile

- **React Native + Expo SDK 52+** (managed workflow until truly need bare)
- **TypeScript** strict mode
- **Expo Router** (file-based, NOT React Navigation directly)
- **NativeWind** (Tailwind classes, NOT styled-components or emotion)
- **Zustand** for client state (NOT Redux, NOT MobX)
- **TanStack Query** for server state
- **react-hook-form** + **zod** for forms & validation

### Backend

- **Supabase** (Frankfurt region, `eu-central-1`)
- **PostgreSQL** with Row-Level Security
- **Supabase Auth** (email + Apple + Google)
- **Edge Functions** for server-side AI calls (Deno runtime)

### AI / LLM

- **OpenAI GPT-4o** — primary LLM for legal letter generation
- **OpenAI GPT-4o-mini** — receipt OCR (vision)
- All AI calls happen in Supabase Edge Functions, NEVER from client

### Subscriptions

- **RevenueCat SDK** for iOS + Android in-app purchases

### Web (landing)

- **Next.js 15+** on **Vercel**

### Tools

- **pnpm** (NOT npm, NOT yarn)
- **Turborepo** for monorepo

See `docs/02-tech-stack.md` for full list with versions and rationale.

---

## ⚠️ Things You (Claude Code) Must NEVER Do

1. **Never invent BGB paragraphs or court rulings.** If a legal claim isn't in `docs/04-legal-compliance.md` or `packages/legal-templates/`, refuse to generate the letter and ask the founder to verify.

2. **Never put API keys in client code.** All third-party API calls go through Supabase Edge Functions.

3. **Never store full bank credentials.** Only OAuth tokens via PSD2-licensed aggregators.

4. **Never log receipt content, transaction details, or email addresses to console.** Personal data.

5. **Never add a new dependency without checking:**
   - Is it actively maintained (commit in last 6 months)?
   - Does it have a permissive license (MIT, Apache, BSD)?
   - Is there a simpler alternative we already have?
   - Tell the founder before installing it.

6. **Never write "TODO" without a tracking issue.** Either implement or document the gap explicitly.

7. **Never generate code in a language other than English** (no German variable names, no Russian comments).

8. **Never recommend Firebase, MongoDB, AWS Lambda, or AWS Amplify.** They're explicitly out of scope for this project.

9. **Never auto-run destructive commands** (`rm -rf`, database migrations on prod, force push). Always ask first.

10. **Never write 500 lines of speculative code** when the founder asks a question. Confirm scope first.

---

## ✅ Things You SHOULD Do

1. **Read relevant `docs/*.md` before starting non-trivial tasks.**

2. **Suggest the simplest working solution first.** If asked for "the best way," show the simple version, then mention what could be added later.

3. **Write tests for legal logic.** Anything that generates a letter, calculates a deadline, or interprets §-paragraphs needs test coverage.

4. **Ask before creating new files in the repo root.** Root should stay clean. New configs go in subdirectories.

5. **Use the founder's locale awareness.** Currency in EUR, dates in DD.MM.YYYY, language defaults to German for user-facing strings.

6. **Reference real German legal text** when generating letters. Templates live in `packages/legal-templates/`. Never paraphrase law.

7. **When using bash tools**, prefer:
   - `pnpm` for package management
   - `git status` before any commit
   - Run linter and typecheck before declaring "done"

---

## 🌍 Language Strategy

- **Code & comments:** English only
- **Commit messages:** English (Conventional Commits format)
- **User-facing strings (UI):** German first, English fallback (i18next)
- **Legal letters:** German only
- **Documentation in `/docs`:** English
- **Talking to the founder in chat:** Russian or English (whichever the founder uses)

---

## 🚦 Definition of Done (for any feature)

A feature is "done" when:

1. ✅ TypeScript compiles with no errors (`pnpm typecheck`)
2. ✅ Linter passes (`pnpm lint`)
3. ✅ Works on iOS simulator AND Android emulator
4. ✅ German UI strings exist (English optional)
5. ✅ Critical paths have tests (especially legal/financial logic)
6. ✅ No new dependencies without justification
7. ✅ Updated relevant `docs/*.md` if architecture changed
8. ✅ Sentry won't crash if backend is down

---

## 📞 When in Doubt

If a task is ambiguous:

1. Ask the founder ONE specific question
2. Propose the simplest interpretation
3. State assumptions explicitly
4. Don't write speculative code

If unsure about a legal claim:

1. STOP
2. Reference `docs/04-legal-compliance.md`
3. If still unsure, generate a placeholder template that the founder must review

If unsure about UX:

1. Reference existing screens in `apps/mobile/app/`
2. Match the existing pattern
3. Don't reinvent components

---

## 🎬 Session Start Checklist

At the start of every Claude Code session, before any other action:

```
1. Read CLAUDE.md (this file)
2. Read docs/07-roadmap.md to know current phase
3. Run: git status
4. Run: git log --oneline -10
5. Ask the founder: "What are we working on today?"
```

---

## 🔧 Available Custom Commands

The following slash commands are available (defined in `.claude/commands/`):

- `/check` — run linter, typecheck, and tests
- `/db` — generate fresh Supabase types after schema changes
- `/ship` — preflight checklist before pushing to main
- `/legal` — load legal context for warranty/cancellation work
- `/new-feature <name>` — scaffold a new feature with proper structure

---

**End of CLAUDE.md. Now read `docs/07-roadmap.md` to know what phase we're in, then ask the founder what to work on.**
