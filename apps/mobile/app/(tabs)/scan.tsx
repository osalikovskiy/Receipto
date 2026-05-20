import { useEffect } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'

// Dummy screen — the tab button opens /camera directly via tabBarButton override in _layout.tsx
export default function ScanTab() {
  useEffect(() => {
    router.replace('/camera')
  }, [])
  return <View className="flex-1 bg-app" />
}
