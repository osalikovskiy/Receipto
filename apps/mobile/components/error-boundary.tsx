import { Component, type ReactNode } from 'react'
import { View, Text, Pressable } from 'react-native'
import { captureException } from '@/lib/sentry'

type State = { error: Error | null }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: unknown): void {
    captureException(error, { componentStack: info })
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center bg-white px-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Etwas ist schiefgelaufen</Text>
          <Text className="text-sm text-gray-500 mb-8 text-center">{this.state.error.message}</Text>
          <Pressable
            className="bg-black rounded-xl px-6 py-4"
            onPress={() => this.setState({ error: null })}
          >
            <Text className="text-white font-semibold">Neu laden</Text>
          </Pressable>
        </View>
      )
    }
    return this.props.children
  }
}
