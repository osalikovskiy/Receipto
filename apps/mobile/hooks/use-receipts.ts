import { useQuery } from '@tanstack/react-query'
import type { Database } from '@receipto/database'
import { supabase } from '@/lib/supabase'

export type Receipt = Database['public']['Tables']['receipts']['Row']

export function useReceipts() {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: async (): Promise<Receipt[]> => {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('purchase_date', { ascending: false })
      if (error) throw error
      return data
    },
    // Poll while any receipt is still being processed by the OCR Edge Function
    refetchInterval: (query) => {
      const data = query.state.data as Receipt[] | undefined
      const hasPending = data?.some((r) => r.ocr_status === 'pending') ?? false
      return hasPending ? 3000 : false
    },
  })
}
