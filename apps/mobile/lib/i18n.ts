import 'intl-pluralrules'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'
import de from '../locales/de.json'
import en from '../locales/en.json'

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
  lng: Localization.getLocales()[0]?.languageCode ?? 'de',
  fallbackLng: 'de',
  interpolation: { escapeValue: false },
})

export default i18n
