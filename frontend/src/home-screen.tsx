// Home Screen Component
// Shows "Hello [User's Name]" after login

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/src/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#007AFF',
    tabIconDefault: '#ccc',
    tabIconSelected: '#007AFF',
    inputBorder: '#ccc',
    inputBackground: '#f5f5f5',
    dangerButton: '#ff3333',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#0a7ea4',
    tabIconDefault: '#ccc',
    tabIconSelected: '#0a7ea4',
    inputBorder: '#444',
    inputBackground: '#222',
    dangerButton: '#ff6666',
  },
};

export default function HomeScreen() {
  const { user, logout, isLoading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];


  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          } finally {
            setLoggingOut(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>
          Hello, {user?.name}! 👋
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.text }]}>
          Welcome to Sevadham Community Service Platform
        </Text>
      </View>

      {/* User Info Card */}
      <View style={[styles.userCard, { borderColor: colors.inputBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Your Profile</Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Name:</Text>
          <Text style={[styles.infoValue, { color: colors.tint }]}>{user?.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Phone:</Text>
          <Text style={[styles.infoValue, { color: colors.tint }]}>+91 {user?.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>User ID:</Text>
          <Text style={[styles.infoValue, { color: colors.tint }]}>{user?.id}</Text>
        </View>
      </View>

      {/* Status Box */}
      <View style={[styles.statusBox, { backgroundColor: colors.inputBackground }]}>
        <Text style={[styles.statusTitle, { color: colors.text }]}>✅ Status</Text>
        <Text style={[styles.statusText, { color: colors.text }]}>
          You are successfully logged in and authenticated!
        </Text>
        <Text style={[styles.statusText, { color: colors.text }]}>
          Your session is secure and token-based.
        </Text>
      </View>

      {/* Coming Soon Section */}
      <View style={[styles.featureBox, { borderColor: colors.inputBorder }]}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>🚀 Coming Soon</Text>
        <Text style={[styles.featureText, { color: colors.text }]}>
          • Browse volunteer opportunities
        </Text>
        <Text style={[styles.featureText, { color: colors.text }]}>
          • Join community events
        </Text>
        <Text style={[styles.featureText, { color: colors.text }]}>
          • Track your contributions
        </Text>
        <Text style={[styles.featureText, { color: colors.text }]}>
          • Connect with other volunteers
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          {
            backgroundColor: colors.dangerButton,
            opacity: loggingOut ? 0.6 : 1,
          },
        ]}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.logoutButtonText}>Logout</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 30,
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  userCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  featureBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 20,
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
