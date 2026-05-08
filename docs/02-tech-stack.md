# 02 — Tech Stack

> Canonical list of every technology used in Receipto. Do NOT introduce alternatives without explicit founder approval.

## Mobile App Stack

### Core
| Tech | Version | Purpose |
|------|---------|---------|
| React Native | 0.76+ | Cross-platform mobile framework |
| Expo SDK | 52+ (latest stable) | RN tooling, native modules, build pipeline |
| TypeScript | 5.6+ | Type safety, strict mode |
| Expo Router | 4.x | File-based navigation |

### UI / Styling
| Tech | Purpose |
|------|---------|
| NativeWind | Tailwind CSS for React Native |
| react-native-svg | SVG rendering (icons, illustrations) |
| Lucide Icons (lucide-react-native) | Icon library |
| react-native-reanimated 3 | Animations |
| react-native-gesture-handler | Touch interactions |

### State & Data
| Tech | Purpose |
|------|---------|
| Zustand | Client-side state (auth, UI flags) |
| TanStack Query (React Query) | Server state, caching, optimistic updates |
| MMKV (`react-native-mmkv`) | Persistent local storage (faster than AsyncStorage) |

### Forms & Validation
| Tech | Purpose |
|------|---------|
| react-hook-form | Form state |
| zod | Schema validation (shared with backend) |

### Native Capabilities (via Expo)
| Module | Purpose |
|--------|---------|
| `expo-camera` | Receipt photo capture |
| `expo-image-picker` | Gallery selection |
| `expo-image-manipulator` | Crop, resize, compress receipts |
| `expo-notifications` | Push notifications |
| `expo-local-authentication` | Face ID / Touch ID for app lock |
| `expo-secure-store` | Encrypted keychain storage |
| `expo-localization` | Detect user locale |
| `expo-mail-composer` | Send legal letters via Mail app |

### Subscriptions
| Tech | Purpose |
|------|---------|
| RevenueCat (`react-native-purchases`) | iOS + Android in-app purchases |

### i18n
| Tech | Purpose |
|------|---------|
| i18next + react-i18next | German/English translations |

## Backend Stack

### Core
| Tech | Purpose |
|------|---------|
| Supabase | BaaS — Postgres, Auth, Storage, Edge Functions |
| Supabase region | `eu-central-1` (Frankfurt) — GDPR critical |

### Database
| Tech | Purpose |
|------|---------|
| PostgreSQL 15 | Relational DB (receipts, users, subscriptions) |
| Row-Level Security (RLS) | Multi-tenancy enforcement |
| pg_cron | Scheduled jobs (warranty deadline checks) |

### Server-side AI
| Tech | Purpose |
|------|---------|
| Supabase Edge Functions (Deno) | Hosts AI proxy calls |
| Anthropic SDK (`@anthropic-ai/sdk`) | Claude API client |
| OpenAI SDK (`openai`) | GPT-4 Vision (if used for OCR) |

### File Storage
| Tech | Purpose |
|------|---------|
| Supabase Storage | Receipt images (encrypted at rest) |

## Web Stack (Landing Page)

| Tech | Purpose |
|------|---------|
| Next.js 15+ | Static + dynamic rendering |
| Vercel | Hosting (free tier sufficient initially) |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Resend | Transactional email |

## Third-Party APIs

### Phase 1 (MVP)
| API | Purpose | Cost |
|-----|---------|------|
| Anthropic Claude | Letter generation, legal reasoning | ~€0.003 per generation |
| Claude/OpenAI Vision | Receipt OCR | ~€0.01 per receipt |
| Apple Push Notifications | iOS push (via Expo) | Free |
| FCM (Firebase) | Android push (via Expo) | Free |

### Phase 2 (V2)
| API | Purpose | Cost |
|-----|---------|------|
| Tink / GoCardless / FinAPI | PSD2 Open Banking | ~€0.10/connection/month |
| Keepa | Amazon price history | €19/month basic |
| Nylas | Email parsing | $0.05/account/month |

