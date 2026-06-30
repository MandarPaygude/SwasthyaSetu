import React, { useState, useRef } from 'react';
import type { SectionCardHandle } from '@/src/components/SectionCard';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import { useI18n } from '@/src/i18n';
import { useAuth } from '@/src/auth-context';
import { cleanValue } from '@/src/utils';
import SectionCard from '@/src/components/SectionCard';
import TextInputField from '@/src/components/TextInputField';
import SelectField from '@/src/components/SelectField';
import MultiSelectField from '@/src/components/MultiSelectField';
import ProgressBar from '@/src/components/ProgressBar';
import FamilyMemberCard, { FamilyMemberData } from '@/src/components/FamilyMemberCard';
import {
  WARD_OPTIONS, RELIGION_OPTIONS, CASTE_OPTIONS, YES_NO_DK, YES_NO,
  RATION_CARD_TYPES, INSURANCE_TYPES, HOUSE_TYPES, TOILET_TYPES,
  LIGHTING_OPTIONS, FUEL_OPTIONS, WATER_OPTIONS, INCOME_SOURCES,
  FAMILY_TYPES, ILLNESS_OPTIONS,
} from './fieldOptions';

interface FormState {
  survey_location: string; surveyor_name: string; interview_date: string;
  house_address: string; respondent_name: string; ward: string; ward_code: string;
  house_code_uhi: string; colony_name: string; mobile_number: string;
  religion: string; religion_other: string; caste_category: string;
  has_ration_card: string; ration_card_type: string;
  has_poverty_certificate: string; has_ayushman_card: string; has_aadhaar: string;
  has_pan: string; has_sgy_card: string; has_ncd_card: string; has_other_card: string;
  has_health_insurance: string; insurance_type: string;
  years_in_area: string; house_type: string; is_own_house: string;
  rent_amount: string; has_separate_kitchen: string; number_of_rooms: string;
  toilet_type: string; lighting_source: string; cooking_fuel: string;
  drinking_water_source: string; income_source: string; monthly_income: string;
  monthly_health_expense: string; illness_types: string[];
  illness_other: string; knows_generic_medicines: string; would_buy_generic: string;
  family_type: string; adult_count: string; child_count: string; total_members: string;
  family_members: FamilyMemberData[];
  had_surgery_last_year: string; had_unmet_surgical_need: string;
}

const INITIAL_STATE: FormState = {
  survey_location: '', surveyor_name: '', interview_date: '',
  house_address: '', respondent_name: '', ward: '', ward_code: '',
  house_code_uhi: '', colony_name: '', mobile_number: '',
  religion: '', religion_other: '', caste_category: '',
  has_ration_card: '', ration_card_type: '',
  has_poverty_certificate: '', has_ayushman_card: '', has_aadhaar: '',
  has_pan: '', has_sgy_card: '', has_ncd_card: '', has_other_card: '',
  has_health_insurance: '', insurance_type: '',
  years_in_area: '', house_type: '', is_own_house: '',
  rent_amount: '', has_separate_kitchen: '', number_of_rooms: '',
  toilet_type: '', lighting_source: '', cooking_fuel: '',
  drinking_water_source: '', income_source: '', monthly_income: '',
  monthly_health_expense: '', illness_types: [],
  illness_other: '', knows_generic_medicines: '', would_buy_generic: '',
  family_type: '', adult_count: '', child_count: '', total_members: '',
  family_members: [],
  had_surgery_last_year: '', had_unmet_surgical_need: '',
};

