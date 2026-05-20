import * as SecureStore from 'expo-secure-store'

const KEY = 'pref_onboarding_done'
const LETTER_CONSENT_KEY = 'pref_letter_consent'

export async function isOnboardingDone(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(KEY)
  return value === '1'
}

export async function markOnboardingDone(): Promise<void> {
  await SecureStore.setItemAsync(KEY, '1')
}

export async function isLetterConsentGiven(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(LETTER_CONSENT_KEY)
  return value === '1'
}

export async function markLetterConsentGiven(): Promise<void> {
  await SecureStore.setItemAsync(LETTER_CONSENT_KEY, '1')
}
