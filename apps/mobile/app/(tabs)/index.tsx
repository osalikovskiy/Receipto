import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ShieldCheck, Bell } from 'lucide-react-native'
import { useSubscriptions } from '@/hooks/use-subscriptions'
import { useProducts } from '@/hooks/use-products'
import { isZombie } from '@/lib/subscriptions'
import { calculateWarrantyState } from '@/lib/warranty'
import { formatMoney } from '@/lib/formatters'

export default function DashboardScreen() {
  const { t } = useTranslation()
  const { data: subscriptions } = useSubscriptions()
  const { data: products } = useProducts()

  // Savings from zombie subscriptions
  const zombies = subscriptions?.filter(isZombie) ?? []
  const zombieSavings = zombies.reduce((sum, s) => {
    const monthly = s.billing_cycle === 'yearly' ? s.amount / 12 : s.amount
    return sum + monthly
  }, 0)

  // Active warranties (not expired, sort by urgency)
  const activeWarranties = (products ?? [])
    .filter((p) => {
      const state = calculateWarrantyState(p.warranty_start_date, p.warranty_end_date)
      return !state.isExpired
    })
    .slice(0, 4)

  const hasSavings =
    zombieSavings > 0 ||
    activeWarranties.some((p) => {
      const s = calculateWarrantyState(p.warranty_start_date, p.beweislastumkehr_end)
      return !s.isExpired && s.daysRemaining <= 30
    })

  return (
    <ScrollView className="flex-1 bg-app" contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Hero */}
      <View className="bg-forest px-6 pt-16 pb-8">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white/60 text-xs font-semibold uppercase tracking-widest">
            {t('dashboard.appName')}
          </Text>
          <Pressable onPress={() => router.push('/notification-settings' as never)}>
            <Bell size={22} color="rgba(255,255,255,0.7)" strokeWidth={1.8} />
          </Pressable>
        </View>

        {hasSavings ? (
          <>
            <Text className="text-white/60 text-xs uppercase tracking-wide mb-1">
              {t('dashboard.potentialLabel')}
            </Text>
            <Text className="text-white text-4xl font-bold mb-1">
              {formatMoney(zombieSavings, 'EUR')}
            </Text>
            <Text className="text-white/70 text-sm">
              {t('dashboard.potentialSub', { count: zombies.length })}
            </Text>
          </>
        ) : (
          <>
            <Text className="text-white text-2xl font-bold mb-1">{t('dashboard.allGood')}</Text>
            <Text className="text-white/70 text-sm">{t('dashboard.allGoodSub')}</Text>
          </>
        )}
      </View>

      <View className="px-4 -mt-4 gap-3">
        {/* Abo-Check card */}
        {subscriptions !== undefined && (
          <Pressable
            className="bg-white rounded-2xl p-4"
            onPress={() => router.push('/(tabs)/subscriptions' as never)}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wide">
                {t('dashboard.aboCheck')}
              </Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </View>
            {zombies.length > 0 ? (
              <>
                <Text className="text-base font-semibold text-ink">
                  {t('dashboard.zombieFound', { count: zombies.length })}
                </Text>
                <Text className="text-sm text-muted mt-0.5">
                  {t('dashboard.zombieSavings', {
                    amount: formatMoney(zombieSavings, 'EUR'),
                  })}
                </Text>
                <View className="mt-3 bg-forest rounded-xl py-2.5 items-center">
                  <Text className="text-white text-sm font-semibold">
                    {t('dashboard.cancelNow')}
                  </Text>
                </View>
              </>
            ) : (
              <Text className="text-base font-semibold text-ink">
                {t('dashboard.noZombies', { count: subscriptions.length })}
              </Text>
            )}
          </Pressable>
        )}

        {/* Active warranties */}
        {activeWarranties.length > 0 && (
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wide">
                {t('dashboard.activeWarranties')}
              </Text>
              <Pressable onPress={() => router.push('/receipts' as never)}>
                <Text className="text-xs text-accent font-semibold">{t('dashboard.seeAll')}</Text>
              </Pressable>
            </View>
            {activeWarranties.map((product, i) => {
              const bState = calculateWarrantyState(
                product.warranty_start_date,
                product.beweislastumkehr_end
              )
              const urgent = !bState.isExpired && bState.daysRemaining <= 30
              const isLast = i === activeWarranties.length - 1
              return (
                <Pressable
                  key={product.id}
                  className={`flex-row items-center py-3 ${isLast ? '' : 'border-b border-line'}`}
                  onPress={() => router.push(`/product/${product.id}` as never)}
                >
                  <View className="w-9 h-9 rounded-xl bg-forest/10 items-center justify-center mr-3">
                    <ShieldCheck size={18} color="#192B1B" strokeWidth={1.8} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text className="text-xs text-muted mt-0.5">
                      {t('product.warranty.beweislastumkehr')}
                    </Text>
                  </View>
                  <View
                    className={`rounded-lg px-2 py-1 ${
                      bState.isExpired ? 'bg-danger/10' : urgent ? 'bg-warning/10' : 'bg-success/10'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        bState.isExpired ? 'text-danger' : urgent ? 'text-warning' : 'text-success'
                      }`}
                    >
                      {bState.isExpired
                        ? t('product.warranty.expired')
                        : t('product.warranty.daysRemaining', {
                            count: bState.daysRemaining,
                          })}
                    </Text>
                  </View>
                </Pressable>
              )
            })}
          </View>
        )}

        {/* Empty state */}
        {!subscriptions && !products && (
          <View className="items-center py-12">
            <ActivityIndicator />
          </View>
        )}

        {subscriptions?.length === 0 && activeWarranties.length === 0 && (
          <View className="bg-white rounded-2xl p-6 items-center">
            <Text className="text-base font-semibold text-ink mb-2">
              {t('dashboard.emptyTitle')}
            </Text>
            <Text className="text-sm text-muted text-center">{t('dashboard.emptySub')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
