import { useState } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator, Switch } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Shield, RotateCcw, BadgeDollarSign } from 'lucide-react-native'
import { useProduct } from '@/hooks/use-product'
import { WarrantyTimeline } from '@/components/warranty-timeline'
import { formatMoney, formatDate } from '@/lib/formatters'
import { BackButton } from '@/components/back-button'
import { toggleBeruflich } from '@/lib/steuer'
import { captureException } from '@/lib/sentry'
import { PRODUCTS_QUERY_KEY } from '@/hooks/use-products'

export default function ProductDetailScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: product, isLoading } = useProduct(id)
  const queryClient = useQueryClient()
  const [isToggling, setIsToggling] = useState(false)

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app">
        <ActivityIndicator />
      </View>
    )
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-app px-6">
        <Text className="text-base text-muted">{t('product.notFound')}</Text>
      </View>
    )
  }

  async function handleBeruflichToggle(value: boolean) {
    if (!id) return
    setIsToggling(true)
    try {
      await toggleBeruflich(id, value)
      await queryClient.invalidateQueries({ queryKey: ['products', id] })
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    } catch (e) {
      captureException(e)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <View className="flex-1 bg-app">
      {/* Dark header */}
      <View className="bg-forest px-6 pt-16 pb-6">
        <BackButton light />
        <Text className="text-2xl font-bold text-white mt-2">{product.name}</Text>
        {product.category && (
          <Text className="text-sm text-white/60 mt-1">
            {t(`product.categories.${product.category}`, { defaultValue: product.category })}
          </Text>
        )}
        <View className="flex-row items-baseline gap-2 mt-3">
          <Text className="text-3xl font-bold text-white">{formatMoney(product.price, 'EUR')}</Text>
          {product.quantity > 1 && (
            <Text className="text-base text-white/60">× {product.quantity}</Text>
          )}
        </View>
        <Text className="text-xs text-white/50 mt-1">
          {t('product.boughtOn', { date: formatDate(product.warranty_start_date) })}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="px-4 pt-4">
        {/* Timeline */}
        <WarrantyTimeline
          startDate={product.warranty_start_date}
          beweislastumkehrEnd={product.beweislastumkehr_end}
          warrantyEnd={product.warranty_end_date}
        />

        {/* Rights cards */}
        <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 px-1">
          {t('product.rightsTitle')}
        </Text>

        <RightCard
          icon={<Shield size={18} color="#192B1B" strokeWidth={2} />}
          title={t('product.rights.nacherfuellung')}
          body={t('product.rights.nacherfuellungBody')}
        />
        <RightCard
          icon={<RotateCcw size={18} color="#192B1B" strokeWidth={2} />}
          title={t('product.rights.ruecktritt')}
          body={t('product.rights.ruecktrittBody')}
        />
        <RightCard
          icon={<BadgeDollarSign size={18} color="#192B1B" strokeWidth={2} />}
          title={t('product.rights.schadensersatz')}
          body={t('product.rights.schadensersatzBody')}
          isLast
        />

        {/* Beruflich toggle */}
        <View className="bg-white rounded-2xl px-4 py-3 mt-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-base text-ink font-medium">{t('product.beruflich')}</Text>
              <Text className="text-xs text-muted mt-0.5">{t('product.beruflichHint')}</Text>
            </View>
            {isToggling ? (
              <ActivityIndicator size="small" />
            ) : (
              <Switch
                value={product.is_beruflich}
                onValueChange={handleBeruflichToggle}
                trackColor={{ true: '#192B1B' }}
              />
            )}
          </View>
        </View>

        {product.serial_number && (
          <View className="bg-white rounded-2xl px-4 py-3 mt-3">
            <Text className="text-xs text-muted mb-1">{t('product.serial')}</Text>
            <Text className="text-sm text-ink font-mono">{product.serial_number}</Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-app border-t border-line">
        <Pressable
          className="bg-forest rounded-2xl py-4 items-center"
          onPress={() => router.push(`/claim/new/${product.id}` as never)}
        >
          <Text className="text-white font-semibold text-base">{t('product.fileClaim')}</Text>
        </Pressable>
      </View>
    </View>
  )
}

function RightCard({
  icon,
  title,
  body,
  isLast,
}: {
  icon: React.ReactNode
  title: string
  body: string
  isLast?: boolean
}) {
  return (
    <View
      className={`bg-white px-4 py-3 flex-row items-start gap-3 ${
        isLast ? 'rounded-b-2xl' : 'border-b border-line'
      } ${!isLast ? '' : ''}`}
      style={!isLast ? {} : { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
    >
      <View className="w-8 h-8 rounded-xl bg-forest/10 items-center justify-center mt-0.5">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-ink">{title}</Text>
        <Text className="text-xs text-muted mt-0.5 leading-relaxed">{body}</Text>
      </View>
    </View>
  )
}
