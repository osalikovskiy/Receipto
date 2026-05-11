import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { calculateWarrantyState } from '@/lib/warranty'

type Props = {
  startDate: string
  beweislastumkehrEnd: string
  warrantyEnd: string
}

export function WarrantyTimeline({ startDate, beweislastumkehrEnd, warrantyEnd }: Props) {
  const { t } = useTranslation()
  const beweisState = calculateWarrantyState(startDate, beweislastumkehrEnd)
  const totalState = calculateWarrantyState(startDate, warrantyEnd)

  // Position of today dot as percentage of full 24-month bar
  const todayPercent = Math.min(100, Math.max(0, totalState.percentElapsed))
  // First segment is 50% of bar (months 1–12), second is 50% (13–24)
  const inGefahrenzone = beweisState.isExpired && !totalState.isExpired

  return (
    <View className="bg-white rounded-2xl p-4 mb-3">
      <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
        {t('product.warranty.timeline')}
      </Text>

      {/* Bar */}
      <View className="flex-row h-3 rounded-full overflow-hidden mb-2">
        <View className="flex-1 bg-success/30" />
        <View className="flex-1 bg-warning/30" />
      </View>

      {/* Today dot overlay */}
      <View className="relative" style={{ height: 0 }}>
        <View
          className="absolute -top-5 w-3 h-3 rounded-full bg-ink border-2 border-white"
          style={{ left: `${todayPercent}%`, marginLeft: -6 }}
        />
      </View>

      {/* Labels */}
      <View className="flex-row mt-1">
        <View className="flex-1">
          <Text className="text-xs font-semibold text-success">
            {t('product.warranty.beweislastumkehr')}
          </Text>
          <Text className="text-xs text-muted">{t('product.warranty.month1to12')}</Text>
        </View>
        <View className="flex-1 items-end">
          <Text
            className={`text-xs font-semibold ${inGefahrenzone ? 'text-warning' : 'text-muted'}`}
          >
            {t('product.warranty.gefahrenzone')}
          </Text>
          <Text className="text-xs text-muted">{t('product.warranty.month13to24')}</Text>
        </View>
      </View>

      {/* Status row */}
      <View className="mt-3 pt-3 border-t border-line flex-row gap-3">
        <StatusPill
          label={t('product.warranty.beweislastumkehr')}
          daysRemaining={beweisState.daysRemaining}
          isExpired={beweisState.isExpired}
          t={t}
        />
        <StatusPill
          label={t('product.warranty.gewaehrleistung')}
          daysRemaining={totalState.daysRemaining}
          isExpired={totalState.isExpired}
          t={t}
        />
      </View>
    </View>
  )
}

function StatusPill({
  label,
  daysRemaining,
  isExpired,
  t,
}: {
  label: string
  daysRemaining: number
  isExpired: boolean
  t: (key: string, opts?: Record<string, unknown>) => string
}) {
  const color = isExpired ? 'text-danger' : daysRemaining <= 30 ? 'text-warning' : 'text-success'
  const bgColor = isExpired
    ? 'bg-danger/10'
    : daysRemaining <= 30
      ? 'bg-warning/10'
      : 'bg-success/10'
  const statusText = isExpired
    ? t('product.warranty.expired')
    : t('product.warranty.daysRemaining', { count: daysRemaining })

  return (
    <View className={`flex-1 rounded-xl p-3 ${bgColor}`}>
      <Text className="text-xs text-muted mb-0.5">{label}</Text>
      <Text className={`text-sm font-semibold ${color}`}>{statusText}</Text>
    </View>
  )
}
