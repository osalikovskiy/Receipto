import { Pressable } from 'react-native'
import { Tabs, router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, CreditCard, Camera, Sparkles, User } from 'lucide-react-native'

export default function TabsLayout() {
  const { t } = useTranslation()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#192B1B',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopColor: '#E5E5EA',
          backgroundColor: '#FFFFFF',
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.uebersicht'),
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: t('tabs.abos'),
          tabBarIcon: ({ color, size }) => (
            <CreditCard size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: () => (
            <Pressable
              onPress={() => router.push('/camera')}
              style={{
                top: -16,
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#192B1B',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#192B1B',
                shadowOpacity: 0.35,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              }}
            >
              <Camera size={26} color="#FFFFFF" strokeWidth={2} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="ki-assistant"
        options={{
          title: t('tabs.assistant'),
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.profil'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  )
}
