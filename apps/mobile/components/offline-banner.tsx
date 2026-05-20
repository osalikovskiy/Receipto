import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { WifiOff } from 'lucide-react-native'
import { useNetwork } from '@/hooks/use-network'

export function OfflineBanner() {
  const { t } = useTranslation()
  const { isConnected } = useNetwork()

  if (isConnected !== false) return null

  return (
    <View
      className="absolute top-0 left-0 right-0 z-50 bg-gray-900 flex-row items-center justify-center gap-2 px-4 py-2"
      style={{ paddingTop: 52 }}
    >
      <WifiOff size={14} color="#ffffff" strokeWidth={2} />
      <Text className="text-white text-xs font-medium">{t('network.offline')}</Text>
    </View>
  )
}
