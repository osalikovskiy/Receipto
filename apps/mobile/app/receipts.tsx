import { useCallback, useMemo, useState } from 'react'
import { View, Text, Pressable, RefreshControl, TextInput, ActivityIndicator } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { FlashList } from '@shopify/flash-list'
import { Search, Receipt as ReceiptIcon } from 'lucide-react-native'
import { useReceipts } from '@/hooks/use-receipts'
import { SwipeableReceiptCard } from '@/components/swipeable-receipt-card'
import { BackButton } from '@/components/back-button'

type SortOrder = 'date_desc' | 'date_asc' | 'amount_desc'

export default function ReceiptsScreen() {
  const { t } = useTranslation()
  const { data: receipts, refetch, isRefetching, isLoading } = useReceipts()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('date_desc')

  useFocusEffect(
    useCallback(() => {
      void refetch()
    }, [refetch])
  )

  const filtered = useMemo(() => {
    if (!receipts) return []
    const q = search.trim().toLowerCase()
    const result = q
      ? receipts.filter((r) => r.merchant?.toLowerCase().includes(q) ?? false)
      : receipts.slice()
    result.sort((a, b) => {
      if (sort === 'amount_desc') return (b.total_amount ?? 0) - (a.total_amount ?? 0)
      const aDate = a.purchase_date ?? a.created_at
      const bDate = b.purchase_date ?? b.created_at
      const cmp = aDate.localeCompare(bDate)
      return sort === 'date_asc' ? cmp : -cmp
    })
    return result
  }, [receipts, search, sort])

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app">
        <ActivityIndicator />
      </View>
    )
  }

  const hasReceipts = (receipts?.length ?? 0) > 0

  return (
    <GestureHandlerRootView className="flex-1 bg-app">
      {/* Header */}
      <View className="bg-forest px-6 pt-16 pb-5">
        <BackButton light />
        <Text className="text-3xl font-bold text-white">{t('tabs.receipts')}</Text>
      </View>

      {hasReceipts && (
        <View className="px-4 pt-3 pb-1">
          <View className="bg-white rounded-xl flex-row items-center px-4 mb-2">
            <Search size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 py-3 ml-2 text-base text-ink"
              placeholder={t('receipts.searchPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
          </View>
          <View className="flex-row gap-2">
            {(['date_desc', 'date_asc', 'amount_desc'] as const).map((option) => (
              <Pressable
                key={option}
                onPress={() => setSort(option)}
                className={
                  sort === option
                    ? 'flex-1 bg-forest rounded-lg py-2 items-center'
                    : 'flex-1 bg-white rounded-lg py-2 items-center'
                }
              >
                <Text
                  className={
                    sort === option ? 'text-white text-xs font-semibold' : 'text-muted text-xs'
                  }
                >
                  {t(`receipts.sort.${option}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {hasReceipts ? (
        <FlashList
          data={filtered}
          renderItem={({ item }) => (
            <SwipeableReceiptCard
              receipt={item}
              onPress={() => router.push(`/receipt/${item.id}` as never)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-6">
            <ReceiptIcon size={40} color="#9CA3AF" strokeWidth={1.5} />
          </View>
          <Text className="text-xl font-semibold text-ink">{t('receipts.emptyTitle')}</Text>
          <Text className="text-sm text-muted mt-2 text-center">{t('receipts.emptySubtitle')}</Text>
        </View>
      )}
    </GestureHandlerRootView>
  )
}
