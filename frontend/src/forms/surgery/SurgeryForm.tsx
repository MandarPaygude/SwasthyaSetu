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
import {
  WARD_OPTIONS, GENDER_OPTIONS, OCCUPATION_OPTIONS, YES_NO,
  PROBLEM_TYPES, INJURY_CAUSES, DURATION_OPTIONS, TREATMENT_PLACES,
  TREATMENT_TYPES, NO_TREATMENT_REASONS, IMPACT_OPTIONS,
  MENSTRUAL_STATUS, FAMILY_PLANNING_METHODS,
  SF12_Q1, SF12_Q2_Q3, SF12_Q4_Q7, SF12_Q8, SF12_Q9_Q12,
  TOBACCO_OPTIONS,
} from './fieldOptions';

interface BodySectionState {
  has_problem: string;
  body_part: string;
  problem_type: string;
  injury_cause: string;
  duration: string;
  still_exists: string;
  treatment_taken: string;
  treatment_place: string;
  traditional_healer: string;
  treatment_received: string;
  no_treatment_reason: string;
  daily_life_impact: string;
}

interface SurgeryFormState {
  survey_location: string; surveyor_name: string; interview_date: string;
  house_address: string; patient_name: string; ward: string; ward_code: string;
  house_code_uhi: string; patient_code: string; colony_name: string; mobile_number: string;
  age: string; gender: string; education: string; occupation: string; occupation_other: string;
  body_sections: BodySectionState[];
  menstrual_status: string; period_last_year: string; bleeding_days: string;
  regular: string; intermenstrual_bleeding: string; pain_affects_work: string;
  menstrual_product: string; pads_per_cycle: string; needs_doctor: string;
  needs_home_remedy: string; needs_hospital: string; menstrual_no_treatment_reason: string;
  total_pregnancies: string; home_deliveries: string; hospital_deliveries: string;
  currently_pregnant: string; pregnancy_month: string; bleeding_during_pregnancy: string;
  currently_breastfeeding: string;
  uses_family_planning: string; family_planning_method: string;
  has_bp: string; bp_reading: string; has_diabetes: string; blood_sugar_level: string;
  tobacco_use: string[]; alcohol_use: string; other_addictions: string;
  sf12_general_health: string; sf12_moderate_activities: string; sf12_climb_stairs: string;
  sf12_accomplished_less_physical: string; sf12_limited_work_kind: string;
  sf12_accomplished_less_emotional: string; sf12_careful_activities: string;
  sf12_pain_interference: string; sf12_calm_peaceful: string; sf12_energetic: string;
  sf12_downhearted: string; sf12_social_interference: string;
  needs_followup: string;
}

const EMPTY_BODY_SECTION: BodySectionState = {
  has_problem: '', body_part: '', problem_type: '', injury_cause: '',
  duration: '', still_exists: '', treatment_taken: '', treatment_place: '',
  traditional_healer: '', treatment_received: '', no_treatment_reason: '',
  daily_life_impact: '',
};

const BODY_SECTION_TITLES = [
  'surgery.section61', 'surgery.section62', 'surgery.section63',
  'surgery.section64', 'surgery.section65', 'surgery.section66',
];

const BODY_SECTION_BODY_PARTS: Record<number, string[]> = {
  0: ['bodyPart.eye', 'bodyPart.ent', 'bodyPart.dental', 'bodyPart.neck', 'bodyPart.head'],
  1: [],
  2: [],
  3: [],
  4: [],
  5: ['bodyPart.fingers', 'bodyPart.hand', 'bodyPart.wrist', 'bodyPart.elbow', 'bodyPart.foot', 'bodyPart.ankle', 'bodyPart.knee', 'bodyPart.kneeOnly', 'bodyPart.other'],
};

const INITIAL_STATE: SurgeryFormState = {
  survey_location: '', surveyor_name: '', interview_date: '',
  house_address: '', patient_name: '', ward: '', ward_code: '',
  house_code_uhi: '', patient_code: '', colony_name: '', mobile_number: '',
  age: '', gender: '', education: '', occupation: '', occupation_other: '',
  body_sections: Array.from({ length: 6 }, () => ({ ...EMPTY_BODY_SECTION })),
  menstrual_status: '', period_last_year: '', bleeding_days: '',
  regular: '', intermenstrual_bleeding: '', pain_affects_work: '',
  menstrual_product: '', pads_per_cycle: '', needs_doctor: '',
  needs_home_remedy: '', needs_hospital: '', menstrual_no_treatment_reason: '',
  total_pregnancies: '', home_deliveries: '', hospital_deliveries: '',
  currently_pregnant: '', pregnancy_month: '', bleeding_during_pregnancy: '',
  currently_breastfeeding: '',
  uses_family_planning: '', family_planning_method: '',
  has_bp: '', bp_reading: '', has_diabetes: '', blood_sugar_level: '',
  tobacco_use: [], alcohol_use: '', other_addictions: '',
  sf12_general_health: '', sf12_moderate_activities: '', sf12_climb_stairs: '',
  sf12_accomplished_less_physical: '', sf12_limited_work_kind: '',
  sf12_accomplished_less_emotional: '', sf12_careful_activities: '',
  sf12_pain_interference: '', sf12_calm_peaceful: '', sf12_energetic: '',
  sf12_downhearted: '', sf12_social_interference: '',
  needs_followup: '',
};

