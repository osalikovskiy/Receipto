import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useProfile, updateProfile } from '@/hooks/use-profile'
import { BackButton } from '@/components/back-button'

export default function ProfileScreen() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useProfile()
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setAddress(profile.address ?? '')
    }
  }, [profile])

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    try {
      await updateProfile({
        full_name: fullName.trim() || null,
        address: address.trim() || null,
      })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      router.back()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-gray-50"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 pt-16 pb-4">
          <BackButton />
          <Text className="text-2xl font-bold text-gray-900">{t('profile.title')}</Text>
          <Text className="text-sm text-gray-500 mt-1">{t('profile.subtitle')}</Text>
        </View>

        <View className="px-4">
          <View className="bg-white rounded-xl p-4 mb-3">
            <Text className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              {t('profile.email')}
            </Text>
            <Text className="text-base text-gray-900">{profile?.email ?? ''}</Text>
          </View>

          <View className="bg-white rounded-xl p-4 mb-3">
            <Text className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              {t('profile.fullName')}
            </Text>
            <TextInput
              className="text-base text-gray-900"
              placeholder={t('profile.fullNamePlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View className="bg-white rounded-xl p-4">
            <Text className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              {t('profile.address')}
            </Text>
            <TextInput
              className="text-base text-gray-900 min-h-[80px]"
              placeholder={t('profile.addressPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={address}
              onChangeText={setAddress}
              multiline
              textAlignVertical="top"
            />
          </View>

          {error && <Text className="text-red-500 text-sm mt-3 text-center">{error}</Text>}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
        <Pressable
          className="bg-black rounded-xl py-4 items-center disabled:opacity-50"
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">{t('profile.save')}</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
