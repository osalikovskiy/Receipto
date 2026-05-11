import { useQuery } from '@tanstack/react-query'
import type { Database } from '@receipto/database'
import { supabase } from '@/lib/supabase'

export type Product = Database['public']['Tables']['products']['Row']

export const PRODUCTS_QUERY_KEY = ['products-all'] as const

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('warranty_end_date', { ascending: true })
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}