const SURGERY_LABELS: Record<string, string> = {
  survey_location: 'surgery.surveyLocation',
  surveyor_name: 'surgery.surveyorName',
  interview_date: 'surgery.interviewDate',
  house_address: 'surgery.houseAddress',
  patient_name: 'surgery.patientName',
  ward: 'surgery.ward',
  ward_code: 'surgery.wardCode',
  house_code_uhi: 'surgery.houseCode',
  patient_code: 'surgery.patientCode',
  colony_name: 'surgery.colonyName',
  mobile_number: 'surgery.mobileNumber',
  age: 'surgery.age',
  gender: 'surgery.gender',
  occupation: 'surgery.occupation',
  occupation_other: 'surgery.occupationOther',
};

const SURGERY_SECTION: Record<string, number> = {
  survey_location: 0, surveyor_name: 0, interview_date: 0,
  house_address: 0, patient_name: 0, ward: 0, ward_code: 0,
  house_code_uhi: 0, patient_code: 0, colony_name: 0, mobile_number: 0,
  age: 1, gender: 1, occupation: 1, occupation_other: 1,
  body_0_: 2, body_1_: 3, body_2_: 4, body_3_: 5, body_4_: 6, body_5_: 7, body_6_: 8,
  period_last_year: 9, bleeding_days: 9, regular: 9,
  intermenstrual_bleeding: 9, pain_affects_work: 9,
  menstrual_product: 9, pads_per_cycle: 9,
  needs_doctor: 9, needs_home_remedy: 9, needs_hospital: 9,
  pregnancy_month: 9, bleeding_during_pregnancy: 9,
  family_planning_method: 9,
  has_bp: 10, bp_reading: 10, has_diabetes: 10, blood_sugar_level: 10,
  tobacco_use: 10, alcohol_use: 10, other_addictions: 10,
  sf12_general_health: 11, sf12_moderate_activities: 11,
  sf12_climb_stairs: 11, sf12_accomplished_less_physical: 11,
  sf12_limited_work_kind: 11, sf12_accomplished_less_emotional: 11,
  sf12_careful_activities: 11, sf12_pain_interference: 11,
  sf12_calm_peaceful: 11, sf12_energetic: 11,
  sf12_downhearted: 11, sf12_social_interference: 11,
  needs_followup: 12,
};

