import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '@/stores/auth-store'
import { isOnboardingDone } from '@/lib/onboarding'

export default function Index() {
  const { user, isLoading } = useAuthStore()
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    void (async () => {
      const done = await isOnboardingDone()
      setNeedsOnboarding(!done)
      setOnboardingChecked(true)
    })()
  }, [])

  if (isLoading || !onboardingChecked) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!user) return <Redirect href="/(auth)/sign-in" />
  if (needsOnboarding) return <Redirect href="/onboarding" />
  return <Redirect href="/(tabs)" />
}
