import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { calculateWarrantyState } from '@/lib/warranty'
import { formatDate } from '@/lib/formatters'

type Props = {
  title: string
  bgbReference: string
  startDate: string
  endDate: string
}

export function WarrantyCard({ title, bgbReference, startDate, endDate }: Props) {
  const { t } = useTranslation()
  const { daysRemaining, percentElapsed, isExpired } = calculateWarrantyState(startDate, endDate)

  const barColor = isExpired ? 'bg-red-500' : daysRemaining <= 30 ? 'bg-amber-500' : 'bg-blue-500'

  return (
    <View className="bg-white rounded-xl p-4 mb-3">
      <View className="flex-row items-baseline justify-between mb-1">
        <Text className="text-base font-semibold text-gray-900">{title}</Text>
        <Text className="text-xs text-gray-500">{bgbReference}</Text>
      </View>

      <Text className="text-sm text-gray-500 mb-3">
        {t('product.warranty.endsOn', { date: formatDate(endDate) })}
      </Text>

      <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <View className={`h-full ${barColor}`} style={{ width: `${percentElapsed}%` }} />
      </View>

      <Text
        className={
          isExpired
            ? 'text-sm text-red-500 font-semibold'
            : daysRemaining <= 30
              ? 'text-sm text-amber-600 font-semibold'
              : 'text-sm text-gray-700'
        }
      >
        {isExpired
          ? t('product.warranty.expired')
          : t('product.warranty.daysRemaining', { count: daysRemaining })}
      </Text>
    </View>
  )
}
