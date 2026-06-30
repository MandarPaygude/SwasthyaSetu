import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/auth-context';
import { useI18n } from '@/src/i18n';
import { Colors } from '@/constants/theme';

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

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { t } = useI18n();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const colors = Colors.light;

  const handleLogin = async () => {
    if (!phone.trim()) {
      setError(t('login.error.invalidPhone'));
      return;
    }

    if (phone.length < 10) {
      setError(t('login.error.invalidPhone'));
      return;
    }

    setError('');

    try {
      await login(phone);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('common.serverError');
      setError(errorMessage);
      Alert.alert(t('common.error'), errorMessage);
    }
  };

  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setPhone(numericText);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.contentContainer, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.langRow}>
          <LanguageSwitcher />
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>{t('app.name')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('app.tagline')}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>{t('login.phoneLabel')}</Text>

          <View
            style={[
              styles.inputContainer,
              {
                borderColor: error ? colors.errorText : colors.inputBorder,
                backgroundColor: colors.inputBackground,
              },
            ]}
          >
            <Text style={[styles.phonePrefix, { color: colors.textSecondary }]}>+91</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={t('login.phonePlaceholder')}
              placeholderTextColor={colors.tabIconDefault}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={handlePhoneChange}
              editable={!isLoading}
            />
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: colors.errorText }]}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>{t('login.button')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.infoBox, { borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>{t('login.hint')}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  langRow: { alignItems: 'flex-end', marginBottom: 10 },
  langButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FFF3E0',
  },
  langText: { fontSize: 13, fontWeight: '600', color: '#D4A017' },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  card: { borderWidth: 1, borderRadius: 12, padding: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  phonePrefix: { fontSize: 16, marginRight: 8, fontWeight: '600' },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  errorText: { fontSize: 12, marginBottom: 12, fontWeight: '500' },
  loginButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  infoBox: { borderWidth: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  infoTitle: { fontSize: 14, fontWeight: '500' },
});
