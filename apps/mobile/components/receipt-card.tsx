import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ChevronRight, AlertCircle } from 'lucide-react-native'
import { formatDate, formatMoney } from '@/lib/formatters'
import type { Receipt } from '@/hooks/use-receipts'

type Props = {
  receipt: Receipt
  onPress?: () => void
}

export function ReceiptCard({ receipt, onPress }: Props) {
  const { t } = useTranslation()
  const isPending = receipt.ocr_status === 'pending'
  const isFailed = receipt.ocr_status === 'failed'

  return (
    <Pressable
      className="bg-white mx-4 mb-3 rounded-xl px-4 py-4 flex-row items-center"
      onPress={onPress}
    >
      <View className="flex-1 pr-3">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {isPending ? t('receipts.processing') : (receipt.merchant ?? t('receipts.unknown'))}
        </Text>
        <Text className="text-sm text-muted mt-1">
          {receipt.purchase_date ? formatDate(receipt.purchase_date) : '—'}
        </Text>
      </View>

      <View className="items-end mr-1">
        {isPending && <ActivityIndicator size="small" color="#9CA3AF" />}
        {!isPending && !isFailed && receipt.total_amount !== null && (
          <Text className="text-base font-semibold text-ink">
            {formatMoney(receipt.total_amount, receipt.currency)}
          </Text>
        )}
        {isFailed && (
          <View className="flex-row items-center">
            <AlertCircle size={14} color="#FF3B30" />
            <Text className="text-xs text-danger font-semibold ml-1">{t('receipts.failed')}</Text>
          </View>
        )}
      </View>
      <ChevronRight size={18} color="#C7C7CC" />
    </Pressable>
  )
}
