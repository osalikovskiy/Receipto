import { useState } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react-native'
import type { PurchasesPackage } from 'react-native-purchases'
import { BackButton } from '@/components/back-button'
import { getOfferings, purchasePackage, restorePurchases } from '@/lib/purchases'
import { ENTITLEMENTS_QUERY_KEY } from '@/hooks/use-entitlements'

const FEATURES = ['unlimited', 'priority', 'support'] as const

export default function PaywallScreen() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedType, setSelectedType] = useState<'monthly' | 'annual'>('monthly')
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  const { data: offering, isLoading: isLoadingOfferings } = useQuery({
    queryKey: ['offerings'],
    queryFn: getOfferings,
    staleTime: 1000 * 60 * 10,
  })

  const selectedPackage: PurchasesPackage | null = offering
    ? ((selectedType === 'annual' ? (offering.annual ?? offering.monthly) : offering.monthly) ??
      null)
    : null

  async function handlePurchase() {
    if (!selectedPackage) return
    setIsPurchasing(true)
    setPurchaseError(null)
    const result = await purchasePackage(selectedPackage)
    setIsPurchasing(false)
    if (result.success) {
      await queryClient.invalidateQueries({ queryKey: ENTITLEMENTS_QUERY_KEY })
      router.back()
      return
    }
    if (!result.userCancelled && result.message) {
      setPurchaseError(result.message)
    }
  }

  async function handleRestore() {
    setIsRestoring(true)
    setPurchaseError(null)
    const isPro = await restorePurchases()
    setIsRestoring(false)
    if (isPro) {
      await queryClient.invalidateQueries({ queryKey: ENTITLEMENTS_QUERY_KEY })
      router.back()
    } else {
      Alert.alert(t('paywall.restoreNone'))
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
        <View className="px-6 pt-16 pb-4">
          <BackButton />
          <Text className="text-3xl font-bold text-gray-900 mb-2">{t('paywall.title')}</Text>
          <Text className="text-base text-gray-500 leading-6">{t('paywall.subtitle')}</Text>
        </View>

        <View className="px-4 mt-4">
          {FEATURES.map((key) => (
            <View key={key} className="bg-app rounded-xl p-4 mb-3 flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-success/20 items-center justify-center mr-3">
                <Check size={18} color="#34C759" strokeWidth={2.5} />
              </View>
              <View className="flex-1 pt-1">
                <Text className="text-base font-semibold text-ink">
                  {t(`paywall.features.${key}.title`)}
                </Text>
                <Text className="text-sm text-muted mt-0.5">
                  {t(`paywall.features.${key}.body`)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="px-4 mt-2">
          {isLoadingOfferings ? (
            <View className="py-8 items-center">
              <ActivityIndicator />
            </View>
          ) : offering ? (
            <>
              {offering.monthly && (
                <Pressable
                  className={`rounded-xl p-4 mb-3 border-2 ${
                    selectedType === 'monthly' ? 'border-ink bg-ink' : 'border-line bg-white'
                  }`}
                  onPress={() => setSelectedType('monthly')}
                >
                  <Text
                    className={`text-base font-semibold ${
                      selectedType === 'monthly' ? 'text-white' : 'text-ink'
                    }`}
                  >
                    {offering.monthly.product.priceString} / {t('paywall.perMonth')}
                  </Text>
                  <Text
                    className={`text-xs mt-0.5 ${
                      selectedType === 'monthly' ? 'text-gray-300' : 'text-muted'
                    }`}
                  >
                    {t('paywall.cancelAnytime')}
                  </Text>
                </Pressable>
              )}
              {offering.annual && (
                <Pressable
                  className={`rounded-xl p-4 mb-3 border-2 ${
                    selectedType === 'annual' ? 'border-ink bg-ink' : 'border-line bg-white'
                  }`}
                  onPress={() => setSelectedType('annual')}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-base font-semibold ${
                        selectedType === 'annual' ? 'text-white' : 'text-ink'
                      }`}
                    >
                      {offering.annual.product.priceString} / {t('paywall.perYear')}
                    </Text>
                    <View className="bg-success rounded-full px-2 py-0.5">
                      <Text className="text-white text-xs font-bold">
                        {t('paywall.savePercent')}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className={`text-xs mt-0.5 ${
                      selectedType === 'annual' ? 'text-gray-300' : 'text-muted'
                    }`}
                  >
                    {t('paywall.cancelAnytime')}
                  </Text>
                </Pressable>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-line">
        {purchaseError && (
          <Text className="text-danger text-sm mb-2 text-center">{purchaseError}</Text>
        )}
        <Pressable
          className="bg-ink rounded-xl py-4 items-center disabled:opacity-50"
          onPress={handlePurchase}
          disabled={!selectedPackage || isPurchasing || isRestoring}
        >
          {isPurchasing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">{t('paywall.subscribe')}</Text>
          )}
        </Pressable>
        <Pressable
          className="py-3 items-center"
          onPress={handleRestore}
          disabled={isRestoring || isPurchasing}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text className="text-muted text-sm">{t('paywall.restore')}</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}
