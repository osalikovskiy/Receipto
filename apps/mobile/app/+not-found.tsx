import { View, Text } from 'react-native'
import { Link } from 'expo-router'

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-5xl font-bold text-ink mb-3">404</Text>
      <Link href="/" className="text-accent text-base font-semibold">
        Zurück zur Startseite
      </Link>
    </View>
  )
}
