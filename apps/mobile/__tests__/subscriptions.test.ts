import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({ supabase: {} }))

const { isZombie } = await import('../lib/subscriptions')
type SubscriptionRow = import('../lib/subscriptions').SubscriptionRow

const NOW = new Date('2026-07-23T12:00:00.000Z')

function buildSubscription(overrides: Partial<SubscriptionRow> = {}): SubscriptionRow {
  return {
    id: 'sub_1',
    user_id: 'user_1',
    service_name: 'Netflix',
    amount: 12.99,
    billing_cycle: 'monthly',
    status: 'active',
    detected_via: 'manual',
    has_cancellation_button: true,
    cancellation_notice_days: 30,
    last_charge: null,
    last_used: null,
    created_at: NOW.toISOString(),
    ...overrides,
  }
}

describe('isZombie', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('is not a zombie when last used just now', () => {
    const sub = buildSubscription({ last_used: '2026-07-23' })
    expect(isZombie(sub)).toBe(false)
  })

  it('is not a zombie one day before the threshold', () => {
    const lastUsed = new Date(NOW.getTime() - 59 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const sub = buildSubscription({ last_used: lastUsed })
    expect(isZombie(sub)).toBe(false)
  })

  it('is a zombie exactly at the 60-day threshold', () => {
    const lastUsed = new Date(NOW.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const sub = buildSubscription({ last_used: lastUsed })
    expect(isZombie(sub)).toBe(true)
  })

  it('is a zombie well past the threshold', () => {
    const lastUsed = new Date(NOW.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const sub = buildSubscription({ last_used: lastUsed })
    expect(isZombie(sub)).toBe(true)
  })

  it('falls back to created_at when last_used is null', () => {
    const createdAt = new Date(NOW.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const sub = buildSubscription({ last_used: null, created_at: createdAt })
    expect(isZombie(sub)).toBe(true)
  })

  it('is not a zombie for a freshly created subscription with no usage yet', () => {
    const sub = buildSubscription({ last_used: null, created_at: NOW.toISOString() })
    expect(isZombie(sub)).toBe(false)
  })
})
