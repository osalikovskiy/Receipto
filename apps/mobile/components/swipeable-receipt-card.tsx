import { useRef } from 'react'
import { Animated, View, Pressable } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react-native'
import { ReceiptCard } from '@/components/receipt-card'
import { deleteReceipt } from '@/lib/delete-receipt'
import { captureException } from '@/lib/sentry'
import type { Receipt } from '@/hooks/use-receipts'

type Props = {
  receipt: Receipt
  onPress?: () => void
}

export function SwipeableReceiptCard({ receipt, onPress }: Props) {
  const queryClient = useQueryClient()
  const swipeRef = useRef<Swipeable>(null)

  async function handleDelete() {
    try {
      await deleteReceipt(receipt.id, receipt.image_path)
      void queryClient.invalidateQueries({ queryKey: ['receipts'] })
    } catch (e) {
      captureException(e)
      swipeRef.current?.close()
    }
  }

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={(_, dragX) => {
        const scale = dragX.interpolate({
          inputRange: [-80, 0],
          outputRange: [1, 0],
          extrapolate: 'clamp',
        })
        return (
          <Pressable
            className="bg-danger mr-4 mb-3 rounded-xl px-6 justify-center"
            onPress={handleDelete}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Trash2 size={20} color="#FFFFFF" strokeWidth={2} />
            </Animated.View>
          </Pressable>
        )
      }}
      overshootRight={false}
    >
      <View>
        <ReceiptCard receipt={receipt} onPress={onPress} />
      </View>
    </Swipeable>
  )
}
