import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Plus, Clock, ChevronRight } from 'lucide-react-native'
import { useSubscriptions } from '@/hooks/use-subscriptions'
import { isZombie, createCancellationDraft, generateCancellationLetter } from '@/lib/subscriptions'
import { formatMoney } from '@/lib/formatters'
import { useAuthStore } from '@/stores/auth-store'
import { captureException } from '@/lib/sentry'
import type { SubscriptionRow } from '@/hooks/use-subscriptions'

export default function SubscriptionsScreen() {
  const { t } = useTranslation()
  const { data: subscriptions, isRefetching, refetch, isLoading } = useSubscriptions()

  const zombies = subscriptions?.filter(isZombie) ?? []
  const monthlySavings = zombies.reduce((sum, s) => {
    return sum + (s.billing_cycle === 'yearly' ? s.amount / 12 : s.amount)
  }, 0)

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app">
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-app">
      {/* Header */}
      <View className="bg-forest px-6 pt-16 pb-6">
        <Text className="text-3xl font-bold text-white">{t('tabs.abos')}</Text>
        {zombies.length > 0 && (
          <View className="mt-4 bg-white/10 rounded-2xl p-4">
            <Text className="text-white/60 text-xs uppercase tracking-wide mb-1">
              {t('subscriptions.potentialSavings')}
            </Text>
            <Text className="text-white text-2xl font-bold">
              {formatMoney(monthlySavings, 'EUR')}
              <Text className="text-base font-normal text-white/70">
                {' '}
                / {t('subscriptions.cycle.monthly')}
              </Text>
            </Text>
            <Text className="text-white/60 text-xs mt-1">
              {t('subscriptions.zombieFoundCount', { count: zombies.length })}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
        }
      >
        {subscriptions && subscriptions.length > 0 ? (
          <View className="px-4 gap-2">
            {subscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} sub={sub} />
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-8 py-20">
            <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-6">
              <ChevronRight size={40} color="#9CA3AF" strokeWidth={1.5} />
            </View>
            <Text className="text-xl font-semibold text-ink text-center">
              {t('subscriptions.emptyTitle')}
            </Text>
            <Text className="text-sm text-muted mt-2 text-center">
              {t('subscriptions.emptySubtitle')}
            </Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        className="absolute bottom-8 right-6 w-14 h-14 bg-forest rounded-full items-center justify-center"
        style={{
          shadowColor: '#192B1B',
          shadowOpacity: 0.35,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onPress={() => router.push('/subscription/new' as any)}
        accessibilityLabel={t('subscriptions.add')}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>
    </View>
  )
}

function SubscriptionCard({ sub }: { sub: SubscriptionRow }) {
  const { t } = useTranslation()
  const userId = useAuthStore((s) => s.user?.id)
  const zombie = isZombie(sub)
  const [isCancelling, setIsCancelling] = useState(false)

  const daysSinceUsed = sub.last_used
    ? Math.floor((Date.now() - new Date(sub.last_used).getTime()) / (1000 * 60 * 60 * 24))
    : null

  async function handleQuickCancel() {
    if (!userId) return
    Alert.alert(
      t('subscriptions.quickCancelTitle'),
      t('subscriptions.quickCancelBody', { name: sub.service_name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('subscriptions.generateLetter'),
          onPress: async () => {
            setIsCancelling(true)
            try {
              const claimId = await createCancellationDraft({ subscriptionId: sub.id, userId })
              await generateCancellationLetter(claimId)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              router.push(`/claim/preview/${claimId}` as any)
            } catch (e) {
              captureException(e)
            } finally {
              setIsCancelling(false)
            }
          },
        },
      ]
    )
  }

  return (
    <Pressable
      className="bg-white rounded-2xl p-4"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onPress={() => router.push(`/subscription/${sub.id}` as any)}
    >
      <View className="flex-row items-start justify-between mb-1">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-ink" numberOfLines={1}>
            {sub.service_name}
          </Text>
          <Text className="text-sm text-muted mt-0.5">
            {formatMoney(sub.amount, 'EUR')} /{' '}
            {t(`subscriptions.cycle.${sub.billing_cycle ?? 'monthly'}`)}
          </Text>
        </View>
        <View className={`rounded-lg px-2 py-1 ${zombie ? 'bg-danger/10' : 'bg-success/10'}`}>
          <Text className={`text-xs font-semibold ${zombie ? 'text-danger' : 'text-success'}`}>
            {zombie ? t('subscriptions.zombie') : t('subscriptions.active')}
          </Text>
        </View>
      </View>

      {daysSinceUsed !== null && (
        <View className="flex-row items-center mt-1 mb-2">
          <Clock size={12} color="#9CA3AF" strokeWidth={2} />
          <Text className="text-xs text-muted ml-1">
            {zombie
              ? t('subscriptions.zombieDays', { count: daysSinceUsed })
              : t('subscriptions.lastUsedDays', { count: daysSinceUsed })}
          </Text>
        </View>
      )}

      {zombie && (
        <Pressable
          className="mt-2 bg-forest rounded-xl py-2.5 items-center flex-row justify-center gap-2"
          onPress={handleQuickCancel}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-sm font-semibold">
              {t('subscriptions.quickCancel')}
            </Text>
          )}
        </Pressable>
      )}
    </Pressable>
  )
}
