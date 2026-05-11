import { describe, expect, it } from 'vitest'
import { calculateWarrantyState } from '../lib/warranty'

describe('calculateWarrantyState', () => {
  it('returns 100% elapsed and isExpired=true after the end date', () => {
    const state = calculateWarrantyState('2024-01-01', '2025-01-01', new Date('2026-05-09'))
    expect(state.isExpired).toBe(true)
    expect(state.percentElapsed).toBe(100)
    expect(state.daysRemaining).toBeLessThan(0)
  })

  it('returns 0% elapsed before the start date', () => {
    const state = calculateWarrantyState('2030-01-01', '2032-01-01', new Date('2026-05-09'))
    expect(state.isExpired).toBe(false)
    expect(state.percentElapsed).toBe(0)
    expect(state.daysRemaining).toBeGreaterThan(0)
  })

  it('reports halfway through correctly', () => {
    const state = calculateWarrantyState('2026-01-01', '2027-01-01', new Date('2026-07-02'))
    expect(state.percentElapsed).toBeGreaterThanOrEqual(49)
    expect(state.percentElapsed).toBeLessThanOrEqual(51)
    expect(state.isExpired).toBe(false)
  })

  it('clamps percentElapsed to [0, 100]', () => {
    const past = calculateWarrantyState('2020-01-01', '2021-01-01', new Date('2026-05-09'))
    expect(past.percentElapsed).toBe(100)
    const future = calculateWarrantyState('2030-01-01', '2032-01-01', new Date('2026-05-09'))
    expect(future.percentElapsed).toBe(0)
  })

  it('handles same-day start and end gracefully', () => {
    const state = calculateWarrantyState('2026-05-09', '2026-05-09', new Date('2026-05-09'))
    expect(state.percentElapsed).toBe(100)
  })
})
