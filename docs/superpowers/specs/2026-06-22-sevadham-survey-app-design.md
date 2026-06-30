# Sevadham Survey App - Design Specification

## Overview
A free, end-to-end Android app for Sevadham Trust NGO to digitize household and surgery survey forms. Uses Expo Go (React Native) frontend, FastAPI backend, Google Sheets as database, and ngrok for tunneling.

## Architecture

```
Expo Go App (Android)
  ├── Auth (JWT via phone)
  ├── i18n (English/Marathi)
  ├── Tab: Household Survey
  └── Tab: Surgery Survey
        │
    HTTP (ngrok tunnel)
        │
FastAPI Backend (localhost:8000)
  ├── Auth Routes (existing)
  ├── Household Form Routes (new)
  ├── Surgery Form Routes (new)
  └── Google Sheets Manager (gspread)
        │
    Google Sheets API (free)
  ├── users (existing)
  ├── household_surveys (new)
  └── surgery_surveys (new)
```

## Google Sheets Structure

### Worksheet: `users` (existing)
Columns: id, name, phone, role

### Worksheet: `household_surveys`
Flat columns for main fields, JSON column for nested family member data.

| Column | Type | Notes |
|--------|------|-------|
| id | auto | auto-increment |
| user_id | text | from JWT (audit) |
| created_at | datetime | submission timestamp |
| survey_location | text | |
| surveyor_name | text | |
| interview_date | date | |
| house_address | text | |
| respondent_name | text | |
| ward | text | |
| ward_code | text | |
| house_code_uhi | text | |
| colony_name | text | |
| mobile_number | text | 10-digit |
| religion | text | enum |
| religion_other | text | conditional |
| caste_category | text | enum |
| has_ration_card | text | Yes/No/Don't Know |
| ration_card_type | text | conditional enum |
| has_poverty_certificate | text | Yes/No/Don't Know |
| has_ayushman_card | text | Yes/No/Don't Know |
| has_aadhaar | text | Yes/No/Don't Know |
| has_pan | text | Yes/No/Don't Know |
| has_sgy_card | text | Yes/No/Don't Know |
| has_ncd_card | text | Yes/No/Don't Know |
| has_other_card | text | Yes/No/Don't Know |
| has_health_insurance | text | Yes/No/Don't Know |
| insurance_type | text | conditional enum |
| years_in_area | number | |
| house_type | text | enum |
| is_own_house | text | Yes/No |
| rent_amount | number | conditional |
| has_separate_kitchen | text | Yes/No |
| number_of_rooms | number | |
| toilet_type | text | enum |
| lighting_source | text | enum |
| cooking_fuel | text | enum |
| drinking_water_source | text | enum |
| income_source | text | enum |
| monthly_income | number | |
| monthly_health_expense | number | |
| illness_types | text | multi-select, pipe-separated |
| illness_other | text | conditional |
| knows_generic_medicines | text | Yes/No |
| would_buy_generic | text | Yes/No |
| family_type | text | enum |
| adult_count | number | |
| child_count | number | |
| total_members | number | |
| family_members_json | text | JSON array |
| had_surgery_last_year | text | Yes/No |
| had_unmet_surgical_need | text | Yes/No |

### Worksheet: `surgery_surveys`

| Column | Type | Notes |
|--------|------|-------|
| id | auto | |
| user_id | text | from JWT |
| created_at | datetime | |
| survey_location | text | |
| surveyor_name | text | |
| interview_date | date | |
| house_address | text | |
| patient_name | text | |
| ward | text | |
| ward_code | text | |
| house_code_uhi | text | |
| patient_code | text | |
| colony_name | text | |
| mobile_number | text | |
| age | number | |
| gender | text | Male/Female |
| education | text | |
| occupation | text | enum |
| occupation_other | text | conditional |
| body_sections_json | text | JSON array for sections 6.1-6.7 |
| menstrual_info_json | text | conditional JSON |
| pregnancy_history_json | text | conditional JSON |
| family_planning_json | text | conditional JSON |
| has_bp | text | Yes/No |
| bp_reading | text | |
| has_diabetes | text | Yes/No |
| blood_sugar_level | text | |
| tobacco_use | text | multi-select |
| alcohol_use | text | Yes/No |
| other_addictions | text | |
| sf12_answers_json | text | JSON array of 12 answers |
| needs_followup | text | Yes/No |

