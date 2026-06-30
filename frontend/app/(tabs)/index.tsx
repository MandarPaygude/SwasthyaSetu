import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/auth-context';
import { useI18n } from '@/src/i18n';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const colors = Colors.light;

  const handleLogout = () => {
    Alert.alert(t('home.logout'), t('home.logoutConfirm'), [
      { text: t('home.cancel'), style: 'cancel' },
      { text: t('home.logout'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>
          {t('home.welcome', { name: user?.name || '' })}
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
          {t('home.welcomeSubtitle')}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('home.forms')}</Text>
        <TouchableOpacity
          style={[styles.formButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
          onPress={() => router.push('/household')}
        >
          <Text style={[styles.formButtonTitle, { color: colors.primary }]}>{t('nav.household')}</Text>
          <Text style={[styles.formButtonDesc, { color: colors.textSecondary }]}>{t('home.householdDesc')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.formButton, { backgroundColor: colors.accent + '15', borderColor: colors.accent, marginTop: 12 }]}
          onPress={() => router.push('/surgery')}
        >
          <Text style={[styles.formButtonTitle, { color: colors.accent }]}>{t('nav.surgery')}</Text>
          <Text style={[styles.formButtonDesc, { color: colors.textSecondary }]}>{t('home.surgeryDesc')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t('home.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  welcomeSection: { marginBottom: 30, paddingVertical: 20 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 14 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  formButton: { borderWidth: 1, borderRadius: 10, padding: 16 },
  formButtonTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  formButtonDesc: { fontSize: 13, lineHeight: 18 },
  logoutButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
