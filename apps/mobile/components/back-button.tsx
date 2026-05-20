import { Pressable } from 'react-native'
import { router } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'

type Props = { light?: boolean }

export function BackButton({ light }: Props) {
  return (
    <Pressable onPress={() => router.back()} className="mb-3 -ml-2 self-start p-2">
      <ChevronLeft size={28} color={light ? 'rgba(255,255,255,0.85)' : '#007AFF'} strokeWidth={2} />
    </Pressable>
  )
}
