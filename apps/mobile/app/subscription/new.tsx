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
  Switch,
} from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { createSubscription, type BillingCycle } from '@/lib/subscriptions'
import { BackButton } from '@/components/back-button'

export default function NewSubscriptionScreen() {
  const { t } = useTranslation()
  const userId = useAuthStore((s) => s.user?.id)

  const [serviceName, setServiceName] = useState('')
  const [amount, setAmount] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [lastCharge, setLastCharge] = useState(new Date().toISOString().slice(0, 10))
  const [hasCancellationButton, setHasCancellationButton] = useState(true)
  const [noticeDays, setNoticeDays] = useState('30')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const amountNum = parseFloat(amount.replace(',', '.'))
  const isValid =
    serviceName.trim().length > 0 &&
    !isNaN(amountNum) &&
    amountNum > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(lastCharge)

  async function handleSave() {
    if (!isValid || !userId) return
    setIsSubmitting(true)
    setError(null)
    try {
      await createSubscription({
        userId,
        serviceName: serviceName.trim(),
        amount: amountNum,
        billingCycle,
        lastCharge,
        hasCancellationButton,
        cancellationNoticeDays: parseInt(noticeDays, 10) || 30,
      })
      router.back()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-app"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 pt-16 pb-4">
          <BackButton />
          <Text className="text-2xl font-bold text-ink">{t('subscriptions.new.title')}</Text>
        </View>

        <View className="px-4 gap-3">
          <Field label={t('subscriptions.new.serviceName')}>
            <TextInput
              className="text-base text-ink py-3"
              placeholder="Spotify, Netflix, …"
              placeholderTextColor="#9CA3AF"
              value={serviceName}
              onChangeText={setServiceName}
              autoFocus
            />
          </Field>

          <Field label={t('subscriptions.new.amount')}>
            <TextInput
              className="text-base text-ink py-3"
              placeholder="9,99"
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </Field>

          <View className="bg-white rounded-xl overflow-hidden">
            <Text className="text-xs uppercase tracking-wide text-muted px-4 pt-3 pb-1">
              {t('subscriptions.new.billingCycle')}
            </Text>
            {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
              <Pressable
                key={cycle}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  cycle === 'monthly' ? 'border-b border-line' : ''
                }`}
                onPress={() => setBillingCycle(cycle)}
              >
                <Text className="text-base text-ink">{t(`subscriptions.cycle.${cycle}`)}</Text>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    billingCycle === cycle ? 'border-accent' : 'border-subtle'
                  }`}
                >
                  {billingCycle === cycle && (
                    <View className="w-2.5 h-2.5 rounded-full bg-accent" />
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          <Field label={t('subscriptions.new.lastCharge')}>
            <TextInput
              className="text-base text-ink py-3"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={lastCharge}
              onChangeText={setLastCharge}
            />
          </Field>

          <View className="bg-white rounded-xl px-4 py-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-base text-ink font-medium">
                  {t('subscriptions.new.hasCancellationButton')}
                </Text>
                <Text className="text-xs text-muted mt-0.5">
                  {t('subscriptions.new.hasCancellationButtonHint')}
                </Text>
              </View>
              <Switch
                value={hasCancellationButton}
                onValueChange={setHasCancellationButton}
                trackColor={{ true: '#007AFF' }}
              />
            </View>
          </View>

          {hasCancellationButton && (
            <Field label={t('subscriptions.new.noticeDays')}>
              <TextInput
                className="text-base text-ink py-3"
                placeholder="30"
                placeholderTextColor="#9CA3AF"
                value={noticeDays}
                onChangeText={setNoticeDays}
                keyboardType="number-pad"
              />
            </Field>
          )}

          {error && <Text className="text-danger text-sm text-center">{error}</Text>}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-app border-t border-line">
        <Pressable
          className="bg-ink rounded-xl py-4 items-center disabled:opacity-50"
          onPress={handleSave}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {t('subscriptions.new.save')}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="bg-white rounded-xl px-4">
      <Text className="text-xs uppercase tracking-wide text-muted pt-3 pb-1">{label}</Text>
      {children}
    </View>
  )
}
