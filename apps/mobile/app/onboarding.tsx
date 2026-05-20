import { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Camera, Clock, Mail, type LucideIcon } from 'lucide-react-native'
import { markOnboardingDone } from '@/lib/onboarding'

const STEPS = ['scan', 'watch', 'reclaim'] as const
type Step = (typeof STEPS)[number]

const ICONS: Record<Step, LucideIcon> = {
  scan: Camera,
  watch: Clock,
  reclaim: Mail,
}

export default function OnboardingScreen() {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const step = STEPS[index]!
  const Icon = ICONS[step]
  const isLast = index === STEPS.length - 1

  async function handleNext() {
    if (isLast) {
      await markOnboardingDone()
      router.replace('/(tabs)')
    } else {
      setIndex(index + 1)
    }
  }

  async function handleSkip() {
    await markOnboardingDone()
    router.replace('/(tabs)')
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-end px-6 pt-16">
        <Pressable onPress={handleSkip}>
          <Text className="text-muted text-base">{t('onboarding.skip')}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        className="px-8"
      >
        <View className="items-center mb-10">
          <View className="w-24 h-24 rounded-full bg-app items-center justify-center">
            <Icon size={48} color="#007AFF" strokeWidth={1.5} />
          </View>
        </View>
        <Text className="text-3xl font-bold text-center text-ink mb-3">
          {t(`onboarding.${step}.title`)}
        </Text>
        <Text className="text-base text-center text-muted leading-6">
          {t(`onboarding.${step}.body`)}
        </Text>
      </ScrollView>

      <View className="px-6 pb-12">
        <View className="flex-row justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <View
              key={i}
              className={
                i === index ? 'w-8 h-2 rounded-full bg-ink' : 'w-2 h-2 rounded-full bg-line'
              }
            />
          ))}
        </View>

        <Pressable className="bg-ink rounded-xl py-4 items-center" onPress={handleNext}>
          <Text className="text-white font-semibold text-base">
            {isLast ? t('onboarding.start') : t('onboarding.next')}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
