import { View, Text, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { BackButton } from '@/components/back-button'

export default function ImprintScreen() {
  const { t } = useTranslation()

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-12">
        <BackButton />
        <Text className="text-2xl font-bold text-gray-900 mb-6">{t('legal.imprint.title')}</Text>

        <Text className="text-xs text-amber-600 mb-6 italic">{t('legal.placeholderNotice')}</Text>

        <Text className="text-sm text-gray-700 leading-6">{t('legal.imprint.body')}</Text>
      </View>
    </ScrollView>
  )
}
