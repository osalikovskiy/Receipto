import * as FileSystem from 'expo-file-system/legacy'
import { decode } from 'base64-arraybuffer'
import { supabase } from '@/lib/supabase'

type UploadInput = {
  userId: string
  photoUri: string
}

export async function uploadReceiptImage({ userId, photoUri }: UploadInput): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(photoUri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  const arrayBuffer = decode(base64)

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const path = `${userId}/${fileName}`

  const { error } = await supabase.storage
    .from('receipts')
    .upload(path, arrayBuffer, { contentType: 'image/jpeg' })
  if (error) throw error

  return path
}

export class FreeTierLimitError extends Error {
  constructor() {
    super('free_tier_limit_reached')
    this.name = 'FreeTierLimitError'
  }
}

export async function createPendingReceipt(userId: string, imagePath: string): Promise<string> {
  const { data, error } = await supabase
    .from('receipts')
    .insert({
      user_id: userId,
      image_path: imagePath,
      ocr_status: 'pending',
    })
    .select('id')
    .single()
  if (error) {
    // Trigger raises P0001 with message 'free_tier_limit_reached'
    if (error.message?.includes('free_tier_limit_reached')) {
      throw new FreeTierLimitError()
    }
    throw error
  }
  return data.id
}

export async function triggerProcessReceipt(receiptId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('process-receipt', {
    body: { receipt_id: receiptId },
  })
  if (error) throw error
}
