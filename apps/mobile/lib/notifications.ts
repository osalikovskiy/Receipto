import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { supabase } from '@/lib/supabase'

// Foreground display behavior — shown for Beweislastumkehr/Gewährleistung reminders
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  })
}

export type RegisterResult =
  | { status: 'success'; token: string }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'error'; message: string }

export async function registerPushToken(): Promise<RegisterResult> {
  await ensureAndroidChannel()

  const existing = await Notifications.getPermissionsAsync()
  let status = existing.status

  if (status !== 'granted' && existing.canAskAgain) {
    const requested = await Notifications.requestPermissionsAsync()
    status = requested.status
  }

  if (status !== 'granted') {
    return { status: 'denied', canAskAgain: existing.canAskAgain }
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    const result = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)
    const token = result.data

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { status: 'error', message: 'Not authenticated' }

    const { error } = await supabase.from('users').update({ push_token: token }).eq('id', user.id)
    if (error) return { status: 'error', message: error.message }

    return { status: 'success', token }
  } catch (e) {
    return {
      status: 'error',
      message: e instanceof Error ? e.message : 'Unknown error',
    }
  }
}
