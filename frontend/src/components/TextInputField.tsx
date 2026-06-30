import React, { useRef } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/theme';
import FormField from './FormField';

interface TextInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
  keyboardType?: 'default' | 'number-pad' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  editable?: boolean;
}

export default function TextInputField({
  label, value, onChangeText, placeholder, required, error,
  maxLength, keyboardType, multiline, editable,
}: TextInputFieldProps) {
  const colors = Colors.light;
  const inputRef = useRef<TextInput>(null);

  return (
    <FormField label={label} required={required} error={error}>
      <View style={[
        styles.inputContainer,
        { borderColor: error ? colors.error : colors.inputBorder, backgroundColor: colors.inputBackground },
      ]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A1887F"
          maxLength={maxLength}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={editable}
        />
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  inputContainer: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
  input: { paddingVertical: 12, fontSize: 16 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