### Phase 3 (V3)
| API | Purpose |
|-----|---------|
| Custom scrapers / RSS | Price tracking for non-Amazon retailers |
| ELSTER API | Tax export integration |

## Infrastructure & DevOps

| Tech | Purpose |
|------|---------|
| GitHub (private repo) | Version control |
| GitHub Actions | CI: tests, lint, type-check |
| EAS Build | Mobile build & submit pipeline |
| Sentry | Error & crash tracking |
| PostHog (EU cloud) | Product analytics |

## Package Management

- **pnpm** — strictly. Not npm. Not yarn.
- **Turborepo** — monorepo task orchestration
- **Workspace structure** — `apps/*` and `packages/*`

## Why These Choices (Quick Rationale)

### Why React Native + Expo (not Flutter, not native, not Capacitor)
- Founder already knows React Native
- Cross-platform from day 1 = full German TAM (Android dominant in DE)
- Expo SDK 50+ solved the "RN can't do native features" problem
- Camera, OCR, push, biometric, IAP all production-ready out of the box
- Massive indie-hacker ecosystem = answers to every question

### Why Supabase (not Firebase, not custom Node, not AWS)
- Postgres > Firestore for relational data (receipts ↔ products ↔ warranties)
- EU-hosted in Frankfurt = GDPR baseline compliance
- Open source = no vendor lock-in if needed
- Edge Functions = server-side AI calls without managing infra
- Free tier covers 0→10K users
- Single SDK in mobile + web (vs 4 different AWS SDKs)

### Why Claude over GPT-4
- Better at long-form German legal reasoning
- Lower hallucination rate on legal citations
- 200K context = can include full BGH judgments as reference
- Anthropic has stronger EU privacy posture (relevant for marketing)
- Pricing competitive

### Why RevenueCat (not direct StoreKit/Billing)
- iOS + Android + Stripe in one SDK
- Free until $10K MRR — matches when you'd want to optimize anyway
- Saves weeks on receipt validation, refund handling, subscription state machine
- Built-in A/B testing for paywalls

### Why pnpm + Turborepo
- pnpm: faster, disk-efficient, strict (catches phantom dependencies)
- Turborepo: native monorepo support, caches builds, scales to many packages

## Cost Estimate (First Year)

### Phase 1 (MVP, 0–500 users)
| Item | Monthly |
|------|---------|
| Supabase Free tier | €0 |
| Vercel Free tier | €0 |
| Apple Developer | €8.25 (€99/year) |
| Google Play | €0 (€25 one-time) |
| Domain (receipto.de) | €0.50 |
| Claude API | ~€20 |
| OCR API | ~€20 |
| Sentry Free | €0 |
| PostHog Free | €0 |
| **TOTAL** | **~€50/month** |

### Phase 2 (1,000+ users)
| Item | Monthly |
|------|---------|
| Supabase Pro | €25 |
| Vercel Pro | €20 |
| Tink (banking) | €30 |
| Keepa | €19 |
| Claude + OCR APIs | ~€100 |
| Sentry Team | €26 |
| **TOTAL** | **~€220/month** |

At 1,000 paying users × €4.99 = €4,990 MRR. Infrastructure is ~5% of revenue. Healthy.

## Anti-Patterns (Things We Explicitly Don't Use)

- ❌ Redux / MobX / Recoil — Zustand wins on simplicity
- ❌ Styled-components / Emotion — NativeWind/Tailwind wins
- ❌ Firebase — vendor lock-in, GDPR worse, Firestore wrong shape for relational data
- ❌ MongoDB — wrong shape for our data, weaker EU presence
- ❌ AWS Lambda / Amplify — too much config for solo dev
- ❌ Flutter — Dart ecosystem smaller, fewer indie-hacker libs
- ❌ Capacitor / Ionic — slower than RN, weaker UX
- ❌ React Navigation directly — Expo Router is simpler now
- ❌ Axios — `fetch` is fine
- ❌ Lodash — modern JS has equivalents
- ❌ Moment.js — use `date-fns` or native `Intl.DateTimeFormat`
