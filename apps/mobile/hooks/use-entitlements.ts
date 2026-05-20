import { useQuery } from '@tanstack/react-query'
import { checkIsPro } from '@/lib/purchases'

export const ENTITLEMENTS_QUERY_KEY = ['entitlements'] as const

export function useEntitlements() {
  return useQuery({
    queryKey: ENTITLEMENTS_QUERY_KEY,
    queryFn: checkIsPro,
    staleTime: 1000 * 60 * 5,
  })
}
