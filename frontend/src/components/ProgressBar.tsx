import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useI18n } from '@/src/i18n';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const { t } = useI18n();
  const colors = Colors.light;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: colors.progressTrack }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors.progressFill }]} />
      </View>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {t('common.progress', { completed, total })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12, paddingHorizontal: 16 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  text: { fontSize: 12, marginTop: 4, textAlign: 'right' },
});
