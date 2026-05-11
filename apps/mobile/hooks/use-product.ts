import { useQuery } from '@tanstack/react-query'
import type { Database } from '@receipto/database'
import { supabase } from '@/lib/supabase'

export type Product = Database['public']['Tables']['products']['Row']

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Product> => {
      if (!id) throw new Error('Missing product id')
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
  })
}
