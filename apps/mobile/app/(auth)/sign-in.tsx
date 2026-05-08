import { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { authRedirectUrl } from '@/lib/auth-deep-link'

type Step = 'email' | 'code'

export default function SignIn() {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendCode() {
    setIsLoading(true)
    setError(null)
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: authRedirectUrl },
    })
    setIsLoading(false)
    if (sendError) {
      setError(sendError.message)
      return
    }
    setStep('code')
  }

  async function handleVerifyCode() {
    setIsLoading(true)
    setError(null)
    const token = code.trim()
    // Existing user: token is type 'email'. New user: type 'signup'.
    // We don't know in advance, so try email first, fall back to signup.
    let result = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (result.error) {
      result = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
    }
    setIsLoading(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    // Auth state listener in _layout.tsx handles the redirect
  }

  if (step === 'code') {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">{t('auth.checkEmail')}</Text>
        <Text className="text-base text-gray-500 mb-8 text-center">
          {t('auth.codeInstruction', { email })}
        </Text>

        <TextInput
          className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-2xl text-center tracking-[6px] text-gray-900"
          placeholder="••••••"
          placeholderTextColor="#9CA3AF"
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={10}
          autoFocus
        />

        {error && <Text className="text-red-500 text-sm mb-4 text-center">{error}</Text>}

        <Pressable
          className="w-full bg-black rounded-xl py-4 items-center disabled:opacity-50 mb-3"
          onPress={handleVerifyCode}
          disabled={isLoading || code.length < 6}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">{t('auth.verifyCode')}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => setStep('email')}>
          <Text className="text-gray-500 text-sm">{t('auth.changeEmail')}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Receipto</Text>
      <Text className="text-base text-gray-500 mb-8 text-center">{t('auth.subtitle')}</Text>

      <TextInput
        className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base text-gray-900"
        placeholder={t('auth.emailPlaceholder')}
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {error && <Text className="text-red-500 text-sm mb-4 text-center">{error}</Text>}

      <Pressable
        className="w-full bg-black rounded-xl py-4 items-center disabled:opacity-50"
        onPress={handleSendCode}
        disabled={isLoading || !email}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-base">{t('auth.sendCode')}</Text>
        )}
      </Pressable>
    </View>
  )
}
