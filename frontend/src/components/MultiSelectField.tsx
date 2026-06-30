import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import FormField from './FormField';

interface MultiSelectFieldProps {
  label: string;
  values: string[];
  options: { label: string; value: string }[];
  onToggle: (value: string) => void;
  required?: boolean;
  error?: string;
}

export default function MultiSelectField({
  label, values, options, onToggle, required, error,
}: MultiSelectFieldProps) {
  const colors = Colors.light;
  return (
    <FormField label={label} required={required} error={error}>
      <View style={styles.optionsContainer}>
        {options.map((opt) => {
          const selected = values.includes(opt.value);
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.option,
                {
                  borderColor: selected ? colors.primary : colors.inputBorder,
                  backgroundColor: selected ? colors.primary + '15' : colors.inputBackground,
                },
              ]}
              onPress={() => onToggle(opt.value)}
            >
              <View style={[styles.checkbox, { borderColor: selected ? colors.primary : colors.border }]}>
                {selected && <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>}
              </View>
              <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  optionsContainer: { gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 8, borderWidth: 1, gap: 10,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 4, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  checkmark: { fontSize: 14, fontWeight: 'bold' },
  optionLabel: { fontSize: 14, flex: 1 },
});