export default function SurgeryForm() {
  const { t } = useI18n();
  const { token, user, authenticatedFetch } = useAuth();
  const colors = Colors.light;
  const scrollRef = useRef<ScrollView>(null);
  const sectionPos = useRef<number[]>([]);
  const sectionRefs = useRef<(SectionCardHandle | null)[]>([]);

  const [form, setForm] = useState<SurgeryFormState>(() => ({ ...INITIAL_STATE, surveyor_name: user?.name || '' }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = <K extends keyof SurgeryFormState>(key: K, value: SurgeryFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const updateBodySection = (index: number, field: keyof BodySectionState, value: string) => {
    setForm(prev => {
      const sections = [...prev.body_sections];
      sections[index] = { ...sections[index], [field]: value };
      return { ...prev, body_sections: sections };
    });
    const errorKey = `body_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const getLabel = (key: string): string => {
    const labelKey = SURGERY_LABELS[key];
    return labelKey ? t(labelKey) : key;
  };

  const scrollToError = (key: string) => {
    let sectionIdx: number | undefined;
    if (key.startsWith('body_')) {
      const match = key.match(/^body_(\d+)_/);
      sectionIdx = match ? parseInt(match[1], 10) + 2 : undefined;
    } else {
      sectionIdx = SURGERY_SECTION[key];
    }
    const y = sectionIdx !== undefined ? sectionPos.current[sectionIdx] : undefined;
    if (y !== undefined && sectionIdx !== undefined) {
      sectionRefs.current[sectionIdx]?.expand();
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 10), animated: true });
      }, 100);
    } else {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const mapOptions = (keys: string[]) => keys.map(key => ({ label: t(key), value: key }));

  const completedSections = (() => {
    let c = 0;
    if (form.survey_location && form.surveyor_name && form.interview_date &&
        form.house_address && form.patient_name && form.ward && form.ward_code &&
        form.house_code_uhi && form.patient_code && form.colony_name && form.mobile_number) c++;
    if (form.age && form.gender && form.occupation) c++;
    form.body_sections.forEach(s => {
      if (s.has_problem) c++;
    });
    if (form.menstrual_status) c++;
    if (form.has_bp || form.has_diabetes || form.tobacco_use.length > 0 || form.alcohol_use || form.other_addictions) c++;
    if (form.sf12_general_health && form.sf12_moderate_activities && form.sf12_climb_stairs &&
        form.sf12_accomplished_less_physical && form.sf12_limited_work_kind &&
        form.sf12_accomplished_less_emotional && form.sf12_careful_activities &&
        form.sf12_pain_interference && form.sf12_calm_peaceful && form.sf12_energetic &&
        form.sf12_downhearted && form.sf12_social_interference) c++;
    if (form.needs_followup) c++;
    return c;
  })();

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    const req = (key: string, val: string) => { if (!val) errs[key] = `${getLabel(key)} — ${t('common.required')}`; };
    const num = (key: string, val: string) => { if (val && isNaN(Number(val))) errs[key] = `${getLabel(key)} — ${t('common.invalidNumber')}`; };
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
    req('patient_name', form.patient_name);
    req('ward', form.ward);
    req('ward_code', form.ward_code);
    req('house_code_uhi', form.house_code_uhi);
    req('patient_code', form.patient_code);
    req('colony_name', form.colony_name);
    req('mobile_number', form.mobile_number);
    if (form.mobile_number && form.mobile_number.length !== 10) {
      errs['mobile_number'] = `${getLabel('mobile_number')} — ${t('common.invalidPhone')}`;
    }

    req('age', form.age);
    num('age', form.age);
    req('gender', form.gender);
    req('occupation', form.occupation);
    if (form.occupation === 'occupation.other') req('occupation_other', form.occupation_other);

    form.body_sections.forEach((s, i) => {
      if (s.has_problem === 'common.yes') {
        const bp = `body_${i}_body_part`;
        const pt = `body_${i}_problem_type`;
        const ic = `body_${i}_injury_cause`;
        const du = `body_${i}_duration`;
        const se = `body_${i}_still_exists`;
        const tt = `body_${i}_treatment_taken`;
        const tp = `body_${i}_treatment_place`;
        const th = `body_${i}_traditional_healer`;
        const tr = `body_${i}_treatment_received`;
        const nr = `body_${i}_no_treatment_reason`;
        const dl = `body_${i}_daily_life_impact`;

        if (BODY_SECTION_BODY_PARTS[i].length > 0) req(bp, s.body_part);
        req(pt, s.problem_type);
        req(ic, s.injury_cause);
        req(du, s.duration);
        req(se, s.still_exists);
        req(tt, s.treatment_taken);
        if (s.treatment_taken === 'common.yes') {
          req(tp, s.treatment_place);
          req(th, s.traditional_healer);
          req(tr, s.treatment_received);
        } else if (s.treatment_taken === 'common.no') {
          req(nr, s.no_treatment_reason);
        }
        req(dl, s.daily_life_impact);
      }
    });

    if (form.menstrual_status !== 'menstrual.menopause' && form.menstrual_status !== 'menstrual.hysterectomy') {
      if (form.menstrual_status) {
        req('period_last_year', form.period_last_year);
        req('bleeding_days', form.bleeding_days);
        num('bleeding_days', form.bleeding_days);
        req('regular', form.regular);
        req('intermenstrual_bleeding', form.intermenstrual_bleeding);
        req('pain_affects_work', form.pain_affects_work);
        req('menstrual_product', form.menstrual_product);
        req('pads_per_cycle', form.pads_per_cycle);
        num('pads_per_cycle', form.pads_per_cycle);
        req('needs_doctor', form.needs_doctor);
        req('needs_home_remedy', form.needs_home_remedy);
        req('needs_hospital', form.needs_hospital);
      }
    }

    if (form.currently_pregnant === 'common.yes') {
      req('pregnancy_month', form.pregnancy_month);
      num('pregnancy_month', form.pregnancy_month);
      req('bleeding_during_pregnancy', form.bleeding_during_pregnancy);
    }

    if (form.uses_family_planning === 'common.yes') {
      req('family_planning_method', form.family_planning_method);
    }

    if (form.has_bp === 'common.yes') req('bp_reading', form.bp_reading);
    if (form.has_diabetes === 'common.yes') req('blood_sugar_level', form.blood_sugar_level);

    req('sf12_general_health', form.sf12_general_health);
    req('sf12_moderate_activities', form.sf12_moderate_activities);
    req('sf12_climb_stairs', form.sf12_climb_stairs);
    req('sf12_accomplished_less_physical', form.sf12_accomplished_less_physical);
    req('sf12_limited_work_kind', form.sf12_limited_work_kind);
    req('sf12_accomplished_less_emotional', form.sf12_accomplished_less_emotional);
    req('sf12_careful_activities', form.sf12_careful_activities);
    req('sf12_pain_interference', form.sf12_pain_interference);
    req('sf12_calm_peaceful', form.sf12_calm_peaceful);
    req('sf12_energetic', form.sf12_energetic);
    req('sf12_downhearted', form.sf12_downhearted);
    req('sf12_social_interference', form.sf12_social_interference);

    req('needs_followup', form.needs_followup);

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
        age: Number(form.age),
        body_sections: JSON.stringify(form.body_sections),
        tobacco_use: JSON.stringify(form.tobacco_use),
        menstrual_info: JSON.stringify({
          status: form.menstrual_status,
          period_last_year: form.period_last_year,
          bleeding_days: form.bleeding_days,
          regular: form.regular,
          intermenstrual_bleeding: form.intermenstrual_bleeding,
          pain_affects_work: form.pain_affects_work,
          menstrual_product: form.menstrual_product,
          pads_per_cycle: form.pads_per_cycle,
          needs_doctor: form.needs_doctor,
          needs_home_remedy: form.needs_home_remedy,
          needs_hospital: form.needs_hospital,
        }),
        pregnancy_history: JSON.stringify({
          total_pregnancies: form.total_pregnancies,
          home_deliveries: form.home_deliveries,
          hospital_deliveries: form.hospital_deliveries,
          currently_pregnant: form.currently_pregnant,
          pregnancy_month: form.pregnancy_month,
          bleeding_during_pregnancy: form.bleeding_during_pregnancy,
          currently_breastfeeding: form.currently_breastfeeding,
        }),
        family_planning: JSON.stringify({
          uses_method: form.uses_family_planning,
          method_type: form.family_planning_method,
        }),
        sf12_answers: JSON.stringify({
          general_health: form.sf12_general_health,
          moderate_activities: form.sf12_moderate_activities,
          climb_stairs: form.sf12_climb_stairs,
          accomplished_less_physical: form.sf12_accomplished_less_physical,
          limited_work_kind: form.sf12_limited_work_kind,
          accomplished_less_emotional: form.sf12_accomplished_less_emotional,
          careful_activities: form.sf12_careful_activities,
          pain_interference: form.sf12_pain_interference,
          calm_peaceful: form.sf12_calm_peaceful,
          energetic: form.sf12_energetic,
          downhearted: form.sf12_downhearted,
          social_interference: form.sf12_social_interference,
        }),
      };
      const response = await authenticatedFetch(`${API_URL}/api/forms/surgery`, {
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
      Alert.alert(t('common.success'), t('surgery.success'));
      setForm({ ...INITIAL_STATE, surveyor_name: user?.name || '' });
      setErrors({});
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : t('common.serverError'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderBodySection = (index: number) => {
    const section = form.body_sections[index];
    const bodyParts = BODY_SECTION_BODY_PARTS[index];
    return (
      <SectionCard ref={el => { sectionRefs.current[index + 2] = el; }} key={index} title={t(BODY_SECTION_TITLES[index])} defaultExpanded={true} onLayout={(e) => { sectionPos.current[index + 2] = e.nativeEvent.layout.y; }}>
        <SelectField
          label={t('surgery.hasProblem')}
          value={section.has_problem}
          options={mapOptions(YES_NO)}
          onSelect={(v) => updateBodySection(index, 'has_problem', v)}
          required
          error={errors[`body_${index}_has_problem`]}
        />
        {section.has_problem === 'common.yes' && (
          <>
            {bodyParts.length > 0 && (
              <SelectField
                label={t('surgery.bodyPart')}
                value={section.body_part}
                options={mapOptions(bodyParts)}
                onSelect={(v) => updateBodySection(index, 'body_part', v)}
                required
                error={errors[`body_${index}_body_part`]}
              />
            )}
            <SelectField
              label={t('surgery.problemType')}
              value={section.problem_type}
              options={mapOptions(PROBLEM_TYPES)}
              onSelect={(v) => updateBodySection(index, 'problem_type', v)}
              required
              error={errors[`body_${index}_problem_type`]}
            />
            <SelectField
              label={t('surgery.injuryCause')}
              value={section.injury_cause}
              options={mapOptions(INJURY_CAUSES)}
              onSelect={(v) => updateBodySection(index, 'injury_cause', v)}
              required
              error={errors[`body_${index}_injury_cause`]}
            />
            <SelectField
              label={t('surgery.duration')}
              value={section.duration}
              options={mapOptions(DURATION_OPTIONS)}
              onSelect={(v) => updateBodySection(index, 'duration', v)}
              required
              error={errors[`body_${index}_duration`]}
            />
            <SelectField
              label={t('surgery.stillExists')}
              value={section.still_exists}
              options={mapOptions(YES_NO)}
              onSelect={(v) => updateBodySection(index, 'still_exists', v)}
              required
              error={errors[`body_${index}_still_exists`]}
            />
            <SelectField
              label={t('surgery.treatmentTaken')}
              value={section.treatment_taken}
              options={mapOptions(YES_NO)}
              onSelect={(v) => updateBodySection(index, 'treatment_taken', v)}
              required
              error={errors[`body_${index}_treatment_taken`]}
            />
            {section.treatment_taken === 'common.yes' && (
              <>
                <SelectField
                  label={t('surgery.treatmentPlace')}
                  value={section.treatment_place}
                  options={mapOptions(TREATMENT_PLACES)}
                  onSelect={(v) => updateBodySection(index, 'treatment_place', v)}
                  required
                  error={errors[`body_${index}_treatment_place`]}
                />
                <SelectField
                  label={t('surgery.traditionalHealer')}
                  value={section.traditional_healer}
                  options={mapOptions(YES_NO)}
                  onSelect={(v) => updateBodySection(index, 'traditional_healer', v)}
                  required
                  error={errors[`body_${index}_traditional_healer`]}
                />
                <SelectField
                  label={t('surgery.treatmentReceived')}
                  value={section.treatment_received}
                  options={mapOptions(TREATMENT_TYPES)}
                  onSelect={(v) => updateBodySection(index, 'treatment_received', v)}
                  required
                  error={errors[`body_${index}_treatment_received`]}
                />
              </>
            )}
            {section.treatment_taken === 'common.no' && (
              <SelectField
                label={t('surgery.noTreatmentReason')}
                value={section.no_treatment_reason}
                options={mapOptions(NO_TREATMENT_REASONS)}
                onSelect={(v) => updateBodySection(index, 'no_treatment_reason', v)}
                required
                error={errors[`body_${index}_no_treatment_reason`]}
              />
            )}
            <SelectField
              label={t('surgery.dailyLifeImpact')}
              value={section.daily_life_impact}
              options={mapOptions(IMPACT_OPTIONS)}
              onSelect={(v) => updateBodySection(index, 'daily_life_impact', v)}
              required
              error={errors[`body_${index}_daily_life_impact`]}
            />
          </>
        )}
      </SectionCard>
    );
  };

  const isMenstrualActive = form.menstrual_status && form.menstrual_status !== 'menstrual.menopause' && form.menstrual_status !== 'menstrual.hysterectomy';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.progressHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ProgressBar completed={completedSections} total={12} />
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>{t('surgery.title')}</Text>

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

        <SectionCard ref={el => { sectionRefs.current[0] = el; }} title={t('surgery.surveyInfo')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[0] = e.nativeEvent.layout.y; }}>
          <TextInputField
            label={t('surgery.surveyLocation')}
            value={form.survey_location}
            onChangeText={(v) => updateField('survey_location', v)}
            required error={errors['survey_location']}
          />
          <TextInputField
            label={t('surgery.surveyorName')}
            value={form.surveyor_name}
            onChangeText={(v) => updateField('surveyor_name', v)}
            editable={false}
            required error={errors['surveyor_name']}
          />
          <TextInputField
            label={t('surgery.interviewDate')}
            value={form.interview_date}
            onChangeText={(v) => updateField('interview_date', v)}
            placeholder="DD-MM-YYYY"
            required error={errors['interview_date']}
          />
          <TextInputField
            label={t('surgery.houseAddress')}
            value={form.house_address}
            onChangeText={(v) => updateField('house_address', v)}
            multiline
            required error={errors['house_address']}
          />
          <TextInputField
            label={t('surgery.patientName')}
            value={form.patient_name}
            onChangeText={(v) => updateField('patient_name', v)}
            required error={errors['patient_name']}
          />
          <SelectField
            label={t('surgery.ward')}
            value={form.ward}
            options={mapOptions(WARD_OPTIONS)}
            onSelect={(v) => updateField('ward', v)}
            required error={errors['ward']}
          />
          <TextInputField
            label={t('surgery.wardCode')}
            value={form.ward_code}
            onChangeText={(v) => updateField('ward_code', v)}
            required error={errors['ward_code']}
          />
          <TextInputField
            label={t('surgery.houseCode')}
            value={form.house_code_uhi}
            onChangeText={(v) => updateField('house_code_uhi', v)}
            required error={errors['house_code_uhi']}
          />
          <TextInputField
            label={t('surgery.patientCode')}
            value={form.patient_code}
            onChangeText={(v) => updateField('patient_code', v)}
            required error={errors['patient_code']}
          />
          <TextInputField
            label={t('surgery.colonyName')}
            value={form.colony_name}
            onChangeText={(v) => updateField('colony_name', v)}
            required error={errors['colony_name']}
          />
          <TextInputField
            label={t('surgery.mobileNumber')}
            value={form.mobile_number}
            onChangeText={(v) => updateField('mobile_number', v)}
            keyboardType="numeric"
            maxLength={10}
            required error={errors['mobile_number']}
          />
        </SectionCard>

        <SectionCard ref={el => { sectionRefs.current[1] = el; }} title={t('surgery.patientInfo')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[1] = e.nativeEvent.layout.y; }}>
          <TextInputField
            label={t('surgery.age')}
            value={form.age}
            onChangeText={(v) => updateField('age', v)}
            keyboardType="numeric"
            required error={errors['age']}
          />
          <SelectField
            label={t('surgery.gender')}
            value={form.gender}
            options={mapOptions(GENDER_OPTIONS)}
            onSelect={(v) => updateField('gender', v)}
            required error={errors['gender']}
          />
          <TextInputField
            label={t('surgery.education')}
            value={form.education}
            onChangeText={(v) => updateField('education', v)}
            error={errors['education']}
          />
          <SelectField
            label={t('surgery.occupation')}
            value={form.occupation}
            options={mapOptions(OCCUPATION_OPTIONS)}
            onSelect={(v) => updateField('occupation', v)}
            required error={errors['occupation']}
          />
          {form.occupation === 'occupation.other' && (
            <TextInputField
              label={t('surgery.occupationOther')}
              value={form.occupation_other}
              onChangeText={(v) => updateField('occupation_other', v)}
              required error={errors['occupation_other']}
            />
          )}
        </SectionCard>

        {BODY_SECTION_TITLES.map((_, index) => renderBodySection(index))}

        <SectionCard ref={el => { sectionRefs.current[9] = el; }} title={t('surgery.section67')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[9] = e.nativeEvent.layout.y; }}>
          <Text style={[styles.subsectionTitle, { color: colors.text }]}>{t('surgery.menstrualHistory')}</Text>
          <SelectField
            label={t('surgery.menstrualStatus')}
            value={form.menstrual_status}
            options={mapOptions(MENSTRUAL_STATUS)}
            onSelect={(v) => updateField('menstrual_status', v)}
            required
            error={errors['menstrual_status']}
          />
          {isMenstrualActive && (
            <>
              <SelectField
                label={t('surgery.periodLastYear')}
                value={form.period_last_year}
                options={mapOptions(YES_NO)}
                onSelect={(v) => updateField('period_last_year', v)}
                required
                error={errors['period_last_year']}
              />
              <TextInputField
                label={t('surgery.bleedingDays')}
                value={form.bleeding_days}
                onChangeText={(v) => updateField('bleeding_days', v)}
                keyboardType="numeric"
                required error={errors['bleeding_days']}
              />
              <SelectField
                label={t('surgery.regular')}
                value={form.regular}
                options={mapOptions(YES_NO)}
                onSelect={(v) => updateField('regular', v)}
                required error={errors['regular']}
              />
              <SelectField
                label={t('surgery.intermenstrualBleeding')}
                value={form.intermenstrual_bleeding}
                options={mapOptions(YES_NO)}
                onSelect={(v) => updateField('intermenstrual_bleeding', v)}
                required error={errors['intermenstrual_bleeding']}
              />
              <SelectField
                label={t('surgery.painAffectsWork')}
                value={form.pain_affects_work}
                options={mapOptions(YES_NO)}
                onSelect={(v) => updateField('pain_affects_work', v)}
                required error={errors['pain_affects_work']}
              />
              <TextInputField
                label={t('surgery.menstrualProduct')}
                value={form.menstrual_product}
                onChangeText={(v) => updateField('menstrual_product', v)}
                required error={errors['menstrual_product']}
              />
              <TextInputField
                label={t('surgery.padsPerCycle')}
                value={form.pads_per_cycle}
                onChangeText={(v) => updateField('pads_per_cycle', v)}
                keyboardType="numeric"
                required error={errors['pads_per_cycle']}
              />
              <SelectField
                label={t('surgery.needsDoctor')}
                value={form.needs_doctor}
                options={mapOptions(YES_NO)}
                onSelect={(v) => updateField('needs_doctor', v)}
                required error={errors['needs_doctor']}
              />
              <SelectField
                label={t('surgery.needsHomeRemedy')}
                value={form.needs_home_remedy}
                options={mapOptions(YES_NO)}
                onSelect={(v) => updateField('needs_home_remedy', v)}
                required error={errors['needs_home_remedy']}
              />
              <SelectField
                label={t('surgery.needsHospital')}
                value={form.needs_hospital}
                options={mapOptions(YES_NO)}
                onSelect={(v) => updateField('needs_hospital', v)}
                required error={errors['needs_hospital']}
              />
            </>
          )}

          <Text style={[styles.subsectionTitle, { color: colors.text, marginTop: 16 }]}>{t('surgery.pregnancyHistory')}</Text>
          <TextInputField
            label={t('surgery.totalPregnancies')}
            value={form.total_pregnancies}
            onChangeText={(v) => updateField('total_pregnancies', v)}
            keyboardType="numeric"
            error={errors['total_pregnancies']}
          />
          <TextInputField
            label={t('surgery.homeDeliveries')}
            value={form.home_deliveries}
            onChangeText={(v) => updateField('home_deliveries', v)}
            keyboardType="numeric"
            error={errors['home_deliveries']}
          />
          <TextInputField
            label={t('surgery.hospitalDeliveries')}
            value={form.hospital_deliveries}
            onChangeText={(v) => updateField('hospital_deliveries', v)}
            keyboardType="numeric"
            error={errors['hospital_deliveries']}
          />
          <SelectField
            label={t('surgery.currentlyPregnant')}
            value={form.currently_pregnant}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('currently_pregnant', v)}
            error={errors['currently_pregnant']}
          />
          {form.currently_pregnant === 'common.yes' && (
            <>
              <TextInputField
                label={t('surgery.pregnancyMonth')}
                value={form.pregnancy_month}
                onChangeText={(v) => updateField('pregnancy_month', v)}
                keyboardType="numeric"
                required error={errors['pregnancy_month']}
              />
              <SelectField
                label={t('surgery.bleedingDuringPregnancy')}
                value={form.bleeding_during_pregnancy}
                options={mapOptions(YES_NO)}
                onSelect={(v) => updateField('bleeding_during_pregnancy', v)}
                required error={errors['bleeding_during_pregnancy']}
              />
            </>
          )}
          <SelectField
            label={t('surgery.currentlyBreastfeeding')}
            value={form.currently_breastfeeding}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('currently_breastfeeding', v)}
            error={errors['currently_breastfeeding']}
          />

          <Text style={[styles.subsectionTitle, { color: colors.text, marginTop: 16 }]}>{t('surgery.familyPlanning')}</Text>
          <SelectField
            label={t('surgery.usesFamilyPlanning')}
            value={form.uses_family_planning}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('uses_family_planning', v)}
            error={errors['uses_family_planning']}
          />
          {form.uses_family_planning === 'common.yes' && (
            <SelectField
              label={t('surgery.familyPlanningMethod')}
              value={form.family_planning_method}
              options={mapOptions(FAMILY_PLANNING_METHODS)}
              onSelect={(v) => updateField('family_planning_method', v)}
              required error={errors['family_planning_method']}
            />
          )}
        </SectionCard>

        <SectionCard ref={el => { sectionRefs.current[10] = el; }} title={t('surgery.bpDiabetes')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[10] = e.nativeEvent.layout.y; }}>
          <SelectField
            label={t('surgery.hasBp')}
            value={form.has_bp}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('has_bp', v)}
            error={errors['has_bp']}
          />
          {form.has_bp === 'common.yes' && (
            <TextInputField
              label={t('surgery.bpReading')}
              value={form.bp_reading}
              onChangeText={(v) => updateField('bp_reading', v)}
              required error={errors['bp_reading']}
            />
          )}
          <SelectField
            label={t('surgery.hasDiabetes')}
            value={form.has_diabetes}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('has_diabetes', v)}
            error={errors['has_diabetes']}
          />
          {form.has_diabetes === 'common.yes' && (
            <TextInputField
              label={t('surgery.bloodSugarLevel')}
              value={form.blood_sugar_level}
              onChangeText={(v) => updateField('blood_sugar_level', v)}
              required error={errors['blood_sugar_level']}
            />
          )}
          <MultiSelectField
            label={t('surgery.tobaccoUse')}
            values={form.tobacco_use}
            options={mapOptions(TOBACCO_OPTIONS)}
            onToggle={(v) => {
              setForm(prev => {
                const current = prev.tobacco_use;
                const next = current.includes(v)
                  ? current.filter(item => item !== v)
                  : [...current, v];
                return { ...prev, tobacco_use: next };
              });
              if (errors['tobacco_use']) {
                setErrors(prev => { const n = { ...prev }; delete n['tobacco_use']; return n; });
              }
            }}
            error={errors['tobacco_use']}
          />
          <SelectField
            label={t('surgery.alcoholUse')}
            value={form.alcohol_use}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('alcohol_use', v)}
            error={errors['alcohol_use']}
          />
          <TextInputField
            label={t('surgery.otherAddictions')}
            value={form.other_addictions}
            onChangeText={(v) => updateField('other_addictions', v)}
            error={errors['other_addictions']}
          />
        </SectionCard>

        <SectionCard ref={el => { sectionRefs.current[11] = el; }} title={t('surgery.sf12')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[11] = e.nativeEvent.layout.y; }}>
          <SelectField
            label={t('surgery.sf12.q1')}
            value={form.sf12_general_health}
            options={mapOptions(SF12_Q1)}
            onSelect={(v) => updateField('sf12_general_health', v)}
            required error={errors['sf12_general_health']}
          />
          <SelectField
            label={t('surgery.sf12.q2')}
            value={form.sf12_moderate_activities}
            options={mapOptions(SF12_Q2_Q3)}
            onSelect={(v) => updateField('sf12_moderate_activities', v)}
            required error={errors['sf12_moderate_activities']}
          />
          <SelectField
            label={t('surgery.sf12.q3')}
            value={form.sf12_climb_stairs}
            options={mapOptions(SF12_Q2_Q3)}
            onSelect={(v) => updateField('sf12_climb_stairs', v)}
            required error={errors['sf12_climb_stairs']}
          />
          <SelectField
            label={t('surgery.sf12.q4')}
            value={form.sf12_accomplished_less_physical}
            options={mapOptions(SF12_Q4_Q7)}
            onSelect={(v) => updateField('sf12_accomplished_less_physical', v)}
            required error={errors['sf12_accomplished_less_physical']}
          />
          <SelectField
            label={t('surgery.sf12.q5')}
            value={form.sf12_limited_work_kind}
            options={mapOptions(SF12_Q4_Q7)}
            onSelect={(v) => updateField('sf12_limited_work_kind', v)}
            required error={errors['sf12_limited_work_kind']}
          />
          <SelectField
            label={t('surgery.sf12.q6')}
            value={form.sf12_accomplished_less_emotional}
            options={mapOptions(SF12_Q4_Q7)}
            onSelect={(v) => updateField('sf12_accomplished_less_emotional', v)}
            required error={errors['sf12_accomplished_less_emotional']}
          />
          <SelectField
            label={t('surgery.sf12.q7')}
            value={form.sf12_careful_activities}
            options={mapOptions(SF12_Q4_Q7)}
            onSelect={(v) => updateField('sf12_careful_activities', v)}
            required error={errors['sf12_careful_activities']}
          />
          <SelectField
            label={t('surgery.sf12.q8')}
            value={form.sf12_pain_interference}
            options={mapOptions(SF12_Q8)}
            onSelect={(v) => updateField('sf12_pain_interference', v)}
            required error={errors['sf12_pain_interference']}
          />
          <SelectField
            label={t('surgery.sf12.q9')}
            value={form.sf12_calm_peaceful}
            options={mapOptions(SF12_Q9_Q12)}
            onSelect={(v) => updateField('sf12_calm_peaceful', v)}
            required error={errors['sf12_calm_peaceful']}
          />
          <SelectField
            label={t('surgery.sf12.q10')}
            value={form.sf12_energetic}
            options={mapOptions(SF12_Q9_Q12)}
            onSelect={(v) => updateField('sf12_energetic', v)}
            required error={errors['sf12_energetic']}
          />
          <SelectField
            label={t('surgery.sf12.q11')}
            value={form.sf12_downhearted}
            options={mapOptions(SF12_Q9_Q12)}
            onSelect={(v) => updateField('sf12_downhearted', v)}
            required error={errors['sf12_downhearted']}
          />
          <SelectField
            label={t('surgery.sf12.q12')}
            value={form.sf12_social_interference}
            options={mapOptions(SF12_Q9_Q12)}
            onSelect={(v) => updateField('sf12_social_interference', v)}
            required error={errors['sf12_social_interference']}
          />
        </SectionCard>

        <SectionCard ref={el => { sectionRefs.current[12] = el; }} title={t('surgery.needsFollowup')} defaultExpanded={true} onLayout={(e) => { sectionPos.current[12] = e.nativeEvent.layout.y; }}>
          <SelectField
            label={t('surgery.needsFollowup')}
            value={form.needs_followup}
            options={mapOptions(YES_NO)}
            onSelect={(v) => updateField('needs_followup', v)}
            required error={errors['needs_followup']}
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
            <Text style={styles.submitButtonText}>{t('surgery.submit')}</Text>
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
