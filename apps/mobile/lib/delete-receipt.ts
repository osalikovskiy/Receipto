import { supabase } from '@/lib/supabase'

export async function deleteReceipt(receiptId: string, imagePath: string): Promise<void> {
  // Storage object isn't cascaded by the FK, delete it explicitly first
  await supabase.storage.from('receipts').remove([imagePath])
  const { error } = await supabase.from('receipts').delete().eq('id', receiptId)
  if (error) throw error
}
