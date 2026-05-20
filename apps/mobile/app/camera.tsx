import { useRef, useState } from 'react'
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { X, Camera as CameraIcon } from 'lucide-react-native'
import { useAuthStore } from '@/stores/auth-store'
import {
  uploadReceiptImage,
  createPendingReceipt,
  triggerProcessReceipt,
  FreeTierLimitError,
} from '@/lib/upload-receipt'

export default function CameraScreen() {
  const { t } = useTranslation()
  const [permission, requestPermission] = useCameraPermissions()
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cameraRef = useRef<CameraView | null>(null)
  const userId = useAuthStore((s) => s.user?.id)

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="white" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <View className="w-20 h-20 rounded-full bg-app items-center justify-center mb-6">
          <CameraIcon size={40} color="#007AFF" strokeWidth={1.5} />
        </View>
        <Text className="text-xl font-semibold text-ink mb-3 text-center">
          {t('camera.permissionTitle')}
        </Text>
        <Text className="text-base text-muted mb-8 text-center">{t('camera.permissionBody')}</Text>
        <Pressable className="bg-ink rounded-xl px-6 py-4" onPress={requestPermission}>
          <Text className="text-white font-semibold">{t('camera.grantPermission')}</Text>
        </Pressable>
      </View>
    )
  }

  async function handleCapture() {
    const result = await cameraRef.current?.takePictureAsync({ quality: 0.8 })
    if (result?.uri) setPhotoUri(result.uri)
  }

  async function handleUpload() {
    if (!photoUri || !userId) return
    setIsUploading(true)
    setError(null)
    try {
      const imagePath = await uploadReceiptImage({ userId, photoUri })
      const receiptId = await createPendingReceipt(userId, imagePath)
      void triggerProcessReceipt(receiptId).catch((err) => {
        console.error('OCR trigger failed:', err)
      })
      router.back()
    } catch (e) {
      if (e instanceof FreeTierLimitError) {
        router.replace('/paywall')
        return
      }
      console.error(e)
      setError(t('camera.uploadFailed'))
    } finally {
      setIsUploading(false)
    }
  }

  if (photoUri) {
    return (
      <View className="flex-1 bg-black">
        <Image source={{ uri: photoUri }} className="flex-1" resizeMode="contain" />

        {error && (
          <View className="absolute top-12 left-4 right-4 bg-red-600 rounded-xl px-4 py-3">
            <Text className="text-white text-center">{error}</Text>
          </View>
        )}

        <View className="flex-row p-4 gap-3 bg-black">
          <Pressable
            className="flex-1 bg-gray-700 rounded-xl py-4 items-center"
            onPress={() => setPhotoUri(null)}
            disabled={isUploading}
          >
            <Text className="text-white font-semibold">{t('camera.retake')}</Text>
          </Pressable>
          <Pressable
            className="flex-1 bg-white rounded-xl py-4 items-center"
            onPress={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-black font-semibold">{t('camera.useThis')}</Text>
            )}
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      <View className="absolute top-14 left-4">
        <Pressable
          className="bg-black/50 rounded-full w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
          accessibilityLabel={t('camera.cancel')}
        >
          <X size={22} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
      </View>

      <View className="absolute bottom-12 left-0 right-0 items-center">
        <Pressable
          className="w-20 h-20 bg-white rounded-full border-4 border-gray-300"
          onPress={handleCapture}
          accessibilityLabel={t('camera.capture')}
        />
      </View>
    </View>
  )
}
