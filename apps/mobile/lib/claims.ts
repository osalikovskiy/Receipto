import * as MailComposer from 'expo-mail-composer'
import { supabase } from '@/lib/supabase'

type CreateDraftInput = {
  productId: string
  userId: string
  defectDescription: string
}

export async function createClaimDraft({
  productId,
  userId,
  defectDescription,
}: CreateDraftInput): Promise<string> {
  const { data, error } = await supabase
    .from('claims')
    .insert({
      user_id: userId,
      product_id: productId,
      claim_type: 'gewaehrleistung',
      status: 'draft',
      defect_description: defectDescription,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function generateClaimLetter(claimId: string): Promise<void> {
  // Wired to the generate-warranty-letter Edge Function in step 8.
  const { error } = await supabase.functions.invoke('generate-warranty-letter', {
    body: { claim_id: claimId },
  })
  if (error) throw error
}

export async function updateClaimLetter(claimId: string, letterText: string): Promise<void> {
  const { error } = await supabase
    .from('claims')
    .update({ letter_text: letterText })
    .eq('id', claimId)
  if (error) throw error
}

export type SendResult = 'sent' | 'saved' | 'cancelled' | 'unavailable'

type SendInput = {
  claimId: string
  productName: string
  letter: string
}

export async function sendClaimLetter({
  claimId,
  productName,
  letter,
}: SendInput): Promise<SendResult> {
  const isAvailable = await MailComposer.isAvailableAsync()
  if (!isAvailable) return 'unavailable'

  const result = await MailComposer.composeAsync({
    subject: `Reklamation: ${productName}`,
    body: letter,
    isHtml: false,
  })

  if (result.status === 'sent') {
    const { error } = await supabase
      .from('claims')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', claimId)
    if (error) throw error
    return 'sent'
  }

  if (result.status === 'saved') return 'saved'
  return 'cancelled'
}
