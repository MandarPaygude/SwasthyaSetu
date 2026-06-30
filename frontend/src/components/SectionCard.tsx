import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Colors } from '@/constants/theme';

export interface SectionCardHandle {
  expand: () => void;
}

interface SectionCardProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
}

const SectionCard = forwardRef<SectionCardHandle, SectionCardProps>(
  ({ title, defaultExpanded = true, children, onLayout }, ref) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const colors = Colors.light;

    useImperativeHandle(ref, () => ({
      expand: () => setExpanded(true),
    }));

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onLayout={onLayout}>
        <TouchableOpacity
          style={[styles.header, { backgroundColor: colors.sectionHeader }]}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.arrow, { color: colors.primary }]}>
            {expanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
        {expanded && <View style={styles.content}>{children}</View>}
      </View>
    );
  }
);

export default SectionCard;

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16,
  },
  title: { fontSize: 16, fontWeight: '700', flex: 1 },
  arrow: { fontSize: 12, marginLeft: 8 },
  content: { padding: 16, paddingTop: 8 },
});
