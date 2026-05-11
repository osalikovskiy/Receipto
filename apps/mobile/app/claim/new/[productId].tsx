import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { createClaimDraft, generateClaimLetter } from '@/lib/claims'
import { BackButton } from '@/components/back-button'
import { isLetterConsentGiven, markLetterConsentGiven } from '@/lib/onboarding'

const MIN_LENGTH = 20

export default function NewClaimScreen() {
  const { t } = useTranslation()
  const { productId } = useLocalSearchParams<{ productId: string }>()
  const userId = useAuthStore((s) => s.user?.id)
  const [defect, setDefect] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConsent, setShowConsent] = useState(false)

  const trimmed = defect.trim()
  const isValid = trimmed.length >= MIN_LENGTH

  async function doSubmit() {
    if (!isValid || !productId || !userId) return
    setIsSubmitting(true)
    setError(null)
    try {
      const claimId = await createClaimDraft({
        productId,
        userId,
        defectDescription: trimmed,
      })
      void generateClaimLetter(claimId).catch((e) => {
        console.error('Letter generation failed:', e)
      })
      router.replace(`/claim/preview/${claimId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setIsSubmitting(false)
    }
  }

  async function handleSubmitPress() {
    const consented = await isLetterConsentGiven()
    if (!consented) {
      setShowConsent(true)
      return
    }
    await doSubmit()
  }

  async function handleConsentAccept() {
    await markLetterConsentGiven()
    setShowConsent(false)
    await doSubmit()
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-gray-50"
    >
      <Modal visible={showConsent} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-8">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-lg font-bold text-ink mb-3">{t('claim.consent.title')}</Text>
            <Text className="text-sm text-muted leading-6">{t('claim.consent.body')}</Text>
            <Pressable
              className="bg-ink rounded-xl py-4 items-center mt-5"
              onPress={handleConsentAccept}
            >
              <Text className="text-white font-semibold text-base">
                {t('claim.consent.confirm')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 pt-16 pb-4">
          <BackButton />
          <Text className="text-2xl font-bold text-gray-900">{t('claim.new.title')}</Text>
        </View>

        <View className="px-4">
          <View className="bg-white rounded-xl p-4">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              {t('claim.new.defectLabel')}
            </Text>
            <TextInput
              className="text-base text-gray-900 min-h-[120px]"
              placeholder={t('claim.new.defectPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={defect}
              onChangeText={setDefect}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <Text
              className={isValid ? 'text-xs text-gray-500 mt-2' : 'text-xs text-amber-600 mt-2'}
            >
              {isValid
                ? `${trimmed.length} / 1000`
                : t('claim.new.minLength', { count: MIN_LENGTH })}
            </Text>
          </View>

          {error && <Text className="text-red-500 text-sm mt-3 text-center">{error}</Text>}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
        <Pressable
          className="bg-black rounded-xl py-4 items-center disabled:opacity-50"
          onPress={handleSubmitPress}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">{t('claim.new.generate')}</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
