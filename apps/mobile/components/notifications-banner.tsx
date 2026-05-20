import { useState } from 'react'
import { View, Text, Pressable, ActivityIndicator, Linking } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Bell, ChevronRight } from 'lucide-react-native'
import { registerPushToken } from '@/lib/notifications'

export function NotificationsBanner() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [needsSettings, setNeedsSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handlePress() {
    if (needsSettings) {
      void Linking.openSettings()
      return
    }
    setIsLoading(true)
    setError(null)
    const result = await registerPushToken()
    setIsLoading(false)

    if (result.status === 'success') {
      void queryClient.invalidateQueries({ queryKey: ['push-token-status'] })
      return
    }
    if (result.status === 'denied') {
      if (!result.canAskAgain) {
        setNeedsSettings(true)
        setError(t('notifications.openSettings'))
      } else {
        setError(t('notifications.permissionDenied'))
      }
      return
    }
    setError(result.message)
  }

  return (
    <Pressable
      className="bg-blue-50 border border-blue-200 mx-4 mb-3 rounded-xl p-4"
      onPress={handlePress}
      disabled={isLoading}
    >
      <View className="flex-row items-center">
        <Bell size={22} color="#007AFF" strokeWidth={1.8} />
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-blue-900">
            {needsSettings ? t('notifications.settingsTitle') : t('notifications.bannerTitle')}
          </Text>
          <Text className="text-sm text-blue-700 mt-0.5">
            {needsSettings ? t('notifications.openSettings') : t('notifications.bannerSubtitle')}
          </Text>
          {error && !needsSettings && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <ChevronRight size={20} color="#007AFF" />
        )}
      </View>
    </Pressable>
  )
}
