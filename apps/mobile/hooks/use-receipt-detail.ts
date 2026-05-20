import { useQuery } from '@tanstack/react-query'
import type { Database } from '@receipto/database'
import { supabase } from '@/lib/supabase'

type Receipt = Database['public']['Tables']['receipts']['Row']
type Product = Database['public']['Tables']['products']['Row']

export type ReceiptDetail = Receipt & {
  products: Product[]
  image_url: string | null
}

export function useReceiptDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['receipts', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<ReceiptDetail> => {
      if (!id) throw new Error('Missing receipt id')

      const { data, error } = await supabase
        .from('receipts')
        .select('*, products(*)')
        .eq('id', id)
        .single()
      if (error) throw error

      const { data: signed } = await supabase.storage
        .from('receipts')
        .createSignedUrl(data.image_path, 3600)

      return {
        ...data,
        products: data.products ?? [],
        image_url: signed?.signedUrl ?? null,
      }
    },
    refetchInterval: (query) => {
      const data = query.state.data as ReceiptDetail | undefined
      return data?.ocr_status === 'pending' ? 3000 : false
    },
  })
}
