import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function usePushTokenStatus() {
  return useQuery({
    queryKey: ['push-token-status'],
    queryFn: async (): Promise<{ hasToken: boolean }> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { hasToken: false }

      const { data, error } = await supabase
        .from('users')
        .select('push_token')
        .eq('id', user.id)
        .single()
      if (error) throw error

      return { hasToken: Boolean(data.push_token) }
    },
  })
}
