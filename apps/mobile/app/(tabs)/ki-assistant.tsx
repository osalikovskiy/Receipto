import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react-native'

export default function KIAssistantScreen() {
  const { t } = useTranslation()

  return (
    <View className="flex-1 bg-app">
      <View className="px-6 pt-16 pb-4">
        <Text className="text-3xl font-bold text-ink">{t('tabs.assistant')}</Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View className="w-20 h-20 rounded-full bg-forest/10 items-center justify-center mb-6">
          <Sparkles size={40} color="#192B1B" strokeWidth={1.5} />
        </View>
        <Text className="text-xl font-semibold text-ink text-center">
          {t('assistant.comingSoonTitle')}
        </Text>
        <Text className="text-sm text-muted mt-3 text-center leading-relaxed">
          {t('assistant.comingSoonBody')}
        </Text>
      </View>
    </View>
  )
}
