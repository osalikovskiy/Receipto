import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { supabase } from '@/lib/supabase'

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', { body: {} })
  if (error) throw error
  await supabase.auth.signOut()
}

export async function exportData(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/export-data`
  const fileUri = FileSystem.cacheDirectory + 'receipto-export.json'

  const result = await FileSystem.downloadAsync(url, fileUri, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })
  if (result.status !== 200) throw new Error(`Export failed: ${result.status}`)

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Receipto Daten exportieren',
    })
  }
}
