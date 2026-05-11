import { useQuery } from '@tanstack/react-query'
import type { Database } from '@receipto/database'
import { supabase } from '@/lib/supabase'

export type SubscriptionRow = Database['public']['Tables']['subscriptions_tracked']['Row']

export function useSubscription(id: string | undefined) {
  return useQuery({
    queryKey: ['subscription', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<SubscriptionRow> => {
      if (!id) throw new Error('Missing subscription id')
      const { data, error } = await supabase
        .from('subscriptions_tracked')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
  })
}