const FIELD_LABELS: Record<string, string> = {
  survey_location: 'household.surveyLocation',
  surveyor_name: 'household.surveyorName',
  interview_date: 'household.interviewDate',
  house_address: 'household.houseAddress',
  respondent_name: 'household.respondentName',
  ward: 'household.ward',
  ward_code: 'household.wardCode',
  house_code_uhi: 'household.houseCode',
  colony_name: 'household.colonyName',
  mobile_number: 'household.mobileNumber',
  religion: 'household.religion',
  religion_other: 'household.religionOther',
  caste_category: 'household.casteCategory',
  has_ration_card: 'household.hasRationCard',
  ration_card_type: 'household.rationCardType',
  has_poverty_certificate: 'household.hasPovertyCert',
  has_ayushman_card: 'household.hasAyushman',
  has_aadhaar: 'household.hasAadhaar',
  has_pan: 'household.hasPan',
  has_sgy_card: 'household.hasSgy',
  has_ncd_card: 'household.hasNcd',
  has_other_card: 'household.hasOtherCard',
  has_health_insurance: 'household.hasInsurance',
  insurance_type: 'household.insuranceType',
  years_in_area: 'household.yearsInArea',
  house_type: 'household.houseType',
  is_own_house: 'household.isOwnHouse',
  rent_amount: 'household.rentAmount',
  has_separate_kitchen: 'household.hasKitchen',
  number_of_rooms: 'household.numberOfRooms',
  toilet_type: 'household.toiletType',
  lighting_source: 'household.lightingSource',
  cooking_fuel: 'household.cookingFuel',
  drinking_water_source: 'household.drinkingWater',
  income_source: 'household.incomeSource',
  monthly_income: 'household.monthlyIncome',
  monthly_health_expense: 'household.monthlyHealthExpense',
  illness_types: 'household.illnessTypes',
  illness_other: 'household.illnessOther',
  knows_generic_medicines: 'household.knowsGeneric',
  would_buy_generic: 'household.wouldBuyGeneric',
  family_type: 'household.familyType',
  adult_count: 'household.adultCount',
  child_count: 'household.childCount',
  total_members: 'household.totalMembers',
  had_surgery_last_year: 'household.hadSurgery',
  had_unmet_surgical_need: 'household.hadUnmetNeed',
};

const MEMBER_FIELD_LABELS: Record<string, string> = {
  name: 'household.memberName',
  relationship: 'household.memberRelationship',
  gender: 'household.memberGender',
  age: 'household.memberAge',
  maritalStatus: 'household.memberMaritalStatus',
  education: 'household.memberEducation',
  occupation: 'household.memberOccupation',
};

const FIELD_SECTION: Record<string, number> = {
  survey_location: 0, surveyor_name: 0, interview_date: 0,
  house_address: 0, respondent_name: 0, ward: 0, ward_code: 0,
  house_code_uhi: 0, colony_name: 0, mobile_number: 0,
  religion: 1, religion_other: 1, caste_category: 1,
  has_ration_card: 1, ration_card_type: 1,
  has_poverty_certificate: 1, has_ayushman_card: 1, has_aadhaar: 1,
  has_pan: 1, has_sgy_card: 1, has_ncd_card: 1, has_other_card: 1,
  has_health_insurance: 1, insurance_type: 1,
  years_in_area: 2, house_type: 2, is_own_house: 2,
  rent_amount: 2, has_separate_kitchen: 2, number_of_rooms: 2, toilet_type: 2,
  lighting_source: 3, cooking_fuel: 3, drinking_water_source: 3,
  income_source: 4, monthly_income: 4, monthly_health_expense: 4,
  illness_types: 4, illness_other: 4,
  knows_generic_medicines: 4, would_buy_generic: 4,
  family_type: 5, adult_count: 5, child_count: 5, total_members: 5,
  had_surgery_last_year: 6, had_unmet_surgical_need: 6,
};

