import { useState } from 'react'
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle } from 'lucide-react-native'
import { useSubscription } from '@/hooks/use-subscription'
import { SUBSCRIPTIONS_QUERY_KEY } from '@/hooks/use-subscriptions'
import { isZombie, markSubscriptionUsedToday, deleteSubscription } from '@/lib/subscriptions'
import { formatMoney } from '@/lib/formatters'
import { BackButton } from '@/components/back-button'
import { captureException } from '@/lib/sentry'

export default function SubscriptionDetailScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: sub, isLoading, refetch } = useSubscription(id)
  const queryClient = useQueryClient()
  const [isMarkingUsed, setIsMarkingUsed] = useState(false)

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    )
  }

  if (!sub) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-base text-muted">{t('subscriptions.notFound')}</Text>
      </View>
    )
  }

  const zombie = isZombie(sub)

  async function handleMarkUsed() {
    if (!id) return
    setIsMarkingUsed(true)
    try {
      await markSubscriptionUsedToday(id)
      await refetch()
      await queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY })
    } catch (e) {
      captureException(e)
    } finally {
      setIsMarkingUsed(false)
    }
  }

  function handleDelete() {
    Alert.alert(t('subscriptions.deleteConfirmTitle'), t('subscriptions.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSubscription(id ?? '')
            await queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY })
            router.back()
          } catch (e) {
            captureException(e)
          }
        },
      },
    ])
  }

  return (
    <View className="flex-1 bg-app">
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        <View className="px-6 pt-16 pb-4">
          <BackButton />
          <Text className="text-2xl font-bold text-ink">{sub.service_name}</Text>
          <Text className="text-xl font-semibold text-ink mt-1">
            {formatMoney(sub.amount, 'EUR')} /{' '}
            {t(`subscriptions.cycle.${sub.billing_cycle ?? 'monthly'}`)}
          </Text>
        </View>

        {zombie && (
          <View className="mx-4 mb-4 bg-warning/10 border border-warning/30 rounded-xl p-4 flex-row items-start">
            <AlertTriangle size={20} color="#FF9500" strokeWidth={2} className="mt-0.5" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-warning">
                {t('subscriptions.zombieTitle')}
              </Text>
              <Text className="text-xs text-warning/80 mt-0.5">
                {t('subscriptions.zombieBody')}
              </Text>
            </View>
          </View>
        )}

        <View className="mx-4 bg-white rounded-xl overflow-hidden mb-4">
          <InfoRow label={t('subscriptions.detail.lastCharge')} value={sub.last_charge ?? '—'} />
          <InfoRow
            label={t('subscriptions.detail.lastUsed')}
            value={sub.last_used ?? t('subscriptions.detail.never')}
          />
          <InfoRow
            label={t('subscriptions.detail.cancellationButton')}
            value={
              sub.has_cancellation_button
                ? t('subscriptions.detail.present')
                : t('subscriptions.detail.absent')
            }
            valueClassName={sub.has_cancellation_button ? 'text-success' : 'text-danger'}
          />
          {sub.has_cancellation_button && (
            <InfoRow
              label={t('subscriptions.detail.noticeDays')}
              value={t('subscriptions.detail.noticeDaysValue', {
                count: sub.cancellation_notice_days,
              })}
              isLast
            />
          )}
        </View>

        <Pressable
          className="mx-4 bg-white rounded-xl py-4 flex-row items-center justify-center disabled:opacity-50"
          onPress={handleMarkUsed}
          disabled={isMarkingUsed}
        >
          {isMarkingUsed ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              <CheckCircle size={18} color="#34C759" strokeWidth={2} />
              <Text className="text-success font-semibold ml-2">
                {t('subscriptions.markUsedToday')}
              </Text>
            </>
          )}
        </Pressable>

        <Pressable className="mx-4 mt-3 py-4 items-center" onPress={handleDelete}>
          <Text className="text-danger text-sm">{t('subscriptions.delete')}</Text>
        </Pressable>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-app border-t border-line">
        <Pressable
          className="bg-ink rounded-xl py-4 items-center"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress={() => router.push(`/cancellation/new/${sub.id}` as any)}
        >
          <Text className="text-white font-semibold text-base">{t('subscriptions.cancel')}</Text>
        </Pressable>
      </View>
    </View>
  )
}

type InfoRowProps = {
  label: string
  value: string
  valueClassName?: string
  isLast?: boolean
}

function InfoRow({ label, value, valueClassName, isLast }: InfoRowProps) {
  return (
    <View
      className={`flex-row justify-between items-center px-4 py-3 ${
        isLast ? '' : 'border-b border-line'
      }`}
    >
      <Text className="text-sm text-muted">{label}</Text>
      <Text className={`text-sm font-medium ${valueClassName ?? 'text-ink'}`}>{value}</Text>
    </View>
  )
}
