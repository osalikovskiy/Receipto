const MS_IN_DAY = 1000 * 60 * 60 * 24

export type WarrantyState = {
  daysRemaining: number
  percentElapsed: number
  isExpired: boolean
}

/**
 * Calculate the state of a warranty period at a given moment in time.
 * Used for both Beweislastumkehr (12 months) and Gewährleistung (24 months).
 */
export function calculateWarrantyState(
  startDate: string,
  endDate: string,
  now: Date = new Date()
): WarrantyState {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / MS_IN_DAY)
  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = now.getTime() - start.getTime()
  const percentElapsed =
    totalMs > 0 ? Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100))) : 100

  return {
    daysRemaining,
    percentElapsed,
    isExpired: daysRemaining < 0,
  }
}
