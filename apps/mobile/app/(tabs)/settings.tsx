import { useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  User,
  Globe,
  FileText,
  ScrollText,
  Download,
  Receipt,
  Trash2,
  LogOut,
  Check,
} from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { getStoredLocale, setStoredLocale, type Locale } from '@/lib/preferences'
import { deleteAccount, exportData } from '@/lib/gdpr'
import { exportWerbungskostenCSV } from '@/lib/steuer'
import { captureException } from '@/lib/sentry'
import i18n from '@/lib/i18n'

const LOCALES: readonly Locale[] = ['de', 'en'] as const

export default function ProfilScreen() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [locale, setLocaleState] = useState<Locale>('de')
  const [isExporting, setIsExporting] = useState(false)
  const [isSteuerExporting, setIsSteuerExporting] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    void (async () => {
      const stored = await getStoredLocale()
      setLocaleState(stored ?? (i18n.language.startsWith('de') ? 'de' : 'en'))
    })()
  }, [])

  async function handleLocaleChange(next: Locale) {
    setLocaleState(next)
    await i18n.changeLanguage(next)
    await setStoredLocale(next)
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      await exportData()
    } catch (e) {
      captureException(e)
      Alert.alert(t('settings.exportFailed'))
    } finally {
      setIsExporting(false)
    }
  }

  async function handleSteuerExport() {
    setIsSteuerExporting(true)
    try {
      await exportWerbungskostenCSV(currentYear)
    } catch (e) {
      captureException(e)
      Alert.alert(t('settings.steuerExportFailed'))
    } finally {
      setIsSteuerExporting(false)
    }
  }

  function handleDelete() {
    Alert.alert(t('settings.deleteConfirmTitle'), t('settings.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount()
          } catch (e) {
            captureException(e)
            Alert.alert(t('settings.deleteFailed'))
          }
        },
      },
    ])
  }

  async function handleSignOut() {
    if (user?.id) {
      await supabase.from('users').update({ push_token: null }).eq('id', user.id)
    }
    await supabase.auth.signOut()
  }

  return (
    <ScrollView className="flex-1 bg-app">
      {/* Header */}
      <View className="bg-forest px-6 pt-16 pb-8">
        <Text className="text-3xl font-bold text-white">{t('tabs.profil')}</Text>
        {user && (
          <View className="mt-4 flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
              <User size={24} color="rgba(255,255,255,0.9)" strokeWidth={1.8} />
            </View>
            <View>
              <Text className="text-white font-semibold text-base">{user.email}</Text>
              <Text className="text-white/60 text-xs mt-0.5">{t('profil.memberSince')}</Text>
            </View>
          </View>
        )}
      </View>

      <View className="px-4 pt-4 pb-12">
        {user && (
          <Section title={t('settings.profile')}>
            <Row
              icon={<User size={20} color="#192B1B" />}
              label={t('profil.editProfile')}
              onPress={() => router.push('/profile')}
              isLast
            />
          </Section>
        )}

        <Section title={t('settings.language')}>
          {LOCALES.map((value, index) => (
            <Row
              key={value}
              icon={index === 0 ? <Globe size={20} color="#192B1B" /> : null}
              label={t(`settings.locales.${value}`)}
              trailing={locale === value ? <Check size={20} color="#192B1B" /> : <View />}
              onPress={() => handleLocaleChange(value)}
              isLast={index === LOCALES.length - 1}
            />
          ))}
        </Section>

        <Section title={t('settings.legal')}>
          <Row
            icon={<FileText size={20} color="#192B1B" />}
            label={t('settings.privacy')}
            onPress={() => router.push('/legal/privacy')}
          />
          <Row
            icon={<ScrollText size={20} color="#192B1B" />}
            label={t('settings.imprint')}
            onPress={() => router.push('/legal/imprint')}
            isLast
          />
        </Section>

        <Section title={t('settings.data')}>
          <Row
            icon={<Receipt size={20} color="#192B1B" />}
            label={t('settings.steuerExport', { year: currentYear })}
            trailing={isSteuerExporting ? <ActivityIndicator size="small" /> : undefined}
            onPress={handleSteuerExport}
            disabled={isSteuerExporting}
          />
          <Row
            icon={<Download size={20} color="#192B1B" />}
            label={t('settings.exportData')}
            trailing={isExporting ? <ActivityIndicator size="small" /> : undefined}
            onPress={handleExport}
            disabled={isExporting}
          />
          <Row
            icon={<Trash2 size={20} color="#FF3B30" />}
            label={t('settings.deleteAccount')}
            labelClassName="text-danger"
            onPress={handleDelete}
            isLast
          />
        </Section>

        <Pressable
          className="bg-white rounded-2xl py-4 items-center flex-row justify-center mt-2"
          onPress={handleSignOut}
        >
          <LogOut size={18} color="#FF3B30" />
          <Text className="text-danger font-semibold text-base ml-2">{t('settings.signOut')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-xs uppercase tracking-wide text-muted mb-2 px-2">{title}</Text>
      <View className="bg-white rounded-2xl overflow-hidden">{children}</View>
    </View>
  )
}

type RowProps = {
  icon?: React.ReactNode
  label: string
  labelClassName?: string
  trailing?: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  isLast?: boolean
}

function Row({ icon, label, labelClassName, trailing, onPress, disabled, isLast }: RowProps) {
  return (
    <Pressable
      className={`flex-row items-center px-4 py-3.5 ${isLast ? '' : 'border-b border-line'}`}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <View className="mr-3">{icon}</View>}
      <Text className={`flex-1 text-base ${labelClassName ?? 'text-ink'}`}>{label}</Text>
      {trailing !== undefined ? trailing : <ChevronRight size={18} color="#9CA3AF" />}
    </Pressable>
  )
}
