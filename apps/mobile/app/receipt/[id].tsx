import { useCallback } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useReceiptDetail } from '@/hooks/use-receipt-detail'
import { calculateWarrantyState } from '@/lib/warranty'
import { formatDate, formatMoney } from '@/lib/formatters'
import { BackButton } from '@/components/back-button'

export default function ReceiptDetailScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: receipt, refetch, isLoading } = useReceiptDetail(id)

  useFocusEffect(
    useCallback(() => {
      void refetch()
    }, [refetch])
  )

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    )
  }

  if (!receipt) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-base text-gray-500">{t('receipt.notFound')}</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 pt-16 pb-4">
        <BackButton />

        <Text className="text-2xl font-bold text-gray-900">
          {receipt.merchant || t('receipts.unknown')}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {receipt.purchase_date ? formatDate(receipt.purchase_date) : '—'}
        </Text>
        {receipt.total_amount !== null && (
          <Text className="text-2xl font-bold text-gray-900 mt-3">
            {formatMoney(receipt.total_amount, receipt.currency)}
          </Text>
        )}
      </View>

      {receipt.image_url && (
        <View className="px-4 mb-4">
          <View className="bg-white rounded-xl overflow-hidden">
            <Image
              source={{ uri: receipt.image_url }}
              className="w-full aspect-[3/4]"
              resizeMode="contain"
            />
          </View>
        </View>
      )}

      <View className="px-6 pb-2">
        <Text className="text-xs uppercase tracking-wide text-gray-500">
          {t('receipt.detail.products')}
        </Text>
      </View>

      <View className="px-4 pb-12">
        {receipt.products.length === 0 ? (
          <View className="bg-white rounded-xl p-4 items-center">
            <Text className="text-sm text-gray-500 text-center">
              {receipt.ocr_status === 'pending'
                ? t('receipt.detail.processing')
                : t('receipt.detail.noProducts')}
            </Text>
          </View>
        ) : (
          receipt.products.map((product) => {
            const warranty = calculateWarrantyState(
              product.warranty_start_date,
              product.beweislastumkehr_end
            )
            return (
              <Pressable
                key={product.id}
                className="bg-white rounded-xl p-4 mb-3"
                onPress={() => router.push(`/product/${product.id}`)}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-3">
                    <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
                      {product.name}
                    </Text>
                    {product.category && (
                      <Text className="text-xs text-gray-500 mt-1">
                        {t(`product.categories.${product.category}`, {
                          defaultValue: product.category,
                        })}
                      </Text>
                    )}
                  </View>
                  <Text className="text-base font-semibold text-gray-900">
                    {formatMoney(product.price, receipt.currency)}
                  </Text>
                </View>

                <View className="mt-3 pt-3 border-t border-gray-100">
                  <Text
                    className={
                      warranty.isExpired
                        ? 'text-xs text-red-500 font-semibold'
                        : warranty.daysRemaining <= 30
                          ? 'text-xs text-amber-600 font-semibold'
                          : 'text-xs text-gray-600'
                    }
                  >
                    {warranty.isExpired
                      ? t('product.warranty.beweislastumkehrExpired')
                      : t('product.warranty.beweislastumkehrIn', {
                          count: warranty.daysRemaining,
                        })}
                  </Text>
                </View>
              </Pressable>
            )
          })
        )}
      </View>
    </ScrollView>
  )
}