## API Endpoints

### Existing (no changes)
- `POST /api/auth/login` — phone number login
- `POST /api/auth/verify-token` — validate JWT
- `GET /api/auth/me` — current user info (Bearer token)

### New
- `POST /api/forms/household` — submit household survey (Auth required)
- `POST /api/forms/surgery` — submit surgery survey (Auth required)

### Request Pattern
```json
POST /api/forms/household
Headers: { Authorization: "Bearer <token>", Content-Type: "application/json" }
Body: { /* all form fields */ }
Response: { success: true, message: "Submitted", id: "123" }
```

## Frontend Component Architecture

### i18n (Custom Context)
- `/frontend/src/i18n/I18nContext.tsx` — provider, `t(key)` function
- `/frontend/src/i18n/en.json` — all English strings
- `/frontend/src/i18n/mr.json` — all Marathi translations
- Language stored in AsyncStorage, toggled from header/tab bar
- Pure UI switch — no form state loss

### Navigation
- Login screen → (tabs) after auth
- Three tabs: Home | Household Survey | Surgery Survey

### Reusable Components
- `FormField` — label, required marker, error display
- `TextInputField` — with maxLength, numeric mode
- `SelectField` — radio group for single choice
- `MultiSelectField` — checkboxes for multi choice
- `DatePickerField` — date input
- `SectionCard` — collapsible section with title
- `FamilyMemberCard` — dynamic add/remove member entry
- `ProgressBar` — % completion (sections filled / total sections)

### Form Pattern
- Single scroll per form with sticky progress bar
- Section-based layout with collapsible SectionCards
- Conditional show/hide logic per field rules
- On submit: validate all fields → highlight errors → scroll to first error → POST

### Conditional Logic Examples
- Ration Card = Yes → show Ration Card Type dropdown
- Has Insurance = Yes → show Insurance Type
- Own House = No → show Rent Amount
- Has Surgery = Yes → show details
- Body Section gateway question = No → hide all sub-questions for that section

## Theme

| Token | Value |
|-------|-------|
| Primary | #D4A017 (saffron/gold) |
| Background | #FFF8F0 (warm off-white) |
| Accent | #2E7D32 (leaf green) |
| Text | #3E2723 (dark brown) |
| Card | #FFFFFF |
| Error | #D32F2F |
| Card border | #E8E0D8 |

## Localization

- Two languages: English (en) and Marathi (mr)
- Keys organized by section: `household.surveyInfo.surveyorName`, `surgery.patientInfo.age`, etc.
- Error messages translated: `errors.required`, `errors.invalidPhone`
- Nav labels, button text, placeholders all translated

## Validation Rules

| Field Type | Rule |
|-----------|------|
| All fields | Required (unless conditional) |
| Text inputs | maxLength constraint |
| Phone | exactly 10 digits |
| Monetary | numeric only |
| Age | numeric, 0-120 |
| Email | basic email pattern if present |

### Error Display
- Red border on invalid field
- Error text below field
- Scroll to first error on submit
- Alert for server errors

## Design Decisions

1. **JSON for nested data**: Family members and body sections are complex, variable-length structures. JSON in a single cell keeps Sheets readable and avoids excessive columns.
2. **Custom i18n over library**: Simple two-language case doesn't warrant external dependencies.
3. **Single scroll with section cards**: Closest to paper form UX, progress bar gives positional awareness.
4. **Conditional hide/show not disable**: Hidden fields don't occupy space, reducing cognitive load.
5. **user_id on every row**: Full audit trail of who submitted what.
