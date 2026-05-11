import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useFocusEffect } from 'expo-router'
import type { Database } from '@receipto/database'
import { supabase } from '@/lib/supabase'

export type SubscriptionRow = Database['public']['Tables']['subscriptions_tracked']['Row']

export const SUBSCRIPTIONS_QUERY_KEY = ['subscriptions'] as const

export function useSubscriptions() {
  const queryClient = useQueryClient()

  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY })
    }, [queryClient])
  )

  return useQuery({
    queryKey: SUBSCRIPTIONS_QUERY_KEY,
    queryFn: async (): Promise<SubscriptionRow[]> => {
      const { data, error } = await supabase
        .from('subscriptions_tracked')
        .select('*')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 2,
  })
}
