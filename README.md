# Receipto

> AI-powered consumer rights assistant for Germany & EU.
> Scans receipts, tracks warranty deadlines, and generates legally-grounded German letters (BGB) for warranty claims, subscription cancellations, and refunds.

---

## What it does

- **Receipt scanning** — camera capture, AI vision extracts merchant, item, price, purchase date, warranty period.
- **Gewährleistung Watchdog** — tracks every purchase against the 24-month BGB warranty period and the 12-month Beweislastumkehr deadline (§477 BGB), then generates a formal complaint letter citing the correct paragraphs (§437, §439, §475e).
- **Subscription Auditor** — tracks recurring subscriptions and generates cancellation letters leveraging §312k BGB (Kündigungsbutton).
- **Legal letter generation** — AI-drafted German letters with hallucination guardrails: system prompts hard-restrict citations to a fixed set of BGB paragraphs, validators cross-check the generated text before it reaches the user, and prompt-injection defenses treat any user-supplied text as untrusted input.

## Tech stack

| Layer    | Choice                                                                            |
| -------- | --------------------------------------------------------------------------------- |
| Mobile   | React Native + Expo (Expo Router, NativeWind)                                     |
| Web      | Next.js on Vercel                                                                 |
| State    | Zustand (client), TanStack Query (server)                                         |
| Backend  | Supabase (Postgres + Row-Level Security, Auth, Storage, Edge Functions)           |
| AI       | OpenAI GPT-4o / GPT-4o-mini, called server-side only from Supabase Edge Functions |
| Payments | RevenueCat                                                                        |
| Monorepo | pnpm workspaces + Turborepo, TypeScript strict mode                               |

Full rationale for each choice: [`docs/02-tech-stack.md`](docs/02-tech-stack.md).

## Architecture highlights

- **Nothing sensitive touches the client.** All OpenAI calls, all writes that need the service-role key, and all letter generation happen in Supabase Edge Functions (Deno) — never in the mobile/web app. See [`docs/03-architecture.md`](docs/03-architecture.md).
- **Row-Level Security everywhere.** Every table is scoped to `auth.uid()`; there is no table a user can read across accounts.
- **GDPR by construction, not bolted on.** EU-hosted (Frankfurt), account deletion and data export are first-class Edge Functions ([`supabase/functions/delete-account`](supabase/functions/delete-account), [`supabase/functions/export-data`](supabase/functions/export-data)), not manual support tickets.
- **Legal accuracy is enforced in code, not just prompted for.** [`supabase/functions/_shared/letter-validators.ts`](supabase/functions/_shared/letter-validators.ts) checks generated letters for cited paragraphs, dates, and amounts before they're returned to the user — see [`docs/06-ai-prompts.md`](docs/06-ai-prompts.md) for the full prompt-engineering approach.

## Project structure

```
receipto/
├── apps/
│   ├── mobile/              # React Native + Expo app
│   └── web/                 # Next.js landing page
├── packages/
│   ├── database/            # Generated Supabase types
│   ├── shared/               # Shared TypeScript types
│   ├── legal-templates/      # German legal letter templates (BGB)
│   └── ai-prompts/           # Versioned AI prompt library
├── supabase/
│   ├── migrations/           # SQL migrations
│   └── functions/            # Edge functions (Deno)
└── docs/                     # Architecture, legal reference, coding standards
```

## Docs

- [`docs/01-product.md`](docs/01-product.md) — product scope
- [`docs/02-tech-stack.md`](docs/02-tech-stack.md) — stack + rationale
- [`docs/03-architecture.md`](docs/03-architecture.md) — data model, request flows
- [`docs/04-legal-compliance.md`](docs/04-legal-compliance.md) — BGB references used in letter generation
- [`docs/05-coding-standards.md`](docs/05-coding-standards.md) — code style/patterns
- [`docs/06-ai-prompts.md`](docs/06-ai-prompts.md) — prompt design for AI letter generation
- [`docs/07-roadmap.md`](docs/07-roadmap.md) — build phases
- [`docs/08-glossary.md`](docs/08-glossary.md) — German legal terms

## Running locally

```bash
pnpm install
cp .env.example .env.local   # fill in your own Supabase/OpenAI keys
pnpm dev
```

```bash
pnpm typecheck   # TypeScript strict mode, no errors
pnpm lint        # ESLint
pnpm test        # Vitest
```

## Legal notice

Receipto generates template letters based on German consumer protection law (BGB), not legal advice. Every generated letter carries an explicit disclaimer to that effect.

## Author

**Oleh Salikovskyi** — fullstack developer (TypeScript, React, React Native, Node.js), based in Germany.

## License

All rights reserved. This code is shared publicly as a portfolio reference; it is not licensed for reuse, redistribution, or commercial use without permission. See [`LICENSE`](LICENSE).
