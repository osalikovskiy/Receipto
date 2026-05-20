import { useQuery } from '@tanstack/react-query'
import type { Database } from '@receipto/database'
import { supabase } from '@/lib/supabase'

export type Profile = Pick<
  Database['public']['Tables']['users']['Row'],
  'id' | 'email' | 'full_name' | 'address' | 'push_token'
>

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<Profile> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, address, push_token')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data
    },
  })
}

export async function updateProfile(input: {
  full_name: string | null
  address: string | null
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('users')
    .update({
      full_name: input.full_name?.trim() || null,
      address: input.address?.trim() || null,
    })
    .eq('id', user.id)
  if (error) throw error
}
