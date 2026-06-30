import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import FormField from './FormField';

interface SelectFieldProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  required?: boolean;
  error?: string;
  columns?: 1 | 2;
}

export default function SelectField({
  label, value, options, onSelect, required, error, columns = 1,
}: SelectFieldProps) {
  const colors = Colors.light;
  return (
    <FormField label={label} required={required} error={error}>
      <View style={[styles.optionsContainer, columns === 2 && styles.twoColumns]}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
              style={[
                styles.option,
                columns === 2 && styles.optionTwoColumn,
                {
                  borderColor: value === opt.value ? colors.primary : colors.inputBorder,
                  backgroundColor: value === opt.value ? colors.primary + '15' : colors.inputBackground,
                },
              ]}
            onPress={() => onSelect(opt.value)}
          >
            <View style={[styles.radio, { borderColor: value === opt.value ? colors.primary : colors.border }]}>
              {value === opt.value && <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />}
            </View>
            <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  optionsContainer: { gap: 8 },
  twoColumns: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 8, borderWidth: 1, gap: 10,
  },
  optionTwoColumn: {
    flex: 1,
  },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  radioFill: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: { fontSize: 14, flex: 1 },
});
