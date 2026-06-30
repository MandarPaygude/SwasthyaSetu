import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useI18n } from '@/src/i18n';
import TextInputField from './TextInputField';
import SelectField from './SelectField';
import { FAMILY_RELATIONS, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, EDUCATION_OPTIONS, OCCUPATION_OPTIONS } from '@/src/forms/household/fieldOptions';

export interface FamilyMemberData {
  name: string;
  relationship: string;
  gender: string;
  age: string;
  maritalStatus: string;
  education: string;
  occupation: string;
  occupationOther: string;
}

interface FamilyMemberCardProps {
  index: number;
  member: FamilyMemberData;
  errors: Record<string, string>;
  onChange: (index: number, field: keyof FamilyMemberData, value: string) => void;
  onRemove: (index: number) => void;
}

export default function FamilyMemberCard({ index, member, errors, onChange, onRemove }: FamilyMemberCardProps) {
  const { t } = useI18n();
  const colors = Colors.light;

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('household.memberName')} #{index + 1}
        </Text>
        <TouchableOpacity onPress={() => onRemove(index)}>
          <Text style={{ color: colors.error, fontSize: 14 }}>{t('household.removeMember')}</Text>
        </TouchableOpacity>
      </View>

      <TextInputField
        label={t('household.memberName')}
        value={member.name}
        onChangeText={(v) => onChange(index, 'name', v)}
        required error={errors[`member_${index}_name`]}
        maxLength={100}
      />

      <SelectField
        label={t('household.memberRelationship')}
        value={member.relationship}
        options={FAMILY_RELATIONS.map(v => ({ label: t(v), value: v }))}
        onSelect={(v) => onChange(index, 'relationship', v)}
        required error={errors[`member_${index}_relationship`]}
      />

      <SelectField
        label={t('household.memberGender')}
        value={member.gender}
        options={GENDER_OPTIONS.map(v => ({ label: t(v), value: v }))}
        onSelect={(v) => onChange(index, 'gender', v)}
        required error={errors[`member_${index}_gender`]}
      />

      <TextInputField
        label={t('household.memberAge')}
        value={member.age}
        onChangeText={(v) => onChange(index, 'age', v)}
        keyboardType="numeric"
        required error={errors[`member_${index}_age`]}
        maxLength={3}
      />

      <SelectField
        label={t('household.memberMaritalStatus')}
        value={member.maritalStatus}
        options={MARITAL_STATUS_OPTIONS.map(v => ({ label: t(v), value: v }))}
        onSelect={(v) => onChange(index, 'maritalStatus', v)}
        required error={errors[`member_${index}_maritalStatus`]}
      />

      <TextInputField
        label={t('household.memberEducation')}
        value={member.education}
        onChangeText={(v) => onChange(index, 'education', v)}
        required error={errors[`member_${index}_education`]}
        maxLength={100}
      />

      <SelectField
        label={t('household.memberOccupation')}
        value={member.occupation}
        options={OCCUPATION_OPTIONS.map(v => ({ label: t(v), value: v }))}
        onSelect={(v) => onChange(index, 'occupation', v)}
        required error={errors[`member_${index}_occupation`]}
      />

      {member.occupation === 'occupation.other' && (
        <TextInputField
          label={t('household.memberOccupationOther')}
          value={member.occupationOther}
          onChangeText={(v) => onChange(index, 'occupationOther', v)}
          maxLength={100}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 15, fontWeight: '700' },
});
