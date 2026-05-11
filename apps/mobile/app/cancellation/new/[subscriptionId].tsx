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
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { useSubscription } from '@/hooks/use-subscription'
import { createCancellationDraft, generateCancellationLetter } from '@/lib/subscriptions'
import { SUBSCRIPTIONS_QUERY_KEY } from '@/hooks/use-subscriptions'
import { BackButton } from '@/components/back-button'
import { captureException } from '@/lib/sentry'

type Step = 'form' | 'generating'

export default function NewCancellationScreen() {
  const { t } = useTranslation()
  const { subscriptionId } = useLocalSearchParams<{ subscriptionId: string }>()
  const { data: sub } = useSubscription(subscriptionId)
  const userId = useAuthStore((s) => s.user?.id)
  const queryClient = useQueryClient()

  const [customerNumber, setCustomerNumber] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!userId || !subscriptionId) return
    setStep('generating')
    setError(null)
    try {
      const claimId = await createCancellationDraft({
        subscriptionId,
        userId,
        customerNumber: customerNumber.trim() || undefined,
      })
      await generateCancellationLetter(claimId)
      await queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY })
      router.replace(`/claim/preview/${claimId}`)
    } catch (e) {
      captureException(e)
      setError(e instanceof Error ? e.message : 'Unknown error')
      setStep('form')
    }
  }

  if (step === 'generating') {
    return (
      <View className="flex-1 items-center justify-center bg-app px-8">
        <ActivityIndicator size="large" />
        <Text className="text-base text-ink font-semibold mt-6 text-center">
          {t('cancellation.generating')}
        </Text>
        <Text className="text-sm text-muted mt-2 text-center">
          {t('cancellation.generatingHint')}
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-app"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 pt-16 pb-4">
          <BackButton />
          <Text className="text-2xl font-bold text-ink">{t('cancellation.title')}</Text>
          {sub && <Text className="text-base text-muted mt-1">{sub.service_name}</Text>}
        </View>

        <View className="px-4 gap-3">
          <View className="bg-white rounded-xl px-4 py-4">
            <Text className="text-sm font-semibold text-ink mb-1">
              {t('cancellation.whatWillHappen')}
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              {t('cancellation.whatWillHappenBody')}
            </Text>
          </View>

          <View className="bg-white rounded-xl px-4">
            <Text className="text-xs uppercase tracking-wide text-muted pt-3 pb-1">
              {t('cancellation.customerNumber')}
            </Text>
            <TextInput
              className="text-base text-ink py-3"
              placeholder={t('cancellation.customerNumberPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={customerNumber}
              onChangeText={setCustomerNumber}
              autoCapitalize="none"
            />
          </View>

          {error && <Text className="text-danger text-sm text-center">{error}</Text>}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-app border-t border-line">
        <Pressable className="bg-ink rounded-xl py-4 items-center" onPress={handleGenerate}>
          <Text className="text-white font-semibold text-base">{t('cancellation.generate')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