export default function HouseholdForm() {
  const { t } = useI18n();
  const { token, user, authenticatedFetch } = useAuth();
  const colors = Colors.light;
  const scrollRef = useRef<ScrollView>(null);
  const sectionPos = useRef<number[]>([]);
  const sectionRefs = useRef<(SectionCardHandle | null)[]>([]);

  const [form, setForm] = useState<FormState>(() => ({ ...INITIAL_STATE, surveyor_name: user?.name || '' }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMemberData, value: string) => {
    setForm(prev => {
      const members = [...prev.family_members];
      members[index] = { ...members[index], [field]: value };
      return { ...prev, family_members: members };
    });
    const errorKey = `member_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const addFamilyMember = () => {
    setForm(prev => ({
      ...prev,
      family_members: [...prev.family_members, {
        name: '', relationship: '', gender: '', age: '',
        maritalStatus: '', education: '', occupation: '', occupationOther: '',
      }],
    }));
  };

  const removeFamilyMember = (index: number) => {
    setForm(prev => ({
      ...prev,
      family_members: prev.family_members.filter((_, i) => i !== index),
    }));
  };

  const mapOptions = (keys: string[]) => keys.map(key => ({ label: t(key), value: key }));

  const completedSections = (() => {
    let c = 0;
    if (form.survey_location && form.surveyor_name && form.interview_date &&
        form.house_address && form.respondent_name && form.ward && form.ward_code &&
        form.house_code_uhi && form.colony_name && form.mobile_number) c++;
    if (form.religion && form.caste_category && form.has_ration_card &&
        form.has_poverty_certificate && form.has_ayushman_card && form.has_aadhaar &&
        form.has_pan && form.has_sgy_card && form.has_ncd_card && form.has_other_card &&
        form.has_health_insurance) c++;
    if (form.years_in_area && form.house_type && form.is_own_house &&
        form.has_separate_kitchen && form.number_of_rooms && form.toilet_type) c++;
    if (form.lighting_source && form.cooking_fuel && form.drinking_water_source) c++;
    if (form.income_source && form.monthly_income && form.monthly_health_expense &&
        form.illness_types.length > 0 && form.knows_generic_medicines &&
        form.would_buy_generic) c++;
    if (form.family_type && form.adult_count && form.child_count &&
        form.total_members) c++;
    if (form.had_surgery_last_year && form.had_unmet_surgical_need) c++;
    return c;
  })();

  const getLabel = (key: string, idx?: number): string => {
    const prefix = idx !== undefined ? `${t('household.memberName')} #${idx + 1} — ` : '';
    const labelKey = key.startsWith('member_')
      ? MEMBER_FIELD_LABELS[key.replace(/^member_\d+_/, '')]
      : FIELD_LABELS[key];
    return prefix + (labelKey ? t(labelKey) : key);
  };

  const scrollToError = (key: string) => {
    let sectionIdx = -1;
    if (key.startsWith('member_')) { sectionIdx = 5; }
    else { sectionIdx = FIELD_SECTION[key] ?? -1; }
    const y = sectionIdx >= 0 ? sectionPos.current[sectionIdx] : undefined;
    if (y !== undefined) {
      sectionRefs.current[sectionIdx]?.expand();
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 10), animated: true });
      }, 100);
    }
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    const req = (key: string, val: string, idx?: number) => { if (!val) errs[key] = `${getLabel(key, idx)} — ${t('common.required')}`; };
    const num = (key: string, val: string, idx?: number) => { if (val && isNaN(Number(val))) errs[key] = `${getLabel(key, idx)} — ${t('common.invalidNumber')}`; };
    const date = (key: string, val: string) => {
      if (!val) return;
      if (!/^\d{2}-\d{2}-\d{4}$/.test(val)) { errs[key] = `${getLabel(key)} — ${t('common.invalidDate')}`; return; }
      const [d, m, y] = val.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      if (dt.getDate() !== d || dt.getMonth() !== m - 1 || dt.getFullYear() !== y) {
        errs[key] = `${getLabel(key)} — ${t('common.invalidDate')}`;
      }
    };

    req('survey_location', form.survey_location);
    req('surveyor_name', form.surveyor_name);
    req('interview_date', form.interview_date);
    date('interview_date', form.interview_date);
    req('house_address', form.house_address);
    req('respondent_name', form.respondent_name);
    req('ward', form.ward);
    req('ward_code', form.ward_code);
    req('house_code_uhi', form.house_code_uhi);
    req('colony_name', form.colony_name);
    req('mobile_number', form.mobile_number);
    if (form.mobile_number && form.mobile_number.length !== 10) {
      errs['mobile_number'] = `${getLabel('mobile_number')} — ${t('common.invalidPhone')}`;
    }

    req('religion', form.religion);
    if (form.religion === 'religion.other') req('religion_other', form.religion_other);
    req('caste_category', form.caste_category);
    req('has_ration_card', form.has_ration_card);
    if (form.has_ration_card === 'common.yes') req('ration_card_type', form.ration_card_type);
    req('has_poverty_certificate', form.has_poverty_certificate);
    req('has_ayushman_card', form.has_ayushman_card);
    req('has_aadhaar', form.has_aadhaar);
    req('has_pan', form.has_pan);
    req('has_sgy_card', form.has_sgy_card);
    req('has_ncd_card', form.has_ncd_card);
    req('has_other_card', form.has_other_card);
    req('has_health_insurance', form.has_health_insurance);
    if (form.has_health_insurance === 'common.yes') req('insurance_type', form.insurance_type);

    req('years_in_area', form.years_in_area);
    num('years_in_area', form.years_in_area);
    req('house_type', form.house_type);
    req('is_own_house', form.is_own_house);
    if (form.is_own_house === 'common.no') {
      req('rent_amount', form.rent_amount);
      num('rent_amount', form.rent_amount);
    }
    req('has_separate_kitchen', form.has_separate_kitchen);
    req('number_of_rooms', form.number_of_rooms);
    num('number_of_rooms', form.number_of_rooms);
    req('toilet_type', form.toilet_type);

    req('lighting_source', form.lighting_source);
    req('cooking_fuel', form.cooking_fuel);
    req('drinking_water_source', form.drinking_water_source);

    req('income_source', form.income_source);
    req('monthly_income', form.monthly_income);
    num('monthly_income', form.monthly_income);
    req('monthly_health_expense', form.monthly_health_expense);
    num('monthly_health_expense', form.monthly_health_expense);
    if (form.illness_types.length === 0) errs['illness_types'] = `${getLabel('illness_types')} — ${t('common.required')}`;
    if (form.illness_types.includes('illness.other')) req('illness_other', form.illness_other);
    req('knows_generic_medicines', form.knows_generic_medicines);
    req('would_buy_generic', form.would_buy_generic);

    req('family_type', form.family_type);
    req('adult_count', form.adult_count);
    num('adult_count', form.adult_count);
    req('child_count', form.child_count);
    num('child_count', form.child_count);
    req('total_members', form.total_members);
    num('total_members', form.total_members);

    form.family_members.forEach((member, i) => {
      req(`member_${i}_name`, member.name, i);
      req(`member_${i}_relationship`, member.relationship, i);
      req(`member_${i}_gender`, member.gender, i);
      req(`member_${i}_age`, member.age, i);
      num(`member_${i}_age`, member.age, i);
      req(`member_${i}_maritalStatus`, member.maritalStatus, i);
      req(`member_${i}_education`, member.education, i);
      req(`member_${i}_occupation`, member.occupation, i);
    });

    req('had_surgery_last_year', form.had_surgery_last_year);
    req('had_unmet_surgical_need', form.had_unmet_surgical_need);

    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollToError(Object.keys(errs)[0]);
      return;
    }
    setSubmitting(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      const payload = {
        ...form,
        years_in_area: form.years_in_area ? Number(form.years_in_area) : null,
        rent_amount: form.rent_amount ? Number(form.rent_amount) : null,
        number_of_rooms: Number(form.number_of_rooms),
        monthly_income: Number(form.monthly_income),
        monthly_health_expense: Number(form.monthly_health_expense),
        adult_count: Number(form.adult_count),
        child_count: Number(form.child_count),
        total_members: Number(form.total_members),
        illness_types: JSON.stringify(form.illness_types),
        family_members: JSON.stringify(form.family_members),
      };
      const response = await authenticatedFetch(`${API_URL}/api/forms/household`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanValue(payload)),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const msg = Array.isArray(data.detail)
          ? data.detail.map((d: { msg: string }) => {
              const field = d.loc?.filter((s: string) => s !== 'body').join('.');
              return field ? `[${field}] ${d.msg}` : d.msg;
            }).join('\n')
          : data.detail;
        throw new Error(msg || t('common.serverError'));
      }
      Alert.alert(t('common.success'), t('household.success'));
      setForm({ ...INITIAL_STATE, surveyor_name: user?.name || '' });
      setErrors({});
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : t('common.serverError'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleIllness = (val: string) => {
    setForm(prev => {
      const current = prev.illness_types;
      const next = current.includes(val)
        ? current.filter(v => v !== val)
        : [...current, val];
      return { ...prev, illness_types: next };
    });
    if (errors['illness_types']) {
      setErrors(prev => { const n = { ...prev }; delete n['illness_types']; return n; });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.progressHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ProgressBar completed={completedSections} total={7} />
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>{t('household.title')}</Text>

        {Object.keys(errors).length > 0 && (
          <View style={styles.errorSummary}>
            <Text style={[styles.errorSummaryTitle, { color: colors.error }]}>
              {t('common.required')} ({Object.keys(errors).length})
            </Text>
            {Object.entries(errors).map(([key, msg]) => (
              <TouchableOpacity key={key} onPress={() => scrollToError(key)} style={styles.errorItem}>
                <Text style={[styles.errorItemText, { color: colors.text }]}>{msg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <SectionCard ref={el => { sectionRefs.current[0] = el; }} title={t('household.surveyInfo')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[0] = e.nativeEvent.layout.y; }}>
          <TextInputField
            label={t('household.surveyLocation')}
            value={form.survey_location}
            onChangeText={(v) => updateField('survey_location', v)}
            required error={errors['survey_location']}
          />
          <TextInputField
            label={t('household.surveyorName')}
            value={form.surveyor_name}
            onChangeText={(v) => updateField('surveyor_name', v)}
            editable={false}
            required error={errors['surveyor_name']}
          />
          <TextInputField
            label={t('household.interviewDate')}
            value={form.interview_date}
            onChangeText={(v) => updateField('interview_date', v)}
            placeholder="DD-MM-YYYY"
            required error={errors['interview_date']}
          />
          <TextInputField
            label={t('household.houseAddress')}
            value={form.house_address}
            onChangeText={(v) => updateField('house_address', v)}
            multiline
            required error={errors['house_address']}
          />
          <TextInputField
            label={t('household.respondentName')}
            value={form.respondent_name}
            onChangeText={(v) => updateField('respondent_name', v)}
            required error={errors['respondent_name']}
          />
          <SelectField
            label={t('household.ward')}
            value={form.ward}
            options={mapOptions(WARD_OPTIONS)}
            onSelect={(v) => updateField('ward', v)}
            required error={errors['ward']}
          />
          <TextInputField
            label={t('household.wardCode')}
            value={form.ward_code}
            onChangeText={(v) => updateField('ward_code', v)}
            required error={errors['ward_code']}
          />
          <TextInputField
            label={t('household.houseCode')}
            value={form.house_code_uhi}
            onChangeText={(v) => updateField('house_code_uhi', v)}
            required error={errors['house_code_uhi']}
          />
          <TextInputField
            label={t('household.colonyName')}
            value={form.colony_name}
            onChangeText={(v) => updateField('colony_name', v)}
            required error={errors['colony_name']}
          />
          <TextInputField
            label={t('household.mobileNumber')}
            value={form.mobile_number}
            onChangeText={(v) => updateField('mobile_number', v)}
            keyboardType="numeric"
            maxLength={10}
            required error={errors['mobile_number']}
          />
        </SectionCard>

        <SectionCard ref={el => { sectionRefs.current[1] = el; }} title={t('household.demographics')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[1] = e.nativeEvent.layout.y; }}>
          <SelectField
            label={t('household.religion')}
            value={form.religion}
            options={mapOptions(RELIGION_OPTIONS)}
            onSelect={(v) => updateField('religion', v)}
            required error={errors['religion']}
          />
          {form.religion === 'religion.other' && (
            <TextInputField
              label={t('household.religionOther')}
              value={form.religion_other}
              onChangeText={(v) => updateField('religion_other', v)}
              required error={errors['religion_other']}
            />
          )}
          <SelectField
            label={t('household.casteCategory')}
            value={form.caste_category}
            options={mapOptions(CASTE_OPTIONS)}
            onSelect={(v) => updateField('caste_category', v)}
            required error={errors['caste_category']}
          />
          <SelectField
            label={t('household.hasRationCard')}
            value={form.has_ration_card}
            options={mapOptions(YES_NO_DK)}
            onSelect={(v) => updateField('has_ration_card', v)}
            required error={errors['has_ration_card']}
          />
          {form.has_ration_card === 'common.yes' && (
            <SelectField
              label={t('household.rationCardType')}
              value={form.ration_card_type}
              options={mapOptions(RATION_CARD_TYPES)}
              onSelect={(v) => updateField('ration_card_type', v)}
              required error={errors['ration_card_type']}
            />
          )}
          <SelectField
            label={t('household.hasPovertyCert')}
            value={form.has_poverty_certificate}
            options={mapOptions(YES_NO_DK)}
            onSelect={(v) => updateField('has_poverty_certificate', v)}
            required error={errors['has_poverty_certificate']}
          />
          <SelectField
            label={t('household.hasAyushman')}
            value={form.has_ayushman_card}
            options={mapOptions(YES_NO_DK)}
            onSelect={(v) => updateField('has_ayushman_card', v)}
            required error={errors['has_ayushman_card']}
          />
          <SelectField
            label={t('household.hasAadhaar')}
            value={form.has_aadhaar}
            options={mapOptions(YES_NO_DK)}
            onSelect={(v) => updateField('has_aadhaar', v)}
            required error={errors['has_aadhaar']}
          />
          <SelectField
            label={t('household.hasPan')}
            value={form.has_pan}
            options={mapOptions(YES_NO_DK)}
            onSelect={(v) => updateField('has_pan', v)}
            required error={errors['has_pan']}
          />
          <SelectField
            label={t('household.hasSgy')}
            value={form.has_sgy_card}
            options={mapOptions(YES_NO_DK)}
            onSelect={(v) => updateField('has_sgy_card', v)}
            required error={errors['has_sgy_card']}
          />
          <SelectField
            label={t('household.hasNcd')}
            value={form.has_ncd_card}
            options={mapOptions(YES_NO_DK)}
            onSelect={(v) => updateField('has_ncd_card', v)}
            required error={errors['has_ncd_card']}
          />
          <SelectField
            label={t('household.hasOtherCard')}
            value={form.has_other_card}
            options={mapOptions(YES_NO_DK)}
            onSelect={(v) => updateField('has_other_card', v)}
            required error={errors['has_other_card']}
          />
          <SelectField
            label={t('household.hasInsurance')}
            value={form.has_health_insurance}
            options={mapOptions(YES_NO_DK)}
            onSelect={(v) => updateField('has_health_insurance', v)}
            required error={errors['has_health_insurance']}
          />
          {form.has_health_insurance === 'common.yes' && (
            <SelectField
              label={t('household.insuranceType')}
              value={form.insurance_type}
              options={mapOptions(INSURANCE_TYPES)}
              onSelect={(v) => updateField('insurance_type', v)}
              required error={errors['insurance_type']}
            />
          )}
        </SectionCard>

        <SectionCard ref={el => { sectionRefs.current[2] = el; }} title={t('household.livingStandards')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[2] = e.nativeEvent.layout.y; }}>
          <TextInputField
            label={t('household.yearsInArea')}
            value={form.years_in_area}
            onChangeText={(v) => updateField('years_in_area', v)}
            keyboardType="numeric"
            required error={errors['years_in_area']}
          />
          <SelectField
            label={t('household.houseType')}
            value={form.house_type}
            options={mapOptions(HOUSE_TYPES)}
            onSelect={(v) => updateField('house_type', v)}
            required error={errors['house_type']}
          />
          <SelectField
            label={t('household.isOwnHouse')}
            value={form.is_own_house}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('is_own_house', v)}
            required error={errors['is_own_house']}
          />
          {form.is_own_house === 'common.no' && (
            <TextInputField
              label={t('household.rentAmount')}
              value={form.rent_amount}
              onChangeText={(v) => updateField('rent_amount', v)}
              keyboardType="numeric"
              required error={errors['rent_amount']}
            />
          )}
          <SelectField
            label={t('household.hasKitchen')}
            value={form.has_separate_kitchen}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('has_separate_kitchen', v)}
            required error={errors['has_separate_kitchen']}
          />
          <TextInputField
            label={t('household.numberOfRooms')}
            value={form.number_of_rooms}
            onChangeText={(v) => updateField('number_of_rooms', v)}
            keyboardType="numeric"
            required error={errors['number_of_rooms']}
          />
          <SelectField
            label={t('household.toiletType')}
            value={form.toilet_type}
            options={mapOptions(TOILET_TYPES)}
            onSelect={(v) => updateField('toilet_type', v)}
            required error={errors['toilet_type']}
          />
        </SectionCard>

        <SectionCard ref={el => { sectionRefs.current[3] = el; }} title={t('household.energy')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[3] = e.nativeEvent.layout.y; }}>
          <SelectField
            label={t('household.lightingSource')}
            value={form.lighting_source}
            options={mapOptions(LIGHTING_OPTIONS)}
            onSelect={(v) => updateField('lighting_source', v)}
            required error={errors['lighting_source']}
          />
          <SelectField
            label={t('household.cookingFuel')}
            value={form.cooking_fuel}
            options={mapOptions(FUEL_OPTIONS)}
            onSelect={(v) => updateField('cooking_fuel', v)}
            required error={errors['cooking_fuel']}
          />
          <SelectField
            label={t('household.drinkingWater')}
            value={form.drinking_water_source}
            options={mapOptions(WATER_OPTIONS)}
            onSelect={(v) => updateField('drinking_water_source', v)}
            required error={errors['drinking_water_source']}
          />
        </SectionCard>

        <SectionCard ref={el => { sectionRefs.current[4] = el; }} title={t('household.income')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[4] = e.nativeEvent.layout.y; }}>
          <SelectField
            label={t('household.incomeSource')}
            value={form.income_source}
            options={mapOptions(INCOME_SOURCES)}
            onSelect={(v) => updateField('income_source', v)}
            required error={errors['income_source']}
          />
          <TextInputField
            label={t('household.monthlyIncome')}
            value={form.monthly_income}
            onChangeText={(v) => updateField('monthly_income', v)}
            keyboardType="numeric"
            required error={errors['monthly_income']}
          />
          <TextInputField
            label={t('household.monthlyHealthExpense')}
            value={form.monthly_health_expense}
            onChangeText={(v) => updateField('monthly_health_expense', v)}
            keyboardType="numeric"
            required error={errors['monthly_health_expense']}
          />
          <MultiSelectField
            label={t('household.illnessTypes')}
            values={form.illness_types}
            options={mapOptions(ILLNESS_OPTIONS)}
            onToggle={toggleIllness}
            required error={errors['illness_types']}
          />
          {form.illness_types.includes('illness.other') && (
            <TextInputField
              label={t('household.illnessOther')}
              value={form.illness_other}
              onChangeText={(v) => updateField('illness_other', v)}
              required error={errors['illness_other']}
            />
          )}
          <SelectField
            label={t('household.knowsGeneric')}
            value={form.knows_generic_medicines}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('knows_generic_medicines', v)}
            required error={errors['knows_generic_medicines']}
          />
          <SelectField
            label={t('household.wouldBuyGeneric')}
            value={form.would_buy_generic}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('would_buy_generic', v)}
            required error={errors['would_buy_generic']}
          />
        </SectionCard>

        <SectionCard ref={el => { sectionRefs.current[5] = el; }} title={t('household.family')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[5] = e.nativeEvent.layout.y; }}>
          <SelectField
            label={t('household.familyType')}
            value={form.family_type}
            options={mapOptions(FAMILY_TYPES)}
            onSelect={(v) => updateField('family_type', v)}
            required error={errors['family_type']}
          />
          <TextInputField
            label={t('household.adultCount')}
            value={form.adult_count}
            onChangeText={(v) => updateField('adult_count', v)}
            keyboardType="numeric"
            required error={errors['adult_count']}
          />
          <TextInputField
            label={t('household.childCount')}
            value={form.child_count}
            onChangeText={(v) => updateField('child_count', v)}
            keyboardType="numeric"
            required error={errors['child_count']}
          />
          <TextInputField
            label={t('household.totalMembers')}
            value={form.total_members}
            onChangeText={(v) => updateField('total_members', v)}
            keyboardType="numeric"
            required error={errors['total_members']}
          />
          <Text style={[styles.subsectionTitle, { color: colors.text }]}>
            {t('household.familyMembers')}
          </Text>
          {form.family_members.map((member, index) => (
            <FamilyMemberCard
              key={index}
              index={index}
              member={member}
              errors={errors}
              onChange={updateFamilyMember}
              onRemove={removeFamilyMember}
            />
          ))}
          <TouchableOpacity
            style={[styles.addMemberButton, { borderColor: colors.primary }]}
            onPress={addFamilyMember}
          >
            <Text style={[styles.addMemberText, { color: colors.primary }]}>
              {t('household.addMember')}
            </Text>
          </TouchableOpacity>
        </SectionCard>

        <SectionCard ref={el => { sectionRefs.current[6] = el; }} title={t('household.surgeryHistory')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[6] = e.nativeEvent.layout.y; }}>
          <SelectField
            label={t('household.hadSurgery')}
            value={form.had_surgery_last_year}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('had_surgery_last_year', v)}
            required error={errors['had_surgery_last_year']}
          />
          <SelectField
            label={t('household.hadUnmetNeed')}
            value={form.had_unmet_surgical_need}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('had_unmet_surgical_need', v)}
            required error={errors['had_unmet_surgical_need']}
          />
        </SectionCard>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('household.submit')}</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
  },
  scrollContent: { padding: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  errorSummary: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorSummaryTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  errorItem: { paddingVertical: 4 },
  errorItemText: { fontSize: 13, lineHeight: 18 },
  subsectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  addMemberButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addMemberText: { fontSize: 14, fontWeight: '600' },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginTop: 8,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
