import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'

// Magic-link callback URL: receipto://login-callback
export const authRedirectUrl = Linking.createURL('/login-callback')

// Supabase puts tokens in the URL hash fragment, not query params
function parseHashParams(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#')
  if (hashIndex === -1) return {}
  return Object.fromEntries(new URLSearchParams(url.substring(hashIndex + 1)).entries())
}

export async function exchangeUrlForSession(url: string): Promise<void> {
  const params = parseHashParams(url)
  const accessToken = params.access_token
  const refreshToken = params.refresh_token
  if (!accessToken || !refreshToken) return

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  if (error) throw error
}
