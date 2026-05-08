import '../global.css'
import { useEffect } from 'react'
import { View } from 'react-native'
import * as Linking from 'expo-linking'
import { Stack } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { exchangeUrlForSession } from '@/lib/auth-deep-link'
import { getStoredLocale } from '@/lib/preferences'
import { ensureAndroidChannel } from '@/lib/notifications'
import { ErrorBoundary } from '@/components/error-boundary'
import { OfflineBanner } from '@/components/offline-banner'
import { initPurchases } from '@/lib/purchases'
import '@/lib/sentry'
import i18n from '@/lib/i18n'

const queryClient = new QueryClient()

export default function RootLayout() {
  const setUser = useAuthStore((s) => s.setUser)
  const { setColorScheme } = useColorScheme()

  useEffect(() => {
    // Force light mode — this is a single-theme app by design
    setColorScheme('light')
  }, [setColorScheme])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      initPurchases(session?.user?.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) void exchangeUrlForSession(url)
    })

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void exchangeUrlForSession(url)
    })

    return () => subscription.remove()
  }, [])

  useEffect(() => {
    void (async () => {
      const locale = await getStoredLocale()
      if (locale) await i18n.changeLanguage(locale)
      await ensureAndroidChannel()
    })()
  }, [])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="camera" options={{ presentation: 'modal' }} />
          </Stack>
          <OfflineBanner />
        </View>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
