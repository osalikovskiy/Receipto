# 05 — Coding Standards

## TypeScript

- **Strict mode always.** `tsconfig.json` includes:
  ```json
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true
  ```
- **No `any`.** Use `unknown` if truly unknown, then narrow.
- **No `as` casts** unless paired with a runtime check or zod schema.
- **Type-only imports** when applicable: `import type { User } from './types'`

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `warranty-card.tsx` |
| React components | PascalCase | `WarrantyCard` |
| Hooks | camelCase, `use` prefix | `useWarrantyTimeline` |
| Functions | camelCase, verb-first | `calculateWarrantyEnd` |
| Constants | SCREAMING_SNAKE | `MAX_RECEIPTS_FREE` |
| Types/Interfaces | PascalCase, no `I-` prefix | `Receipt`, not `IReceipt` |
| Boolean variables | `is/has/should` prefix | `isExpired`, `hasReceipt` |
| Booleans in DB columns | same, snake_case | `is_active` |

## File Organization

```
components/
  receipt-card/
    index.tsx              ← exports
    receipt-card.tsx       ← component
    receipt-card.types.ts  ← types
    receipt-card.test.tsx  ← tests
```

For simple components, `receipt-card.tsx` alone is fine.

## React / RN Patterns

### Components

```tsx
// ✅ GOOD
type Props = {
  receipt: Receipt
  onPress?: () => void
}

export function ReceiptCard({ receipt, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="rounded-xl bg-white p-4">
      <Text className="text-lg font-semibold">{receipt.merchant}</Text>
    </Pressable>
  )
}
```

### Avoid

```tsx
// ❌ BAD: default exports
export default function ReceiptCard() {}

// ❌ BAD: React.FC
const ReceiptCard: React.FC<Props> = () => {}

// ❌ BAD: inline anonymous components in lists
{items.map(i => <View>...</View>)}  // extract to component
```

### Hooks Rules

- One hook per file when complex
- Custom hooks return objects, not arrays (after `useState`):
  ```ts
  // ✅ GOOD
  const { warranties, isLoading, error } = useWarranties()

  // ❌ BAD
  const [warranties, isLoading, error] = useWarranties()
  ```

## State Management

### Decision tree

| Need | Use |
|------|-----|
| Server data (fetched from Supabase) | TanStack Query |
| Cross-screen UI state (auth, theme) | Zustand |
| Form state | react-hook-form |
| Local component state | `useState` |
| Persistent client cache | MMKV via `react-native-mmkv` |
| URL state | Expo Router params |

### Zustand Pattern

```ts
// stores/auth-store.ts
import { create } from 'zustand'

type AuthState = {
  user: User | null
  setUser: (user: User | null) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  signOut: () => set({ user: null }),
}))
```

**Don't put server data in Zustand.** That's TanStack Query's job.

## TanStack Query Pattern

```ts
// hooks/use-receipts.ts
export function useReceipts() {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('purchase_date', { ascending: false })
      if (error) throw error
      return data as Receipt[]
    },
    staleTime: 1000 * 60 * 5, // 5 min
  })
}
```

## Error Handling

### Never silently swallow errors

```ts
// ❌ BAD
try { ... } catch (e) {}

// ✅ GOOD
try {
  ...
} catch (error) {
  Sentry.captureException(error)
  throw error
}
```

### User-facing errors

- Always show actionable message in German
- Use `Toast` for transient errors
- Use full screen for critical errors

```tsx
// utils/handle-error.ts
export function handleError(error: unknown, fallbackKey: string): string {
  Sentry.captureException(error)
  if (error instanceof PostgrestError) {
    return t(`errors.db.${error.code}`, { defaultValue: t(fallbackKey) })
  }
  return t(fallbackKey)
}
```

## Async Patterns

- Always `await`. No `.then().catch()` chains.
- Always handle errors at the top level of an async function.
- Never use `Promise.all` without error handling for partial failures (use `Promise.allSettled`).

## Database Access

- **Always go through Supabase client.** No raw SQL in app code.
- **Always use RLS-protected queries.** Never bypass with service role from client.
- **Always type query results** via generated Supabase types or zod.

```ts
// Generate types after schema changes:
// pnpm supabase gen types typescript --project-id xxx > src/types/database.ts
```

## Translations (i18n)

```tsx
// ✅ GOOD
<Text>{t('warranty.expiresInDays', { count: 14 })}</Text>

// ❌ BAD: hardcoded strings
<Text>Garantie läuft in 14 Tagen ab</Text>
```

Translation keys use **English** as the source of truth. German is the primary translation, English is fallback.

```json
// locales/de.json
{
  "warranty": {
    "expiresInDays_one": "Garantie läuft in {{count}} Tag ab",
    "expiresInDays_other": "Garantie läuft in {{count}} Tagen ab"
  }
}
```

## Date Handling

- Use **`date-fns`**, not Moment.js
- Use **`date-fns-tz`** for timezone work (always Europe/Berlin for German users)
- Format dates via i18n + `Intl.DateTimeFormat`

```ts
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

format(date, 'dd.MM.yyyy', { locale: de }) // "15.03.2027"
```

## Money & Numbers

- **Always store amounts in cents (integer)** in DB? **NO** — for Receipto, `numeric(10,2)` is fine because we're not doing high-frequency calc.
- Format display via `Intl.NumberFormat`:

```ts
new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
}).format(149.99) // "149,99 €"
```

- Never use `toFixed()` for currency display.

## Comments

- Comments explain **why**, not what.
- Code should be self-documenting via good names.
- Use JSDoc for public functions:

```ts
/**
 * Calculate the end of the Beweislastumkehr period (12 months from purchase).
 * After this date, burden of proof shifts to the buyer.
 * For digital goods, period is 24 months — caller must specify.
 */
export function calculateBeweislastumkehrEnd(
  purchaseDate: Date,
  isDigital = false
): Date {
  return addMonths(purchaseDate, isDigital ? 24 : 12)
}
```

## Testing

- **Vitest** for unit tests
- **Maestro** for E2E (better than Detox for solo dev)

### What MUST be tested

- Legal calculations (warranty end, Widerruf deadline, etc.)
- Letter template rendering
- Subscription matching logic
- Auth flows

### What's optional

- UI components (snapshot tests are noise)
- Simple display components

## Git Commits

- **Conventional Commits** format:
  - `feat: add receipt scanner`
  - `fix: correct beweislastumkehr calculation for digital goods`
  - `docs: update legal-compliance.md with §475e`
  - `refactor: extract warranty timeline into hook`
  - `test: cover edge cases in deadline calculation`

- Commit messages in **English**.
- Reference issue numbers when relevant.

## Linting & Formatting

- **ESLint** with `@typescript-eslint`, `react`, `react-native`
- **Prettier** for formatting
- **Pre-commit hook** via `lefthook` runs lint + typecheck

Sample `.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## Performance

- Use **FlashList** instead of FlatList for receipt lists
- Use **expo-image** instead of Image (better caching, faster)
- Lazy-load screens via Expo Router automatic splitting
- Profile with **React DevTools Profiler** before optimizing

## Anti-Patterns

| Don't | Do |
|-------|-----|
| `useEffect` for derived state | `useMemo` |
| `useEffect` to sync to other state | Restructure data flow |
| Inline styles | NativeWind classes |
| `console.log` in committed code | `console.debug` (stripped in prod) or remove |
| Magic strings for routes | Constants from Expo Router |
| Direct mutation of state | Always immutable updates |
| Class components | Function components only |
