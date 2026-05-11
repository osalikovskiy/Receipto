import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useClaim } from '@/hooks/use-claim'
import { updateClaimLetter, sendClaimLetter } from '@/lib/claims'
import { BackButton } from '@/components/back-button'

export default function ClaimPreviewScreen() {
  const { t } = useTranslation()
  const { claimId } = useLocalSearchParams<{ claimId: string }>()
  const { data: claim, refetch } = useClaim(claimId)
  const [isEditing, setIsEditing] = useState(false)
  const [editedLetter, setEditedLetter] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  // Seed the editor when the letter first arrives
  useEffect(() => {
    if (claim?.letter_text && editedLetter === '') {
      setEditedLetter(claim.letter_text)
    }
  }, [claim?.letter_text, editedLetter])

  async function handleSaveEdits() {
    if (!claimId) return
    setIsSaving(true)
    setSaveError(null)
    try {
      await updateClaimLetter(claimId, editedLetter)
      await refetch()
      setIsEditing(false)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSend() {
    if (!claim?.letter_text) return
    const subjectName = claim.products?.name ?? claim.subscriptions_tracked?.service_name ?? '—'
    setIsSending(true)
    setSendError(null)
    try {
      const result = await sendClaimLetter({
        claimId: claim.id,
        productName: subjectName,
        letter: claim.letter_text,
      })
      if (result === 'sent') {
        await refetch()
        router.back()
      } else if (result === 'unavailable') {
        setSendError(t('claim.preview.mailUnavailable'))
      }
      // 'saved' / 'cancelled' → silent (user closed mail composer without sending)
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsSending(false)
    }
  }

  if (!claim) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    )
  }

  const product = claim.products
  const subscription = claim.subscriptions_tracked
  const receipt = product?.receipts ?? null
  const letterReady = Boolean(claim.letter_text)
  const isCancellation = claim.claim_type === 'kuendigung'

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 pt-16 pb-4">
          <BackButton />
          <Text className="text-2xl font-bold text-gray-900">{t('claim.preview.title')}</Text>
        </View>

        <View className="px-4">
          <View className="bg-white rounded-xl p-4 mb-3">
            <Text className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              {isCancellation ? t('claim.preview.subscription') : t('claim.preview.product')}
            </Text>
            <Text className="text-base font-semibold text-gray-900">
              {isCancellation ? (subscription?.service_name ?? '—') : (product?.name ?? '—')}
            </Text>
            {receipt?.merchant && (
              <Text className="text-sm text-gray-500 mt-1">{receipt.merchant}</Text>
            )}
          </View>

          {!isCancellation && (
            <View className="bg-white rounded-xl p-4 mb-3">
              <Text className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                {t('claim.preview.defect')}
              </Text>
              <Text className="text-sm text-gray-900">{claim.defect_description ?? '—'}</Text>
            </View>
          )}

          <View className="bg-white rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs uppercase tracking-wide text-gray-500">
                {t('claim.preview.letter')}
              </Text>
              {letterReady && !isEditing && (
                <Pressable onPress={() => setIsEditing(true)}>
                  <Text className="text-blue-500 text-sm font-semibold">
                    {t('claim.preview.edit')}
                  </Text>
                </Pressable>
              )}
            </View>

            {!letterReady && (
              <View className="py-6 items-center">
                <ActivityIndicator />
                <Text className="text-sm text-gray-500 mt-3">{t('claim.preview.generating')}</Text>
              </View>
            )}

            {letterReady && !isEditing && (
              <Text className="text-sm text-gray-900 leading-6">{claim.letter_text}</Text>
            )}

            {letterReady && isEditing && (
              <>
                <TextInput
                  className="text-sm text-gray-900 min-h-[400px]"
                  value={editedLetter}
                  onChangeText={setEditedLetter}
                  multiline
                  textAlignVertical="top"
                />
                {saveError && <Text className="text-red-500 text-sm mt-2">{saveError}</Text>}
                <View className="flex-row gap-3 mt-3">
                  <Pressable
                    className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
                    onPress={() => {
                      setEditedLetter(claim.letter_text ?? '')
                      setIsEditing(false)
                      setSaveError(null)
                    }}
                    disabled={isSaving}
                  >
                    <Text className="text-gray-900 font-semibold">{t('claim.preview.cancel')}</Text>
                  </Pressable>
                  <Pressable
                    className="flex-1 bg-black rounded-xl py-3 items-center disabled:opacity-50"
                    onPress={handleSaveEdits}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-semibold">{t('claim.preview.save')}</Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
        {sendError && <Text className="text-red-500 text-sm mb-2 text-center">{sendError}</Text>}
        <Pressable
          className="bg-black rounded-xl py-4 items-center disabled:opacity-50"
          onPress={handleSend}
          disabled={!letterReady || isEditing || isSending || claim.status === 'sent'}
        >
          {isSending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {claim.status === 'sent'
                ? t('claim.preview.alreadySent')
                : letterReady
                  ? t('claim.preview.send')
                  : t('claim.preview.cantSendYet')}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}
