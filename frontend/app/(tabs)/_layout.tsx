import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useI18n } from '@/src/i18n';
import { useAuth } from '@/src/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const tabColors = {
  light: { tint: '#D4A017', active: '#D4A017', inactive: '#A1887F' },
  dark: { tint: '#F0C040', active: '#F0C040', inactive: '#9E9E9E' },
};

function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  return (
    <TouchableOpacity
      onPress={() => setLanguage(language === 'en' ? 'mr' : 'en')}
      style={styles.langButton}
    >
      <Text style={styles.langText}>{t('lang.switch')}</Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { t } = useI18n();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = tabColors[colorScheme ?? 'light'];

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/login');
    }
  }, [isSignedIn, router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        headerShown: true,
        headerRight: () => <LanguageSwitcher />,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('app.name'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="household"
        options={{
          title: t('nav.household'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="surgery"
        options={{
          title: t('nav.surgery'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cross.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  langButton: { marginRight: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#FFF3E0' },
  langText: { fontSize: 13, fontWeight: '600', color: '#D4A017' },
});
