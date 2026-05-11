import { useQuery } from '@tanstack/react-query'
import type { Database } from '@receipto/database'
import { supabase } from '@/lib/supabase'

type Claim = Database['public']['Tables']['claims']['Row']
type Product = Database['public']['Tables']['products']['Row']
type Receipt = Database['public']['Tables']['receipts']['Row']
type Subscription = Database['public']['Tables']['subscriptions_tracked']['Row']

export type ClaimWithContext = Claim & {
  products:
    | (Pick<Product, 'id' | 'name' | 'price' | 'serial_number'> & {
        receipts: Pick<Receipt, 'merchant' | 'purchase_date'> | null
      })
    | null
  subscriptions_tracked: Pick<Subscription, 'id' | 'service_name'> | null
}

export function useClaim(id: string | undefined) {
  return useQuery({
    queryKey: ['claim', id],
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const data = query.state.data as ClaimWithContext | undefined
      // Poll while letter is being generated
      return data?.letter_text ? false : 2000
    },
    queryFn: async (): Promise<ClaimWithContext> => {
      if (!id) throw new Error('Missing claim id')
      const { data, error } = await supabase
        .from('claims')
        .select(
          `
          *,
          products (
            id,
            name,
            price,
            serial_number,
            receipts (
              merchant,
              purchase_date
            )
          ),
          subscriptions_tracked (
            id,
            service_name
          )
        `
        )
        .eq('id', id)
        .single()
      if (error) throw error
      return data as unknown as ClaimWithContext
    },
  })
}
