import * as SecureStore from 'expo-secure-store'

const KEYS = {
  locale: 'pref_locale',
} as const

export type Locale = 'de' | 'en'

export async function getStoredLocale(): Promise<Locale | null> {
  const value = await SecureStore.getItemAsync(KEYS.locale)
  if (value === 'de' || value === 'en') return value
  return null
}

export async function setStoredLocale(locale: Locale): Promise<void> {
  await SecureStore.setItemAsync(KEYS.locale, locale)
}
