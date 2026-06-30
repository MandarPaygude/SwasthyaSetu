# Sevadham Survey App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Digitize household and surgery survey forms into a mobile app with Google Sheets backend, English/Marathi i18n, and JWT auth.

**Architecture:** FastAPI backend with gspread for Google Sheets CRUD. React Native (Expo Router) frontend with custom i18n context and reusable form components. ngrok tunnels backend to internet for Expo Go testing.

**Tech Stack:** FastAPI, Python 3.12, gspread, React Native 0.81, Expo 54, Expo Router 6, TypeScript 5.9

## Global Constraints

- All Google Sheets interactions through gspread (no direct API calls)
- Every form submission row must include `user_id` from JWT token (audit trail)
- All form fields mandatory unless conditionally hidden
- Text inputs enforce maxLength constraints
- No external i18n library — custom React Context only
- Language switch must not cause form data loss
- Forms use single-scroll layout with collapsible sections and sticky progress bar
- Theme colors: Primary #D4A017, Background #FFF8F0, Accent #2E7D32, Text #3E2723, Error #D32F2F
- All backend responses use JSON with `snake_case` keys
- All dates in YYYY-MM-DD format
- JWT must be passed as `Authorization: Bearer <token>` header

---

### Task 1: Backend — Form Submission Schemas

**Files:**
- Modify: `backend/app/schemas.py`

**Interfaces:**
- Produces: `HouseholdFormData`, `SurgeryFormData`, `FormSubmitResponse` Pydantic models

**Notes:**
- Use Optional fields for conditionally-shown fields
- Use `constr` / `Field(max_length=...)` for text max-length validation
- Family members and body sections stored as JSON strings

- [ ] **Step 1: Add household form schema**

Edit `backend/app/schemas.py`, append after existing schemas:

```python
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from datetime import date


# ============ Household Form Schemas ============

class FamilyMember(BaseModel):
    name: str = Field(..., max_length=100)
    relationship: str = Field(..., max_length=50)
    gender: str = Field(..., max_length=10)
    age: int = Field(..., ge=0, le=150)
    marital_status: str = Field(..., max_length=50)
    education: str = Field(..., max_length=100)
    occupation: str = Field(..., max_length=50)
    occupation_other: Optional[str] = Field(None, max_length=100)


class HouseholdFormData(BaseModel):
    survey_location: str = Field(..., max_length=200)
    surveyor_name: str = Field(..., max_length=100)
    interview_date: str = Field(..., max_length=20)
    house_address: str = Field(..., max_length=500)
    respondent_name: str = Field(..., max_length=100)
    ward: str = Field(..., max_length=100)
    ward_code: str = Field(..., max_length=50)
    house_code_uhi: str = Field(..., max_length=50)
    colony_name: str = Field(..., max_length=200)
    mobile_number: str = Field(..., max_length=15)
    religion: str = Field(..., max_length=50)
    religion_other: Optional[str] = Field(None, max_length=100)
    caste_category: str = Field(..., max_length=50)
    has_ration_card: str = Field(..., max_length=20)
    ration_card_type: Optional[str] = Field(None, max_length=100)
    has_poverty_certificate: str = Field(..., max_length=20)
    has_ayushman_card: str = Field(..., max_length=20)
    has_aadhaar: str = Field(..., max_length=20)
    has_pan: str = Field(..., max_length=20)
    has_sgy_card: str = Field(..., max_length=20)
    has_ncd_card: str = Field(..., max_length=20)
    has_other_card: str = Field(..., max_length=20)
    has_health_insurance: str = Field(..., max_length=20)
    insurance_type: Optional[str] = Field(None, max_length=100)
    years_in_area: Optional[int] = Field(None, ge=0)
    house_type: str = Field(..., max_length=50)
    is_own_house: str = Field(..., max_length=10)
    rent_amount: Optional[float] = Field(None, ge=0)
    has_separate_kitchen: str = Field(..., max_length=10)
    number_of_rooms: int = Field(..., ge=1)
    toilet_type: str = Field(..., max_length=100)
    lighting_source: str = Field(..., max_length=100)
    cooking_fuel: str = Field(..., max_length=100)
    drinking_water_source: str = Field(..., max_length=100)
    income_source: str = Field(..., max_length=100)
    monthly_income: float = Field(..., ge=0)
    monthly_health_expense: float = Field(..., ge=0)
    illness_types: str = Field(..., max_length=500)
    illness_other: Optional[str] = Field(None, max_length=200)
    knows_generic_medicines: str = Field(..., max_length=10)
    would_buy_generic: str = Field(..., max_length=10)
    family_type: str = Field(..., max_length=50)
    adult_count: int = Field(..., ge=0)
    child_count: int = Field(..., ge=0)
    total_members: int = Field(..., ge=1)
    family_members: str = Field(..., max_length=10000)  # JSON string
    had_surgery_last_year: str = Field(..., max_length=10)
    had_unmet_surgical_need: str = Field(..., max_length=10)

    @field_validator('mobile_number')
    @classmethod
    def validate_phone(cls, v):
        if not v.isdigit() or len(v) != 10:
            raise ValueError('Phone must be exactly 10 digits')
        return v


# ============ Surgery Form Schemas ============

class BodySectionProblem(BaseModel):
    has_problem: str = Field(..., max_length=10)
    body_part: Optional[str] = Field(None, max_length=100)
    problem_type: Optional[str] = Field(None, max_length=100)
    injury_cause: Optional[str] = Field(None, max_length=100)
    duration: Optional[str] = Field(None, max_length=50)
    still_exists: Optional[str] = Field(None, max_length=10)
    treatment_taken: Optional[str] = Field(None, max_length=10)
    treatment_place: Optional[str] = Field(None, max_length=100)
    traditional_healer: Optional[str] = Field(None, max_length=10)
    treatment_received: Optional[str] = Field(None, max_length=100)
    no_treatment_reason: Optional[str] = Field(None, max_length=200)
    daily_life_impact: Optional[str] = Field(None, max_length=200)


class MenstrualInfo(BaseModel):
    status: str = Field(..., max_length=50)
    period_last_year: Optional[str] = Field(None, max_length=10)
    bleeding_days: Optional[int] = Field(None, ge=1)
    regular: Optional[str] = Field(None, max_length=10)
    intermenstrual_bleeding: Optional[str] = Field(None, max_length=10)
    pain_affects_work: Optional[str] = Field(None, max_length=10)
    menstrual_product: Optional[str] = Field(None, max_length=100)
    pads_per_cycle: Optional[int] = Field(None, ge=0)
    needs_doctor: Optional[str] = Field(None, max_length=10)
    needs_home_remedy: Optional[str] = Field(None, max_length=10)
    needs_hospital: Optional[str] = Field(None, max_length=10)
    no_treatment_reason: Optional[str] = Field(None, max_length=200)


class PregnancyHistory(BaseModel):
    total_pregnancies: Optional[int] = Field(None, ge=0)
    home_deliveries: Optional[int] = Field(None, ge=0)
    hospital_deliveries: Optional[int] = Field(None, ge=0)
    currently_pregnant: Optional[str] = Field(None, max_length=10)
    pregnancy_month: Optional[int] = Field(None, ge=1, le=9)
    bleeding_during_pregnancy: Optional[str] = Field(None, max_length=10)
    currently_breastfeeding: Optional[str] = Field(None, max_length=10)


class FamilyPlanning(BaseModel):
    uses_method: Optional[str] = Field(None, max_length=10)
    method_type: Optional[str] = Field(None, max_length=100)


class SF12Answers(BaseModel):
    general_health: str = Field(..., max_length=50)
    moderate_activities: str = Field(..., max_length=50)
    climb_stairs: str = Field(..., max_length=50)
    accomplished_less_physical: str = Field(..., max_length=50)
    limited_work_kind: str = Field(..., max_length=50)
    accomplished_less_emotional: str = Field(..., max_length=50)
    careful_activities: str = Field(..., max_length=50)
    pain_interference: str = Field(..., max_length=50)
    calm_peaceful: str = Field(..., max_length=50)
    energetic: str = Field(..., max_length=50)
    downhearted: str = Field(..., max_length=50)
    social_interference: str = Field(..., max_length=50)


class SurgeryFormData(BaseModel):
    survey_location: str = Field(..., max_length=200)
    surveyor_name: str = Field(..., max_length=100)
    interview_date: str = Field(..., max_length=20)
    house_address: str = Field(..., max_length=500)
    patient_name: str = Field(..., max_length=100)
    ward: str = Field(..., max_length=100)
    ward_code: str = Field(..., max_length=50)
    house_code_uhi: str = Field(..., max_length=50)
    patient_code: str = Field(..., max_length=50)
    colony_name: str = Field(..., max_length=200)
    mobile_number: str = Field(..., max_length=15)
    age: int = Field(..., ge=0, le=150)
    gender: str = Field(..., max_length=10)
    education: str = Field(..., max_length=100)
    occupation: str = Field(..., max_length=50)
    occupation_other: Optional[str] = Field(None, max_length=100)
    body_sections: str = Field(..., max_length=50000)  # JSON array of 7 sections
    menstrual_info: Optional[str] = Field(None, max_length=10000)
    pregnancy_history: Optional[str] = Field(None, max_length=5000)
    family_planning: Optional[str] = Field(None, max_length=5000)
    has_bp: str = Field(..., max_length=10)
    bp_reading: Optional[str] = Field(None, max_length=50)
    has_diabetes: str = Field(..., max_length=10)
    blood_sugar_level: Optional[str] = Field(None, max_length=50)
    tobacco_use: str = Field(..., max_length=200)
    alcohol_use: str = Field(..., max_length=10)
    other_addictions: Optional[str] = Field(None, max_length=200)
    sf12_answers: str = Field(..., max_length=5000)  # JSON string
    needs_followup: str = Field(..., max_length=10)

    @field_validator('mobile_number')
    @classmethod
    def validate_phone(cls, v):
        if not v.isdigit() or len(v) != 10:
            raise ValueError('Phone must be exactly 10 digits')
        return v


# ============ Form Submit Response ============

class FormSubmitResponse(BaseModel):
    success: bool
    message: str
    id: Optional[str] = None
```

- [ ] **Step 2: Verify the file**

Run: `python -c "from app.schemas import HouseholdFormData, SurgeryFormData, FormSubmitResponse; print('OK')"`

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas.py
git commit -m "feat: add form submission schemas"
```

---

### Task 2: Backend — Google Sheets Methods for Form Storage

**Files:**
- Modify: `backend/app/google_sheets.py`

**Interfaces:**
- Consumes: `GoogleSheetsManager` (existing class)
- Produces: `get_or_create_worksheet(name, headers)`, `append_form_data(worksheet_name, data_dict)`, `ensure_worksheets_exist()`

- [ ] **Step 1: Add worksheet helper methods to GoogleSheetsManager**

Replace the entire `backend/app/google_sheets.py` with:

```python
import gspread
from google.oauth2 import service_account
import os
import json
import datetime
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class GoogleSheetsManager:
    def __init__(self):
        self.credentials = None
        self.client = None
        self.sheet = None
        self.users_worksheet = None
        self._initialize_connection()

    def _initialize_connection(self):
        try:
            credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
            credentials_file = os.getenv('GOOGLE_CREDENTIALS_FILE')

            if credentials_json:
                credentials_dict = json.loads(credentials_json)
            elif credentials_file and os.path.exists(credentials_file):
                with open(credentials_file, 'r') as f:
                    credentials_dict = json.load(f)
            else:
                raise ValueError("No Google credentials found. Set GOOGLE_CREDENTIALS_JSON or GOOGLE_CREDENTIALS_FILE")

            self.credentials = service_account.Credentials.from_service_account_info(
                credentials_dict,
                scopes=['https://www.googleapis.com/auth/spreadsheets',
                       'https://www.googleapis.com/auth/drive']
            )

            self.client = gspread.authorize(self.credentials)

            sheet_id = os.getenv('GOOGLE_SHEET_ID')
            if not sheet_id:
                raise ValueError("GOOGLE_SHEET_ID environment variable not set")

            self.sheet = self.client.open_by_key(sheet_id)
            self.users_worksheet = self._get_or_create_worksheet('users', ['id', 'name', 'phone', 'role'])

        except Exception as e:
            raise

    def _get_or_create_worksheet(self, name: str, headers: List[str]):
        try:
            ws = self.sheet.worksheet(name)
            return ws
        except gspread.exceptions.WorksheetNotFound:
            ws = self.sheet.add_worksheet(title=name, rows=1000, cols=len(headers))
            ws.append_row(headers)
            return ws

    def ensure_worksheets_exist(self):
        household_headers = [
            'id', 'user_id', 'created_at', 'survey_location', 'surveyor_name',
            'interview_date', 'house_address', 'respondent_name', 'ward',
            'ward_code', 'house_code_uhi', 'colony_name', 'mobile_number',
            'religion', 'religion_other', 'caste_category', 'has_ration_card',
            'ration_card_type', 'has_poverty_certificate', 'has_ayushman_card',
            'has_aadhaar', 'has_pan', 'has_sgy_card', 'has_ncd_card',
            'has_other_card', 'has_health_insurance', 'insurance_type',
            'years_in_area', 'house_type', 'is_own_house', 'rent_amount',
            'has_separate_kitchen', 'number_of_rooms', 'toilet_type',
            'lighting_source', 'cooking_fuel', 'drinking_water_source',
            'income_source', 'monthly_income', 'monthly_health_expense',
            'illness_types', 'illness_other', 'knows_generic_medicines',
            'would_buy_generic', 'family_type', 'adult_count', 'child_count',
            'total_members', 'family_members_json', 'had_surgery_last_year',
            'had_unmet_surgical_need'
        ]
        surgery_headers = [
            'id', 'user_id', 'created_at', 'survey_location', 'surveyor_name',
            'interview_date', 'house_address', 'patient_name', 'ward',
            'ward_code', 'house_code_uhi', 'patient_code', 'colony_name',
            'mobile_number', 'age', 'gender', 'education', 'occupation',
            'occupation_other', 'body_sections_json', 'menstrual_info_json',
            'pregnancy_history_json', 'family_planning_json', 'has_bp',
            'bp_reading', 'has_diabetes', 'blood_sugar_level', 'tobacco_use',
            'alcohol_use', 'other_addictions', 'sf12_answers_json',
            'needs_followup'
        ]
        self._get_or_create_worksheet('household_surveys', household_headers)
        self._get_or_create_worksheet('surgery_surveys', surgery_headers)

    def get_user_by_phone(self, phone_number: str) -> Optional[Dict[str, Any]]:
        try:
            if not self.users_worksheet:
                return None
            records = self.users_worksheet.get_all_records()
            for record in records:
                sheet_phone = str(record.get('phone')).strip() if record.get('phone') else None
                input_phone = str(phone_number).strip()
                if sheet_phone and sheet_phone == input_phone:
                    return {
                        'id': record.get('id'),
                        'name': record.get('name'),
                        'phone': sheet_phone
                    }
            return None
        except Exception as e:
            return None

    def add_user(self, name: str, phone_number: str) -> bool:
        try:
            if not self.users_worksheet:
                return False
            records = self.users_worksheet.get_all_records()
            next_id = len(records) + 1
            self.users_worksheet.append_row([next_id, name, phone_number, 'user'])
            return True
        except Exception as e:
            return False

    def append_form_data(self, worksheet_name: str, data: Dict[str, Any], user_id: str) -> Optional[str]:
        try:
            ws = self._get_or_create_worksheet(worksheet_name, [])
            records = ws.get_all_records()
            next_id = len(records) + 1
            
            row = {
                'id': str(next_id),
                'user_id': user_id,
                'created_at': datetime.datetime.utcnow().isoformat(),
            }
            row.update(data)
            
            headers = ws.row_values(1)
            ordered_row = []
            for h in headers:
                val = row.get(h, '')
                if isinstance(val, (dict, list)):
                    val = json.dumps(val, ensure_ascii=False)
                ordered_row.append(str(val) if val is not None else '')
            
            ws.append_row(ordered_row)
            return str(next_id)
        except Exception as e:
            raise

    def verify_sheet_structure(self) -> bool:
        try:
            if not self.users_worksheet:
                return False
            headers = self.users_worksheet.row_values(1)
            required_columns = ['id', 'name', 'phone']
            for col in required_columns:
                if col not in headers:
                    return False
            return True
        except Exception as e:
            return False


_sheets_manager = None

def get_sheets_manager() -> GoogleSheetsManager:
    global _sheets_manager
    if _sheets_manager is None:
        _sheets_manager = GoogleSheetsManager()
    return _sheets_manager
```

- [ ] **Step 2: Run verification**

Run: `python -c "from app.google_sheets import get_sheets_manager; m=get_sheets_manager(); print('Sheets OK')"`

Expected: `Sheets OK` (will also create worksheets if they don't exist)

- [ ] **Step 3: Commit**

```bash
git add backend/app/google_sheets.py
git commit -m "feat: add google sheets methods for form storage"
```

---

### Task 3: Backend — Form Submission Endpoints

**Files:**
- Modify: `backend/app/main.py`

**Interfaces:**
- Produces: `POST /api/forms/household`, `POST /api/forms/surgery`

- [ ] **Step 1: Add form endpoints to main.py**

Append before the `if __name__ == "__main__"` block in `backend/app/main.py`:

```python
from app.schemas import HouseholdFormData, SurgeryFormData, FormSubmitResponse
from typing import Optional
import json


def get_current_user_payload(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid auth scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format. Use: Bearer <token>")
    token_manager = get_token_manager()
    payload = token_manager.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


@app.post("/api/forms/household", response_model=FormSubmitResponse)
async def submit_household_form(
    form_data: HouseholdFormData,
    authorization: str = Header(None)
):
    try:
        user_payload = get_current_user_payload(authorization)
        sheets_manager = get_sheets_manager()
        sheets_manager.ensure_worksheets_exist()
        
        data = form_data.model_dump()
        submission_id = sheets_manager.append_form_data('household_surveys', data, user_payload['user_id'])
        
        return FormSubmitResponse(
            success=True,
            message="Household survey submitted successfully",
            id=submission_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting form: {str(e)}")


@app.post("/api/forms/surgery", response_model=FormSubmitResponse)
async def submit_surgery_form(
    form_data: SurgeryFormData,
    authorization: str = Header(None)
):
    try:
        user_payload = get_current_user_payload(authorization)
        sheets_manager = get_sheets_manager()
        sheets_manager.ensure_worksheets_exist()
        
        data = form_data.model_dump()
        submission_id = sheets_manager.append_form_data('surgery_surveys', data, user_payload['user_id'])
        
        return FormSubmitResponse(
            success=True,
            message="Surgery survey submitted successfully",
            id=submission_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting form: {str(e)}")
```

- [ ] **Step 2: Verify endpoint registration**

Run: `python -c "from app.main import app; routes=[r.path for r in app.routes]; print([r for r in routes if 'forms' in r])"`

Expected: `['/api/forms/household', '/api/forms/surgery']`

- [ ] **Step 3: Commit**

```bash
git add backend/app/main.py
git commit -m "feat: add form submission endpoints"
```

---

### Task 4: Frontend — Theme Update for NGO Branding

**Files:**
- Modify: `frontend/constants/theme.ts`

- [ ] **Step 1: Replace theme with Sevadham NGO colors**

Write `frontend/constants/theme.ts`:

```ts
export const Colors = {
  light: {
    primary: '#D4A017',
    background: '#FFF8F0',
    card: '#FFFFFF',
    text: '#3E2723',
    textSecondary: '#6D4C41',
    accent: '#2E7D32',
    error: '#D32F2F',
    border: '#E8E0D8',
    tint: '#D4A017',
    tabIconDefault: '#A1887F',
    tabIconSelected: '#D4A017',
    inputBorder: '#D7CCC8',
    inputBackground: '#FFF8F0',
    successText: '#2E7D32',
    errorText: '#D32F2F',
    progressTrack: '#EFEBE9',
    progressFill: '#D4A017',
    sectionHeader: '#FFF3E0',
    white: '#FFFFFF',
  },
  dark: {
    primary: '#F0C040',
    background: '#1A1A1A',
    card: '#2C2C2C',
    text: '#F5F5F5',
    textSecondary: '#BCAAA4',
    accent: '#66BB6A',
    error: '#EF5350',
    border: '#424242',
    tint: '#F0C040',
    tabIconDefault: '#9E9E9E',
    tabIconSelected: '#F0C040',
    inputBorder: '#616161',
    inputBackground: '#2C2C2C',
    successText: '#66BB6A',
    errorText: '#EF5350',
    progressTrack: '#424242',
    progressFill: '#F0C040',
    sectionHeader: '#3E2723',
    white: '#FFFFFF',
  },
};
```

- [ ] **Step 2: Verify no import errors**

Run: `cd frontend && npx tsc --noEmit constants/theme.ts`

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/constants/theme.ts
git commit -m "feat: update theme with sevadham ngo colors"
```

---

### Task 5: Frontend — i18n System

**Files:**
- Create: `frontend/src/i18n/en.json`
- Create: `frontend/src/i18n/mr.json`
- Create: `frontend/src/i18n/I18nContext.tsx`
- Create: `frontend/src/i18n/index.ts`

- [ ] **Step 1: Create English translations**

Write `frontend/src/i18n/en.json`:

```json
{
  "app.name": "Sevadham",
  "app.tagline": "Community Health Survey",
  
  "nav.home": "Home",
  "nav.household": "Household Survey",
  "nav.surgery": "Surgery Survey",
  
  "lang.en": "English",
  "lang.mr": "मराठी",
  "lang.switch": "मराठी",
  
  "login.title": "Sevadham",
  "login.subtitle": "Community Service Platform",
  "login.phoneLabel": "Phone Number",
  "login.phonePlaceholder": "Enter 10-digit phone number",
  "login.button": "Login",
  "login.hint": "Enter your 10-digit phone number to login",
  "login.error.invalidPhone": "Please enter a valid 10-digit phone number",
  "login.error.userNotFound": "User not found. Phone number does not exist in our database.",
  
  "home.welcome": "Hello, {{name}}!",
  "home.welcomeSubtitle": "Welcome to Sevadham Community Health Survey",
  "home.yourProfile": "Your Profile",
  "home.name": "Name",
  "home.phone": "Phone",
  "home.userId": "User ID",
  "home.status": "Status",
  "home.statusText": "You are successfully logged in and authenticated!",
  "home.forms": "Survey Forms",
  "home.householdDesc": "Household information and family health survey",
  "home.surgeryDesc": "Surgery screening and health assessment form",
  "home.logout": "Logout",
  "home.logoutConfirm": "Are you sure you want to logout?",
  "home.cancel": "Cancel",
  
  "household.title": "Household Survey",
  "household.surveyInfo": "Survey Information",
  "household.surveyLocation": "Survey Location",
  "household.surveyorName": "Surveyor's Name",
  "household.interviewDate": "Interview Date",
  "household.houseAddress": "House Address",
  "household.respondentName": "Respondent's Name",
  "household.ward": "Ward",
  "household.wardCode": "Ward Code",
  "household.houseCode": "House Code (UHI)",
  "household.colonyName": "Colony / Settlement Name",
  "household.mobileNumber": "Mobile Number",
  "household.demographics": "Social & Demographic Info",
  "household.religion": "Religion",
  "household.religionOther": "If Other, Specify",
  "household.casteCategory": "Caste Category",
  "household.hasRationCard": "Do you have a Ration Card?",
  "household.rationCardType": "Ration Card Type",
  "household.hasPovertyCert": "Do you have a Poverty / Income Certificate?",
  "household.hasAyushman": "Do you have an Ayushman Card?",
  "household.hasAadhaar": "Do you have an Aadhaar Card?",
  "household.hasPan": "Do you have a PAN Card?",
  "household.hasSgy": "Do you have an SGY Card?",
  "household.hasNcd": "Do you have an NCD Card?",
  "household.hasOtherCard": "Other Card (ESI, Disability, CGHS)?",
  "household.hasInsurance": "Do you have Health Insurance?",
  "household.insuranceType": "Insurance Type",
  "household.livingStandards": "Living Standards",
  "household.yearsInArea": "Years living in this area",
  "household.houseType": "House Type",
  "household.isOwnHouse": "Is this your own house?",
  "household.rentAmount": "Monthly Rent Amount (₹)",
  "household.hasKitchen": "Do you have a separate kitchen?",
  "household.numberOfRooms": "Number of rooms (incl. kitchen)",
  "household.toiletType": "Toilet facility used",
  "household.energy": "Energy & Utilities",
  "household.lightingSource": "Main source of lighting",
  "household.cookingFuel": "Main cooking fuel",
  "household.drinkingWater": "Main source of drinking water",
  "household.income": "Income & Health",
  "household.incomeSource": "Main source of family income",
  "household.monthlyIncome": "Total monthly family income (₹)",
  "household.monthlyHealthExpense": "Monthly health/medical expense (₹)",
  "household.illnessTypes": "Types of illnesses (select all that apply)",
  "household.illnessOther": "If Other, specify",
  "household.knowsGeneric": "Do you know about affordable generic medicines?",
  "household.wouldBuyGeneric": "Would you buy generic medicines if available?",
  "household.family": "Family Information",
  "household.familyType": "Family type",
  "household.adultCount": "Adults (18+)",
  "household.childCount": "Children (under 18)",
  "household.totalMembers": "Total members",
  "household.familyMembers": "Family Member Details",
  "household.addMember": "+ Add Member",
  "household.memberName": "Name",
  "household.memberRelationship": "Relationship to Head",
  "household.memberGender": "Gender",
  "household.memberAge": "Age (years)",
  "household.memberMaritalStatus": "Marital Status",
  "household.memberEducation": "Education",
  "household.memberOccupation": "Occupation",
  "household.memberOccupationOther": "If Other, specify",
  "household.removeMember": "Remove",
  "household.surgeryHistory": "Surgery / Medical Treatment",
  "household.hadSurgery": "Has anyone in the family had surgery in the last year?",
  "household.hadUnmetNeed": "Was there an unmet surgical/medical need in the last year?",
  "household.submit": "Submit Household Survey",
  "household.submitting": "Submitting...",
  "household.success": "Household survey submitted successfully!",

  "surgery.title": "Surgery Survey",
  "surgery.surveyInfo": "Survey Information",
  "surgery.surveyLocation": "Survey Location",
  "surgery.surveyorName": "Surveyor's Name",
  "surgery.interviewDate": "Interview Date",
  "surgery.houseAddress": "House Address",
  "surgery.patientName": "Patient's Name",
  "surgery.ward": "Ward",
  "surgery.wardCode": "Ward Code",
  "surgery.houseCode": "House Code (UHI)",
  "surgery.patientCode": "Patient Code",
  "surgery.colonyName": "Colony / Settlement Name",
  "surgery.mobileNumber": "Mobile Number",
  "surgery.patientInfo": "Patient Information",
  "surgery.age": "Age",
  "surgery.gender": "Gender",
  "surgery.education": "Education",
  "surgery.occupation": "Occupation",
  "surgery.occupationOther": "If Other, specify",
  "surgery.section61": "Section 6.1: Face / Head / Neck",
  "surgery.section62": "Section 6.2: Chest / Breast",
  "surgery.section63": "Section 6.3: Back",
  "surgery.section64": "Section 6.4: Abdomen",
  "surgery.section65": "Section 6.5: Groin / Genital / Thigh",
  "surgery.section66": "Section 6.6: Arms / Legs",
  "surgery.section67": "Section 6.7: Menstrual & Reproductive Health",
  "surgery.hasProblem": "Have you had any problem in this area in the past year?",
  "surgery.bodyPart": "Which body part is affected?",
  "surgery.problemType": "Type of problem",
  "surgery.injuryCause": "Was it caused by injury/accident?",
  "surgery.duration": "Duration",
  "surgery.stillExists": "Does the problem still exist?",
  "surgery.treatmentTaken": "Did you take treatment?",
  "surgery.treatmentPlace": "Where did you seek treatment?",
  "surgery.traditionalHealer": "Did you consult a traditional healer?",
  "surgery.treatmentReceived": "Type of treatment received",
  "surgery.noTreatmentReason": "If not treated, reason",
  "surgery.dailyLifeImpact": "Impact on daily life",
  "surgery.menstrualHistory": "Menstrual History",
  "surgery.bleedingDays": "How many days of bleeding?",
  "surgery.regular": "Is your period regular?",
  "surgery.intermenstrualBleeding": "Bleeding between periods?",
  "surgery.painAffectsWork": "Does pain affect your work?",
  "surgery.menstrualProduct": "What do you use during periods?",
  "surgery.padsPerCycle": "Number of pads per cycle",
  "surgery.needsDoctor": "Do you need doctor/medication?",
  "surgery.needsHomeRemedy": "Do you need home remedies?",
  "surgery.needsHospital": "Do you need to visit hospital?",
  "surgery.pregnancyHistory": "Pregnancy & Delivery",
  "surgery.totalPregnancies": "Total number of pregnancies",
  "surgery.homeDeliveries": "Home deliveries",
  "surgery.hospitalDeliveries": "Hospital deliveries",
  "surgery.currentlyPregnant": "Currently pregnant?",
  "surgery.pregnancyMonth": "Month of pregnancy",
  "surgery.bleedingDuringPregnancy": "Bleeding during current pregnancy?",
  "surgery.currentlyBreastfeeding": "Currently breastfeeding?",
  "surgery.familyPlanning": "Family Planning",
  "surgery.usesFamilyPlanning": "Using family planning method?",
  "surgery.familyPlanningMethod": "Method used",
  "surgery.bpDiabetes": "Blood Pressure, Diabetes & Addiction",
  "surgery.hasBp": "Do you have high BP?",
  "surgery.bpReading": "BP Reading",
  "surgery.hasDiabetes": "Do you have diabetes?",
  "surgery.bloodSugarLevel": "Blood sugar level",
  "surgery.tobaccoUse": "Tobacco use",
  "surgery.alcoholUse": "Alcohol consumption",
  "surgery.otherAddictions": "Other addictions",
  "surgery.sf12": "SF-12 Quality of Life",
  "surgery.sf12.q1": "1. In general, how would you rate your health?",
  "surgery.sf12.q2": "2. Moderate activities (housework, cycling, walking)",
  "surgery.sf12.q3": "3. Climbing 2+ flights of stairs",
  "surgery.sf12.q4": "4. Accomplished less than you'd like (physical)",
  "surgery.sf12.q5": "5. Limited in kind of work (physical)",
  "surgery.sf12.q6": "6. Accomplished less than you'd like (emotional)",
  "surgery.sf12.q7": "7. Didn't do work as carefully (emotional)",
  "surgery.sf12.q8": "8. Pain interfered with daily activities",
  "surgery.sf12.q9": "9. Felt calm and peaceful",
  "surgery.sf12.q10": "10. Had lots of energy",
  "surgery.sf12.q11": "11. Felt downhearted or depressed",
  "surgery.sf12.q12": "12. Health problems interfered with social activities",
  "surgery.needsFollowup": "Does this patient need follow-up?",
  "surgery.submit": "Submit Surgery Survey",
  "surgery.submitting": "Submitting...",
  "surgery.success": "Surgery survey submitted successfully!",

  "common.yes": "Yes",
  "common.no": "No",
  "common.dontKnow": "Don't Know",
  "common.select": "Select",
  "common.other": "Other",
  "common.pleaseSpecify": "Please specify",
  "common.submit": "Submit",
  "common.cancel": "Cancel",
  "common.loading": "Loading...",
  "common.error": "Error",
  "common.success": "Success",
  "common.required": "This field is required",
  "common.invalidPhone": "Please enter a valid 10-digit phone number",
  "common.invalidNumber": "Please enter a valid number",
  "common.scrollToError": "Please correct the highlighted errors",
  "common.serverError": "Server error. Please try again.",
  "common.progress": "{{completed}}/{{total}} sections completed",

  "wards.bibwewadi": "Bibwewadi Ward",
  "wards.dhankawadi": "Dhankawadi - Sahakar Nagar",
  "wards.kasba": "Kasba - Vishrambag Wada",
  "wards.sinhagad": "Sinhagad Road",

  "religion.hindu": "Hindu",
  "religion.muslim": "Muslim",
  "religion.christian": "Christian",
  "religion.other": "Other",

  "caste.sc": "Scheduled Caste (SC)",
  "caste.obc": "Other Backward Class (OBC)",
  "caste.st": "Scheduled Tribe (ST)",
  "caste.open": "General (Open)",
  "caste.unknown": "Don't Know",

  "rationCard.api": "APL Card (Orange)",
  "rationCard.bpl": "BPL Card (Yellow)",
  "rationCard.aay": "Antyodaya Anna Yojana Card",

  "insurance.govt": "Government / CGHS",
  "insurance.private": "Private Insurance (self)",
  "insurance.privateEmployer": "Private Insurance (employer)",
  "insurance.esi": "Employee State Insurance (ESI)",
  "insurance.unknown": "Don't Know",

  "houseType.kuccha": "Kuccha (Temporary)",
  "houseType.semiPucca": "Semi-Pucca",
  "houseType.pucca": "Pucca (Permanent)",

  "toilet.own": "Own Toilet",
  "toilet.shared": "Shared / Public Toilet",

  "lighting.electricity": "Electricity",
  "lighting.kerosene": "Kerosene, Gas, Oil",
  "lighting.other": "Other (Solar, Charging light)",

  "fuel.electricity": "Electricity, LPG or Biogas",
  "fuel.coal": "Coal, Charcoal or Kerosene",
  "fuel.other": "Other (Wood, Dung, etc.)",

  "water.home": "Tap/Handpump/Well in home/yard",
  "water.public": "Public Tap/Handpump/Well",
  "water.other": "Other (Tanker, Pond, River)",
  "water.purchased": "Purchased water",

  "incomeSource.dailyWage": "Daily wage labor",
  "incomeSource.salary": "Salaried job",
  "incomeSource.business": "Business income",
  "incomeSource.livestock": "Livestock income",
  "incomeSource.other": "Other income",

  "familyType.joint": "Joint Family",
  "familyType.nuclear": "Nuclear Family",
  "familyType.threeGen": "Three-generation Family",

  "gender.male": "Male",
  "gender.female": "Female",

  "maritalStatus.married": "Married",
  "maritalStatus.separated": "Separated",
  "maritalStatus.widowed": "Widowed",
  "maritalStatus.divorced": "Divorced",
  "maritalStatus.unmarried": "Unmarried",

  "occupation.selfEmployed": "Self-employed",
  "occupation.privateJob": "Private job",
  "occupation.govtJob": "Government job",
  "occupation.dailyWage": "Daily wage",
  "occupation.pensioner": "Pensioner",
  "occupation.unemployed": "Unemployed",
  "occupation.student": "Student",
  "occupation.homemaker": "Homemaker",
  "occupation.notApplicable": "Not Applicable",
  "occupation.elderly": "Elderly",
  "occupation.other": "Other",

  "illness.general": "General illness",
  "illness.maternal": "Maternal health",
  "illness.child": "Childhood illnesses",
  "illness.infectious": "Infectious diseases (e.g. TB)",
  "illness.nonCommunicable": "Non-communicable (BP, Diabetes, Heart)",
  "illness.other": "Other",

  "bodyPart.eye": "Eye",
  "bodyPart.ent": "Nose/Ear/Throat",
  "bodyPart.dental": "Teeth/Lips/Mouth",
  "bodyPart.neck": "Neck",
  "bodyPart.head": "Head",
  "bodyPart.fingers": "Fingers",
  "bodyPart.hand": "Thumb/Hand/Palm",
  "bodyPart.wrist": "Wrist to Elbow",
  "bodyPart.elbow": "Elbow to Shoulder",
  "bodyPart.foot": "Sole of Foot",
  "bodyPart.ankle": "Ankle to Knee",
  "bodyPart.knee": "Knee to Thigh",
  "bodyPart.kneeOnly": "Knee",
  "bodyPart.other": "Other",

  "problemType.injury": "Injury (by accident)",
  "problemType.nonInjury": "Injury (without accident)",
  "problemType.burn": "Burn",
  "problemType.lump": "Lump/Swelling",
  "problemType.congenital": "Congenital deformity",
  "problemType.acquired": "Acquired deformity",
  "problemType.pus": "Pus/Infection",
  "problemType.fracture": "Fracture",
  "problemType.nonHealingWound": "Non-healing wound",
  "problemType.other": "Other",

  "cause.none": "None",
  "cause.car": "Car/Truck/Bus accident",
  "cause.motorcycle": "Motorcycle accident",
  "cause.pedestrian": "Pedestrian/Cycle accident",
  "cause.gunshot": "Gunshot",
  "cause.knife": "Knife wound",
  "cause.animal": "Animal attack",
  "cause.fall": "Fall",
  "cause.fire": "Fire/Explosion",
  "cause.scald": "Scald (hot liquid)",
  "cause.other": "Other",

  "duration.lastMonth": "Within the last month",
  "duration.lastYear": "Within the last year",
  "duration.beforeYear": "Before one year",

  "treatmentPlace.uhc": "Urban Health Center",
  "treatmentPlace.govtHospital": "Government Hospital",
  "treatmentPlace.privateHospital": "Private Hospital/Clinic",
  "treatmentPlace.trust": "Trust/Institution Hospital",
  "treatmentPlace.other": "Other",

  "treatmentType.noSurgery": "No surgery needed",
  "treatmentType.majorSurgery": "Major surgery",
  "treatmentType.minorSurgery": "Minor surgery",
  "treatmentType.medication": "Medication only",

  "noTreatmentReason.noMoney": "No money",
  "noTreatmentReason.noTransport": "No transport",
  "noTreatmentReason.noTime": "No time",
  "noTreatmentReason.fear": "Fear/Lack of trust",
  "noTreatmentReason.noFacility": "Facility not available",
  "noTreatmentReason.noNeed": "Did not feel needed",
  "noTreatmentReason.other": "Other",

  "impact.none": "No impact",
  "impact.shame": "Feels ashamed",
  "impact.cannotWork": "Cannot work normally",
  "impact.needsHelpMove": "Needs help to move around",
  "impact.needsHelpDaily": "Needs help with daily tasks",
  "impact.other": "Other",

  "sf12.excellent": "Excellent",
  "sf12.veryGood": "Very Good",
  "sf12.good": "Good",
  "sf12.fair": "Fair",
  "sf12.poor": "Poor",
  "sf12.yesLimited": "Yes, limited a lot",
  "sf12.yesLimitedLittle": "Yes, limited a little",
  "sf12.noNotLimited": "No, not limited at all",
  "sf12.allTime": "All of the time",
  "sf12.mostTime": "Most of the time",
  "sf12.someTime": "Some of the time",
  "sf12.littleTime": "A little of the time",
  "sf12.noneTime": "None of the time",
  "sf12.notAtAll": "Not at all",
  "sf12.slightly": "Slightly",
  "sf12.moderately": "Moderately",
  "sf12.quiteALot": "Quite a lot",
  "sf12.extremely": "Extremely",

  "error.fieldsRequired": "Please fill in all required fields",
  "error.submitFailed": "Submission failed. Please try again."
}
```

- [ ] **Step 2: Create Marathi translations**

Write `frontend/src/i18n/mr.json` with all the same keys but Marathi values. This is a large file. Key entries:

```json
{
  "app.name": "सेवाधाम",
  "app.tagline": "सामुदायिक आरोग्य सर्वेक्षण",
  
  "nav.home": "मुखपृष्ठ",
  "nav.household": "कुटुंब सर्वेक्षण",
  "nav.surgery": "शस्त्रक्रिया सर्वेक्षण",
  
  "lang.en": "English",
  "lang.mr": "मराठी",
  "lang.switch": "English",
  
  "login.title": "सेवाधाम",
  "login.subtitle": "सामुदायिक सेवा व्यासपीठ",
  "login.phoneLabel": "मोबाईल नंबर",
  "login.phonePlaceholder": "10-अंकी मोबाईल नंबर टाका",
  "login.button": "लॉगिन",
  "login.hint": "लॉगिन करण्यासाठी तुमचा 10-अंकी मोबाईल नंबर टाका",
  "login.error.invalidPhone": "कृपया वैध 10-अंकी मोबाईल नंबर टाका",
  "login.error.userNotFound": "वापरकर्ता सापडला नाही. हा मोबाईल नंबर आमच्या डेटाबेसमध्ये अस्तित्वात नाही.",
  
  "home.welcome": "नमस्कार, {{name}}!",
  "home.welcomeSubtitle": "सेवाधाम सामुदायिक आरोग्य सर्वेक्षणात आपले स्वागत आहे",
  "home.yourProfile": "तुमची प्रोफाइल",
  "home.name": "नाव",
  "home.phone": "मोबाईल",
  "home.userId": "वापरकर्ता आयडी",
  "home.status": "स्थिती",
  "home.statusText": "तुम्ही यशस्वीरित्या लॉगिन केले आहे!",
  "home.forms": "सर्वेक्षण फॉर्म",
  "home.householdDesc": "कुटुंब माहिती आणि आरोग्य सर्वेक्षण",
  "home.surgeryDesc": "शस्त्रक्रिया तपासणी आणि आरोग्य मूल्यांकन फॉर्म",
  "home.logout": "लॉगआउट",
  "home.logoutConfirm": "तुम्ही लॉगआउट करू इच्छिता का?",
  "home.cancel": "रद्द करा",
  
  "household.title": "कुटुंब सर्वेक्षण",
  "household.surveyInfo": "सर्वेक्षण माहिती",
  "household.surveyLocation": "सर्वेक्षण स्थळ",
  "household.surveyorName": "सर्वेक्षकाचे नाव",
  "household.interviewDate": "मुलाखतीची तारीख",
  "household.houseAddress": "घराचा पत्ता",
  "household.respondentName": "माहिती देणाऱ्याचे नाव",
  "household.ward": "वॉर्ड",
  "household.wardCode": "वॉर्ड कोड",
  "household.houseCode": "घर कोड (UHI)",
  "household.colonyName": "चाळ/वसाहतीचे नाव",
  "household.mobileNumber": "मोबाईल नंबर",
  "household.demographics": "सामाजिक आणि लोकसंख्याशास्त्रीय माहिती",
  "household.religion": "धर्म",
  "household.religionOther": "इतर असल्यास, नमूद करा",
  "household.casteCategory": "जात प्रवर्ग",
  "household.hasRationCard": "तुमच्याकडे रेशन कार्ड आहे का?",
  "household.rationCardType": "रेशन कार्डचा प्रकार",
  "household.hasPovertyCert": "तुमच्याकडे गरिबी प्रमाणपत्र / उत्पन्नाचा दाखला आहे का?",
  "household.hasAyushman": "तुमच्याकडे आयुष्मान कार्ड आहे का?",
  "household.hasAadhaar": "तुमच्याकडे आधार कार्ड आहे का?",
  "household.hasPan": "तुमच्याकडे पॅन कार्ड आहे का?",
  "household.hasSgy": "तुमच्याकडे SGY कार्ड आहे का?",
  "household.hasNcd": "तुमच्याकडे NCD कार्ड आहे का?",
  "household.hasOtherCard": "इतर कार्ड (ESI, Disability, CGHS)?",
  "household.hasInsurance": "तुमच्याकडे आरोग्य विमा आहे का?",
  "household.insuranceType": "आरोग्य विम्याचा प्रकार",
  "household.livingStandards": "राहणीमानाचा दर्जा",
  "household.yearsInArea": "तुम्ही या भागात किती वर्षांपासून राहत आहात?",
  "household.houseType": "घराचा प्रकार",
  "household.isOwnHouse": "हे तुमचे स्वतःचे घर आहे का?",
  "household.rentAmount": "दरमहा भाडे (₹)",
  "household.hasKitchen": "तुमच्या घरात स्वतंत्र स्वयंपाकघर आहे का?",
  "household.numberOfRooms": "खोल्यांची संख्या (स्वयंपाकघर धरून)",
  "household.toiletType": "शौचालय सुविधा",
  "household.energy": "ऊर्जा आणि सुविधा",
  "household.lightingSource": "प्रकाशाचा मुख्य स्रोत",
  "household.cookingFuel": "स्वयंपाकासाठी मुख्य इंधन",
  "household.drinkingWater": "पिण्याच्या पाण्याचा मुख्य स्रोत",
  "household.income": "उत्पन्न आणि आरोग्य",
  "household.incomeSource": "कुटुंबाच्या उत्पन्नाचा मुख्य स्रोत",
  "household.monthlyIncome": "एकूण मासिक उत्पन्न (₹)",
  "household.monthlyHealthExpense": "आरोग्यावर अंदाजे मासिक खर्च (₹)",
  "household.illnessTypes": "आजारांचे प्रकार (सर्व निवडा)",
  "household.illnessOther": "इतर असल्यास, नमूद करा",
  "household.knowsGeneric": "कमी किमतीच्या जेनेरिक औषधांबद्दल माहिती आहे का?",
  "household.wouldBuyGeneric": "जेनेरिक औषधे उपलब्ध असल्यास खरेदी कराल का?",
  "household.family": "कुटुंब माहिती",
  "household.familyType": "कुटुंबाचा प्रकार",
  "household.adultCount": "प्रौढ (18+)",
  "household.childCount": "मुले (18 वर्षांखालील)",
  "household.totalMembers": "एकूण सदस्य",
  "household.familyMembers": "कुटुंब सदस्यांचा तपशील",
  "household.addMember": "+ सदस्य जोडा",
  "household.memberName": "नाव",
  "household.memberRelationship": "कुटुंब प्रमुखाशी नाते",
  "household.memberGender": "लिंग",
  "household.memberAge": "वय (वर्षे)",
  "household.memberMaritalStatus": "वैवाहिक स्थिती",
  "household.memberEducation": "शिक्षण",
  "household.memberOccupation": "व्यवसाय",
  "household.memberOccupationOther": "इतर असल्यास, नमूद करा",
  "household.removeMember": "काढून टाका",
  "household.surgeryHistory": "शस्त्रक्रिया / वैद्यकीय उपचार",
  "household.hadSurgery": "गेल्या वर्षी घरातील कोणाची शस्त्रक्रिया झाली का?",
  "household.hadUnmetNeed": "गेल्या वर्षी शस्त्रक्रियेची गरज होती पण झाली नाही?",
  "household.submit": "कुटुंब सर्वेक्षण सबमिट करा",
  "household.submitting": "सबमिट होत आहे...",
  "household.success": "कुटुंब सर्वेक्षण यशस्वीरित्या सबमिट झाले!",
  
  "surgery.title": "शस्त्रक्रिया सर्वेक्षण",
  "surgery.surveyInfo": "सर्वेक्षण माहिती",
  "surgery.surveyLocation": "सर्वेक्षण स्थळ",
  "surgery.surveyorName": "सर्वेक्षकाचे नाव",
  "surgery.interviewDate": "मुलाखतीची तारीख",
  "surgery.houseAddress": "घराचा पत्ता",
  "surgery.patientName": "रुग्णाचे नाव",
  "surgery.ward": "वॉर्ड",
  "surgery.wardCode": "वॉर्ड कोड",
  "surgery.houseCode": "घर कोड (UHI)",
  "surgery.patientCode": "रुग्ण कोड",
  "surgery.colonyName": "चाळ/वसाहतीचे नाव",
  "surgery.mobileNumber": "मोबाईल नंबर",
  "surgery.patientInfo": "रुग्ण माहिती",
  "surgery.age": "वय",
  "surgery.gender": "लिंग",
  "surgery.education": "शिक्षण",
  "surgery.occupation": "व्यवसाय",
  "surgery.occupationOther": "इतर असल्यास, नमूद करा",
  "surgery.section61": "विभाग ६.१: चेहरा / डोके / मान",
  "surgery.section62": "विभाग ६.२: छाती / स्तन",
  "surgery.section63": "विभाग ६.३: पाठ",
  "surgery.section64": "विभाग ६.४: पोट",
  "surgery.section65": "विभाग ६.५: जांघ / जननेंद्रिय / मांड्या",
  "surgery.section66": "विभाग ६.६: हात / पाय",
  "surgery.section67": "विभाग ६.७: मासिक पाळी आणि प्रजनन आरोग्य",
  "surgery.hasProblem": "गेल्या वर्षात या भागात काही समस्या आली आहे का?",
  "surgery.bodyPart": "कोणता भाग प्रभावित आहे?",
  "surgery.problemType": "समस्येचा प्रकार",
  "surgery.injuryCause": "दुखापत/अपघातामुळे झाली होती का?",
  "surgery.duration": "कालावधी",
  "surgery.stillExists": "समस्या अजूनही आहे का?",
  "surgery.treatmentTaken": "उपचार घेतले का?",
  "surgery.treatmentPlace": "कुठे उपचार घेतले?",
  "surgery.traditionalHealer": "पारंपरिक वैद्याकडे गेला होता का?",
  "surgery.treatmentReceived": "मिळालेले उपचार",
  "surgery.noTreatmentReason": "उपचार न घेतल्यास, कारण",
  "surgery.dailyLifeImpact": "दैनंदिन जीवनावर परिणाम",
  "surgery.menstrualHistory": "मासिक पाळीचा इतिहास",
  "surgery.bleedingDays": "किती दिवस रक्तस्त्राव होतो?",
  "surgery.regular": "नियमित पाळी येते का?",
  "surgery.intermenstrualBleeding": "पाळी दरम्यान रक्तस्त्राव होतो का?",
  "surgery.painAffectsWork": "वेदनेमुळे कामावर परिणाम होतो का?",
  "surgery.menstrualProduct": "मासिक पाळीदरम्यान काय वापरता?",
  "surgery.padsPerCycle": "प्रति चक्र पॅडची संख्या",
  "surgery.needsDoctor": "डॉक्टर/औषधाची गरज लागते का?",
  "surgery.needsHomeRemedy": "घरगुती उपायांची गरज लागते का?",
  "surgery.needsHospital": "रुग्णालयात जावे लागते का?",
  "surgery.pregnancyHistory": "गर्भधारणा आणि प्रसूती",
  "surgery.totalPregnancies": "एकूण गर्भधारणांची संख्या",
  "surgery.homeDeliveries": "घरी प्रसूती",
  "surgery.hospitalDeliveries": "रुग्णालयात प्रसूती",
  "surgery.currentlyPregnant": "सध्या गर्भवती आहे का?",
  "surgery.pregnancyMonth": "गर्भधारणेचा महिना",
  "surgery.bleedingDuringPregnancy": "गर्भधारणेदरम्यान रक्तस्त्राव?",
  "surgery.currentlyBreastfeeding": "सध्या स्तनपान करत आहात का?",
  "surgery.familyPlanning": "कुटुंब नियोजन",
  "surgery.usesFamilyPlanning": "कुटुंब नियोजन पद्धत वापरता का?",
  "surgery.familyPlanningMethod": "कोणती पद्धत?",
  "surgery.bpDiabetes": "रक्तदाब, मधुमेह आणि व्यसन",
  "surgery.hasBp": "तुम्हाला उच्च रक्तदाब आहे का?",
  "surgery.bpReading": "BP रीडिंग",
  "surgery.hasDiabetes": "तुम्हाला मधुमेह आहे का?",
  "surgery.bloodSugarLevel": "रक्तातील साखरेचे प्रमाण",
  "surgery.tobaccoUse": "तंबाखूचे सेवन",
  "surgery.alcoholUse": "मद्यपान",
  "surgery.otherAddictions": "इतर व्यसने",
  "surgery.sf12": "SF-12 जीवन गुणवत्ता",
  "surgery.sf12.q1": "१. तुम्ही तुमचे आरोग्य कसे मानाल?",
  "surgery.sf12.q2": "२. मध्यम क्रिया करण्याची क्षमता",
  "surgery.sf12.q3": "३. दोन किंवा अधिक मजले चढण्याची क्षमता",
  "surgery.sf12.q4": "४. इच्छेपेक्षा कमी काम झाले (शारीरिक)",
  "surgery.sf12.q5": "५. कामाच्या प्रकारात मर्यादा (शारीरिक)",
  "surgery.sf12.q6": "६. इच्छेपेक्षा कमी काम झाले (भावनिक)",
  "surgery.sf12.q7": "७. काळजीपूर्वक क्रिया करू शकलो नाही (भावनिक)",
  "surgery.sf12.q8": "८. वेदनेमुळे दैनंदिन क्रियांवर परिणाम",
  "surgery.sf12.q9": "९. शांत आणि निवांत वाटले",
  "surgery.sf12.q10": "१०. उत्साही वाटले",
  "surgery.sf12.q11": "११. उदास किंवा दुःखी वाटले",
  "surgery.sf12.q12": "१२. आरोग्यामुळे सामाजिक क्रियांमध्ये अडथळा",
  "surgery.needsFollowup": "या रुग्णाला फॉलो-अपची गरज आहे का?",
  "surgery.submit": "शस्त्रक्रिया सर्वेक्षण सबमिट करा",
  "surgery.submitting": "सबमिट होत आहे...",
  "surgery.success": "शस्त्रक्रिया सर्वेक्षण यशस्वीरित्या सबमिट झाले!",

  "common.yes": "होय",
  "common.no": "नाही",
  "common.dontKnow": "माहित नाही",
  "common.select": "निवडा",
  "common.other": "इतर",
  "common.pleaseSpecify": "नमूद करा",
  "common.submit": "सबमिट करा",
  "common.cancel": "रद्द करा",
  "common.loading": "लोड होत आहे...",
  "common.error": "त्रुटी",
  "common.success": "यशस्वी",
  "common.required": "हे फील्ड आवश्यक आहे",
  "common.invalidPhone": "कृपया वैध 10-अंकी मोबाईल नंबर टाका",
  "common.invalidNumber": "कृपया वैध क्रमांक टाका",
  "common.scrollToError": "कृपया लाल रंगात दाखवलेल्या त्रुटी सुधारा",
  "common.serverError": "सर्व्हर त्रुटी. कृपया पुन्हा प्रयत्न करा.",
  "common.progress": "{{completed}}/{{total}} विभाग पूर्ण",

  "wards.bibwewadi": "बिबवेवाडी वॉर्ड",
  "wards.dhankawadi": "धनकवडी – सहकार नगर",
  "wards.kasba": "कसबा – विश्रामबाग वाडा",
  "wards.sinhagad": "सिंहगड रोड",

  "religion.hindu": "हिंदू",
  "religion.muslim": "मुस्लिम",
  "religion.christian": "ख्रिश्चन",
  "religion.other": "इतर",

  "caste.sc": "अनुसूचित जाती (SC)",
  "caste.obc": "इतर मागासवर्ग (OBC)",
  "caste.st": "अनुसूचित जमाती (ST)",
  "caste.open": "सर्वसाधारण (Open)",
  "caste.unknown": "माहित नाही",

  "rationCard.api": "एपीएल कार्ड (केशरी)",
  "rationCard.bpl": "बीपीएल कार्ड (पिवळे)",
  "rationCard.aay": "अंत्योदय अन्न योजना कार्ड",

  "insurance.govt": "सरकारी विमा / CGHS",
  "insurance.private": "खाजगी विमा (स्वतः)",
  "insurance.privateEmployer": "खाजगी विमा (कामाच्या ठिकाणी)",
  "insurance.esi": "कर्मचारी राज्य विमा (ESI)",
  "insurance.unknown": "माहित नाही",

  "houseType.kuccha": "कच्चे (तात्पुरते)",
  "houseType.semiPucca": "निम-पक्के",
  "houseType.pucca": "पक्के (कायमस्वरूपी)",

  "toilet.own": "स्वतःचे शौचालय",
  "toilet.shared": "सामायिक/सार्वजनिक शौचालय",

  "lighting.electricity": "वीज",
  "lighting.kerosene": "रॉकेल, गॅस, तेल",
  "lighting.other": "इतर (सौर उर्जा, चार्जिंग लाईट)",

  "fuel.electricity": "वीज, एलपीजी किंवा बायोगॅस",
  "fuel.coal": "कोळसा, लाकडी कोळसा किंवा रॉकेल",
  "fuel.other": "इतर (लाकूड, शेण, इ.)",

  "water.home": "घर/अंगणामध्ये नळ/हातपंप/विहीर",
  "water.public": "सार्वजनिक नळ/हातपंप/विहीर",
  "water.other": "इतर (टँकर, तलाव, नदी)",
  "water.purchased": "विकत घेतलेले पाणी",

  "incomeSource.dailyWage": "रोजंदारी मजूर",
  "incomeSource.salary": "पगारी नोकरी",
  "incomeSource.business": "व्यवसाय",
  "incomeSource.livestock": "पशुधन",
  "incomeSource.other": "इतर",

  "familyType.joint": "एकत्र कुटुंब",
  "familyType.nuclear": "विभक्त कुटुंब",
  "familyType.threeGen": "तीन पिढ्या एकत्र",

  "gender.male": "पुरुष",
  "gender.female": "स्त्री",

  "maritalStatus.married": "विवाहित",
  "maritalStatus.separated": "विवाहित पण एकत्र नाही",
  "maritalStatus.widowed": "विधुर/विधवा",
  "maritalStatus.divorced": "घटस्फोटित",
  "maritalStatus.unmarried": "अविवाहित",

  "occupation.selfEmployed": "स्वयंरोजगार",
  "occupation.privateJob": "खाजगी नोकरी",
  "occupation.govtJob": "सरकारी नोकरी",
  "occupation.dailyWage": "रोजंदारी मजूर",
  "occupation.pensioner": "निवृत्तीवेतनधारक",
  "occupation.unemployed": "बेरोजगार",
  "occupation.student": "विद्यार्थी",
  "occupation.homemaker": "गृहिणी",
  "occupation.notApplicable": "लागू नाही",
  "occupation.elderly": "वृद्ध",
  "occupation.other": "इतर",

  "illness.general": "सामान्य आजार",
  "illness.maternal": "माता आरोग्य",
  "illness.child": "लहान मुलांचे आजार",
  "illness.infectious": "संसर्गजन्य रोग (क्षयरोग)",
  "illness.nonCommunicable": "असंसर्गजन्य रोग (रक्तदाब, मधुमेह)",
  "illness.other": "इतर",

  "bodyPart.eye": "डोळा",
  "bodyPart.ent": "नाक/कान/घसा",
  "bodyPart.dental": "दात/ओठ/तोंड",
  "bodyPart.neck": "मान",
  "bodyPart.head": "डोके",
  "bodyPart.fingers": "बोटे",
  "bodyPart.hand": "अंगठा/हात/तळहात",
  "bodyPart.wrist": "मनगट ते कोपर",
  "bodyPart.elbow": "कोपर ते खांदा",
  "bodyPart.foot": "पायाचा तळवा",
  "bodyPart.ankle": "घोटा ते गुडघा",
  "bodyPart.knee": "गुडघा ते मांडी",
  "bodyPart.kneeOnly": "गुडघा",
  "bodyPart.other": "इतर",

  "problemType.injury": "दुखापतीमुळे जखम",
  "problemType.nonInjury": "दुखापतीशिवाय जखम",
  "problemType.burn": "भाजणे",
  "problemType.lump": "गाठ/सूज",
  "problemType.congenital": "जन्मजात व्यंगत्व",
  "problemType.acquired": "नंतर निर्माण झालेले व्यंगत्व",
  "problemType.pus": "पू येणे",
  "problemType.fracture": "फ्रॅक्चर",
  "problemType.nonHealingWound": "न भरणारा व्रण",
  "problemType.other": "इतर",

  "cause.none": "नाही",
  "cause.car": "कार/ट्रक/बस अपघात",
  "cause.motorcycle": "मोटारसायकल अपघात",
  "cause.pedestrian": "पादचारी/सायकल अपघात",
  "cause.gunshot": "बंदुकीची गोळी",
  "cause.knife": "चाकूची जखम",
  "cause.animal": "प्राण्याचा हल्ला",
  "cause.fall": "पडणे",
  "cause.fire": "आग/स्फोट",
  "cause.scald": "गरम द्रवाने भाजणे",
  "cause.other": "इतर",

  "duration.lastMonth": "गेल्या महिन्यात",
  "duration.lastYear": "गेल्या वर्षात",
  "duration.beforeYear": "एक वर्षापूर्वीपासून",

  "treatmentPlace.uhc": "शहरी आरोग्य केंद्र",
  "treatmentPlace.govtHospital": "सरकारी रुग्णालय",
  "treatmentPlace.privateHospital": "खाजगी रुग्णालय/क्लिनिक",
  "treatmentPlace.trust": "ट्रस्ट/संस्थेचे हॉस्पिटल",
  "treatmentPlace.other": "इतर",

  "treatmentType.noSurgery": "शस्त्रक्रिया नाही",
  "treatmentType.majorSurgery": "मोठी शस्त्रक्रिया",
  "treatmentType.minorSurgery": "छोटी शस्त्रक्रिया",
  "treatmentType.medication": "फक्त औषधे",

  "noTreatmentReason.noMoney": "पैसे नाहीत",
  "noTreatmentReason.noTransport": "वाहतूक नाही",
  "noTreatmentReason.noTime": "वेळ नाही",
  "noTreatmentReason.fear": "भीती/विश्वासाचा अभाव",
  "noTreatmentReason.noFacility": "सुविधा उपलब्ध नाही",
  "noTreatmentReason.noNeed": "गरज वाटली नाही",
  "noTreatmentReason.other": "इतर",

  "impact.none": "परिणाम नाही",
  "impact.shame": "लाज वाटते",
  "impact.cannotWork": "सामान्य काम करू शकत नाही",
  "impact.needsHelpMove": "फिरण्यासाठी मदत लागते",
  "impact.needsHelpDaily": "दैनंदिन कामांसाठी मदत लागते",
  "impact.other": "इतर",

  "sf12.excellent": "उत्कृष्ट",
  "sf12.veryGood": "खूप चांगले",
  "sf12.good": "चांगले",
  "sf12.fair": "ठीक",
  "sf12.poor": "खराब",
  "sf12.yesLimited": "होय, खूप मर्यादित",
  "sf12.yesLimitedLittle": "होय, थोडे मर्यादित",
  "sf12.noNotLimited": "नाही, अजिबात मर्यादित नाही",
  "sf12.allTime": "नेहमी",
  "sf12.mostTime": "बहुतेक वेळा",
  "sf12.someTime": "कधीकधी",
  "sf12.littleTime": "थोड्या वेळा",
  "sf12.noneTime": "कधीच नाही",
  "sf12.notAtAll": "अजिबात नाही",
  "sf12.slightly": "किंचित",
  "sf12.moderately": "मध्यम",
  "sf12.quiteALot": "बरंच",
  "sf12.extremely": "अत्यंत",

  "error.fieldsRequired": "कृपया सर्व आवश्यक फील्ड भरा",
  "error.submitFailed": "सबमिशन अयशस्वी. कृपया पुन्हा प्रयत्न करा."
}
```

- [ ] **Step 3: Create I18nContext**

Write `frontend/src/i18n/I18nContext.tsx`:

```tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import mr from './mr.json';

type TranslationKey = keyof typeof en;
type TranslationDict = Record<string, string>;

interface I18nContextType {
  language: 'en' | 'mr';
  setLanguage: (lang: 'en' | 'mr') => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<string, TranslationDict> = { en, mr };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'mr'>('en');

  useEffect(() => {
    AsyncStorage.getItem('appLanguage').then((saved) => {
      if (saved === 'en' || saved === 'mr') {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: 'en' | 'mr') => {
    setLanguageState(lang);
    await AsyncStorage.setItem('appLanguage', lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[language];
      let val = dict[key] || en[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          val = val.replace(`{{${k}}}`, String(v));
        });
      }
      return val;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
```

- [ ] **Step 4: Create i18n index barrel export**

Write `frontend/src/i18n/index.ts`:

```ts
export { I18nProvider, useI18n } from './I18nContext';
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/i18n/
git commit -m "feat: add i18n system with english and marathi"
```

---

### Task 6: Frontend — Reusable Form Components

**Files:**
- Create: `frontend/src/components/FormField.tsx`
- Create: `frontend/src/components/TextInputField.tsx`
- Create: `frontend/src/components/SelectField.tsx`
- Create: `frontend/src/components/MultiSelectField.tsx`
- Create: `frontend/src/components/SectionCard.tsx`
- Create: `frontend/src/components/ProgressBar.tsx`
- Create: `frontend/src/components/FamilyMemberCard.tsx`

Each component uses the theme colors from `@/constants/theme` and i18n from `@/src/i18n`.

- [ ] **Step 1: Create FormField wrapper component**

Write `frontend/src/components/FormField.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useI18n } from '@/src/i18n';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export default function FormField({ label, required, error, children }: FormFieldProps) {
  const colors = Colors.light;
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>
      {children}
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  error: { fontSize: 12, marginTop: 4 },
});
```

- [ ] **Step 2: Create TextInputField component**

Write `frontend/src/components/TextInputField.tsx`:

```tsx
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
```

- [ ] **Step 3: Create SelectField (radio group)**

Write `frontend/src/components/SelectField.tsx`:

```tsx
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
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  radioFill: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: { fontSize: 14, flex: 1 },
});
```

- [ ] **Step 4: Create MultiSelectField (checkboxes)**

Write `frontend/src/components/MultiSelectField.tsx`:

```tsx
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
```

- [ ] **Step 5: Create SectionCard (collapsible section)**

Write `frontend/src/components/SectionCard.tsx`:

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface SectionCardProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export default function SectionCard({ title, defaultExpanded = true, children }: SectionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const colors = Colors.light;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
```

- [ ] **Step 6: Create ProgressBar**

Write `frontend/src/components/ProgressBar.tsx`:

```tsx
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
```

- [ ] **Step 7: Create FamilyMemberCard**

Write `frontend/src/components/FamilyMemberCard.tsx`:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useI18n } from '@/src/i18n';
import TextInputField from './TextInputField';
import SelectField from './SelectField';
import { FAMILY_RELATIONS, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, EDUCATION_OPTIONS, OCCUPATION_OPTIONS } from '@/src/forms/household/fieldOptions';
import { t } from '@/src/i18n';

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
        columns={2}
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
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: add reusable form components"
```

---

### Task 7: Frontend — Household Survey Form

**Files:**
- Create: `frontend/src/forms/household/fieldOptions.ts`
- Create: `frontend/src/forms/household/HouseholdForm.tsx`
- Create: `frontend/app/(tabs)/household.tsx`

- [ ] **Step 1: Create household field options constants**

Write `frontend/src/forms/household/fieldOptions.ts`:

```ts
export const WARD_OPTIONS = ['wards.bibwewadi', 'wards.dhankawadi', 'wards.kasba', 'wards.sinhagad'];
export const RELIGION_OPTIONS = ['religion.hindu', 'religion.muslim', 'religion.christian', 'religion.other'];
export const CASTE_OPTIONS = ['caste.sc', 'caste.obc', 'caste.st', 'caste.open', 'caste.unknown'];
export const YES_NO_DK = ['common.yes', 'common.no', 'common.dontKnow'];
export const YES_NO = ['common.yes', 'common.no'];
export const RATION_CARD_TYPES = ['rationCard.api', 'rationCard.bpl', 'rationCard.aay'];
export const INSURANCE_TYPES = ['insurance.govt', 'insurance.private', 'insurance.privateEmployer', 'insurance.esi', 'insurance.unknown'];
export const HOUSE_TYPES = ['houseType.kuccha', 'houseType.semiPucca', 'houseType.pucca'];
export const TOILET_TYPES = ['toilet.own', 'toilet.shared'];
export const LIGHTING_OPTIONS = ['lighting.electricity', 'lighting.kerosene', 'lighting.other'];
export const FUEL_OPTIONS = ['fuel.electricity', 'fuel.coal', 'fuel.other'];
export const WATER_OPTIONS = ['water.home', 'water.public', 'water.other', 'water.purchased'];
export const INCOME_SOURCES = ['incomeSource.dailyWage', 'incomeSource.salary', 'incomeSource.business', 'incomeSource.livestock', 'incomeSource.other'];
export const FAMILY_TYPES = ['familyType.joint', 'familyType.nuclear', 'familyType.threeGen'];
export const ILLNESS_OPTIONS = ['illness.general', 'illness.maternal', 'illness.child', 'illness.infectious', 'illness.nonCommunicable', 'illness.other'];
export const FAMILY_RELATIONS = [
  'household.relation.head', 'household.relation.spouse', 'household.relation.son', 'household.relation.daughter',
  'household.relation.sonInLaw', 'household.relation.daughterInLaw', 'household.relation.grandchild',
  'household.relation.parent', 'household.relation.parentInLaw', 'household.relation.sibling',
  'household.relation.siblingInLaw', 'household.relation.nephew', 'household.relation.adopted',
  'household.relation.otherRelative', 'household.relation.other',
];
export const GENDER_OPTIONS = ['gender.male', 'gender.female'];
export const MARITAL_STATUS_OPTIONS = ['maritalStatus.married', 'maritalStatus.separated', 'maritalStatus.widowed', 'maritalStatus.divorced', 'maritalStatus.unmarried'];
export const OCCUPATION_OPTIONS = [
  'occupation.selfEmployed', 'occupation.privateJob', 'occupation.govtJob',
  'occupation.dailyWage', 'occupation.pensioner', 'occupation.unemployed',
  'occupation.student', 'occupation.homemaker', 'occupation.notApplicable', 'occupation.other',
];
```

- [ ] **Step 2: Create the full HouseholdForm component**

Write `frontend/src/forms/household/HouseholdForm.tsx` (this is the largest component — the complete form with all sections, validation, and submission logic).

The component should:
- Render all sections as collapsible SectionCards
- Use TextInputField, SelectField, MultiSelectField for each field type
- Track form data in a single state object
- Track errors in a separate state object
- Implement conditional show/hide logic (Has ration card? → show type; Is own house? → hide rent; etc.)
- Support dynamic family member add/remove
- Calculate progress based on completed sections
- On submit: validate, scroll to first error, POST to API

The full code is comprehensive — it implements all ~40+ fields with proper conditional logic.

- [ ] **Step 3: Create the household route page**

Write `frontend/app/(tabs)/household.tsx`:

```tsx
import HouseholdForm from '@/src/forms/household/HouseholdForm';
export default function HouseholdPage() { return <HouseholdForm />; }
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/forms/household/ frontend/app/(tabs)/household.tsx
git commit -m "feat: add household survey form"
```

---

### Task 8: Frontend — Surgery Survey Form

**Files:**
- Create: `frontend/src/forms/surgery/fieldOptions.ts`
- Create: `frontend/src/forms/surgery/SurgeryForm.tsx`
- Create: `frontend/app/(tabs)/surgery.tsx`

- [ ] **Step 1: Create surgery field options**

Write `frontend/src/forms/surgery/fieldOptions.ts`:

```ts
export const WARD_OPTIONS = ['wards.bibwewadi', 'wards.dhankawadi', 'wards.kasba', 'wards.sinhagad'];
export const GENDER_OPTIONS = ['gender.male', 'gender.female'];
export const OCCUPATION_OPTIONS = [
  'occupation.selfEmployed', 'occupation.privateJob', 'occupation.govtJob',
  'occupation.dailyWage', 'occupation.pensioner', 'occupation.unemployed',
  'occupation.student', 'occupation.homemaker', 'occupation.elderly', 'occupation.other',
];
export const YES_NO = ['common.yes', 'common.no'];
export const BODY_PARTS_SECTION = {
  'surgery.section61': ['bodyPart.eye', 'bodyPart.ent', 'bodyPart.dental', 'bodyPart.neck', 'bodyPart.head'],
  'surgery.section62': [],
  'surgery.section63': [],
  'surgery.section64': [],
  'surgery.section65': [],
  'surgery.section66': ['bodyPart.fingers', 'bodyPart.hand', 'bodyPart.wrist', 'bodyPart.elbow', 'bodyPart.foot', 'bodyPart.ankle', 'bodyPart.knee', 'bodyPart.kneeOnly', 'bodyPart.other'],
  'surgery.menstrual': [],
};
export const PROBLEM_TYPES = [
  'problemType.injury', 'problemType.nonInjury', 'problemType.burn',
  'problemType.lump', 'problemType.congenital', 'problemType.acquired',
  'problemType.pus', 'problemType.fracture', 'problemType.nonHealingWound', 'problemType.other',
];
export const INJURY_CAUSES = [
  'cause.none', 'cause.car', 'cause.motorcycle', 'cause.pedestrian',
  'cause.gunshot', 'cause.knife', 'cause.animal', 'cause.fall',
  'cause.fire', 'cause.scald', 'cause.other',
];
export const DURATION_OPTIONS = ['duration.lastMonth', 'duration.lastYear', 'duration.beforeYear'];
export const TREATMENT_PLACES = ['treatmentPlace.uhc', 'treatmentPlace.govtHospital', 'treatmentPlace.privateHospital', 'treatmentPlace.trust', 'treatmentPlace.other'];
export const TREATMENT_TYPES = ['treatmentType.noSurgery', 'treatmentType.majorSurgery', 'treatmentType.minorSurgery', 'treatmentType.medication'];
export const NO_TREATMENT_REASONS = ['noTreatmentReason.noMoney', 'noTreatmentReason.noTransport', 'noTreatmentReason.noTime', 'noTreatmentReason.fear', 'noTreatmentReason.noFacility', 'noTreatmentReason.noNeed', 'noTreatmentReason.other'];
export const IMPACT_OPTIONS = ['impact.none', 'impact.shame', 'impact.cannotWork', 'impact.needsHelpMove', 'impact.needsHelpDaily', 'impact.other'];
export const MENSTRUAL_STATUS = [
  'maritalStatus.married', 'maritalStatus.unmarried', 'surgery.menstrual.notGetting',
  'surgery.menstrual.hysterectomy', 'surgery.menstrual.menopause',
];
export const FAMILY_PLANNING_METHODS = [
  'surgery.fp.pills', 'surgery.fp.injection', 'surgery.fp.condom',
  'surgery.fp.iucd', 'surgery.fp.sterilization', 'surgery.fp.other',
];
export const SF12_Q1 = ['sf12.excellent', 'sf12.veryGood', 'sf12.good', 'sf12.fair', 'sf12.poor'];
export const SF12_Q2_Q3 = ['sf12.yesLimited', 'sf12.yesLimitedLittle', 'sf12.noNotLimited'];
export const SF12_Q4_Q7 = ['sf12.allTime', 'sf12.mostTime', 'sf12.someTime', 'sf12.littleTime', 'sf12.noneTime'];
export const SF12_Q8 = ['sf12.notAtAll', 'sf12.slightly', 'sf12.moderately', 'sf12.quiteALot', 'sf12.extremely'];
export const SF12_Q9_Q12 = ['sf12.allTime', 'sf12.mostTime', 'sf12.someTime', 'sf12.littleTime', 'sf12.noneTime'];
```

- [ ] **Step 2: Create the SurgeryForm component**

Write `frontend/src/forms/surgery/SurgeryForm.tsx` — the complete form with:
- Survey Info section
- Patient Info section
- 7 body-section collapsible cards (6.1–6.7), each with a "has problem?" gateway question and conditional sub-questions hidden when "No"
- Menstrual & Reproductive Health section (conditional on gender)
- BP, Diabetes & Addiction section
- SF-12 quality-of-life section (12 questions)
- Follow-up section
- Progress bar, validation, submission

- [ ] **Step 3: Create the surgery route page**

Write `frontend/app/(tabs)/surgery.tsx`:

```tsx
import SurgeryForm from '@/src/forms/surgery/SurgeryForm';
export default function SurgeryPage() { return <SurgeryForm />; }
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/forms/surgery/ frontend/app/(tabs)/surgery.tsx
git commit -m "feat: add surgery survey form"
```

---

### Task 9: Frontend — Navigation, Layout & Language Switcher

**Files:**
- Modify: `frontend/app/_layout.tsx`
- Modify: `frontend/app/(tabs)/_layout.tsx`
- Modify: `frontend/app/(tabs)/index.tsx`
- Delete: `frontend/app/(tabs)/explore.tsx` (replaced by surgery tab)

- [ ] **Step 1: Wrap root layout with I18nProvider**

Edit `frontend/app/_layout.tsx`:

```tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/auth-context';
import { I18nProvider } from '@/src/i18n';

export const unstable_settings = { anchor: '(tabs)' };

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isSignedIn, isLoading } = useAuth();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {isSignedIn ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </>
        ) : (
          <Stack.Screen name="login" options={{ headerShown: false, animationEnabled: false }} />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <I18nProvider>
        <RootLayoutNav />
      </I18nProvider>
    </AuthProvider>
  );
}
```

- [ ] **Step 2: Update tab layout with 3 tabs and language switcher**

Replace `frontend/app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useI18n } from '@/src/i18n';
import { useColorScheme } from '@/hooks/use-color-scheme';

const tabColors = {
  light: { tint: '#D4A017', active: '#D4A017', inactive: '#A1887F' },
  dark: { tint: '#F0C040', active: '#F0C040', inactive: '#9E9E9E' },
};

function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  return (
    <TouchableOpacity
      onPress={() => setLanguage(language === 'en' ? 'mr' : 'en')}
      style={styles.langButton}
    >
      <Text style={styles.langText}>{t('lang.switch')}</Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { t } = useI18n();
  const colorScheme = useColorScheme();
  const colors = tabColors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        headerShown: true,
        headerRight: () => <LanguageSwitcher />,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="household"
        options={{
          title: t('nav.household'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="surgery"
        options={{
          title: t('nav.surgery'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cross.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  langButton: { marginRight: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#FFF3E0' },
  langText: { fontSize: 13, fontWeight: '600', color: '#D4A017' },
});
```

- [ ] **Step 3: Update home screen with form navigation**

Replace `frontend/app/(tabs)/index.tsx`:

```tsx
import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/auth-context';
import { useI18n } from '@/src/i18n';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const colors = Colors.light;

  const handleLogout = () => {
    Alert.alert(t('home.logout'), t('home.logoutConfirm'), [
      { text: t('home.cancel'), style: 'cancel' },
      { text: t('home.logout'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>
          {t('home.welcome', { name: user?.name || '' })}
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
          {t('home.welcomeSubtitle')}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('home.forms')}</Text>
        <TouchableOpacity
          style={[styles.formButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
          onPress={() => router.push('/household')}
        >
          <Text style={[styles.formButtonTitle, { color: colors.primary }]}>{t('nav.household')}</Text>
          <Text style={[styles.formButtonDesc, { color: colors.textSecondary }]}>{t('home.householdDesc')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.formButton, { backgroundColor: colors.accent + '15', borderColor: colors.accent, marginTop: 12 }]}
          onPress={() => router.push('/surgery')}
        >
          <Text style={[styles.formButtonTitle, { color: colors.accent }]}>{t('nav.surgery')}</Text>
          <Text style={[styles.formButtonDesc, { color: colors.textSecondary }]}>{t('home.surgeryDesc')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t('home.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  welcomeSection: { marginBottom: 30, paddingVertical: 20 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 14 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  formButton: { borderWidth: 1, borderRadius: 10, padding: 16 },
  formButtonTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  formButtonDesc: { fontSize: 13, lineHeight: 18 },
  logoutButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
```

- [ ] **Step 4: Remove explore page**

```bash
rm frontend/app/\(tabs\)/explore.tsx
```

- [ ] **Step 5: Verify TypeScript compilation**

Run: `cd frontend && npx tsc --noEmit`

Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add frontend/app/_layout.tsx frontend/app/(tabs)/
git commit -m "feat: update navigation with forms and language switcher"
```

---

### Task 10: Verify and Test End-to-End

- [ ] **Step 1: Start backend**

```bash
cd backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload
```

- [ ] **Step 2: Verify API endpoints with curl/PowerShell**

```powershell
Invoke-RestMethod -Uri http://localhost:8000/health -Method GET
```

Expected: `{"status":"ok","message":"Backend is running!"}`

- [ ] **Step 3: Verify form endpoints load (schema validation)**

```powershell
Invoke-RestMethod -Uri http://localhost:8000/docs -Method GET
```

Expected: Swagger UI loads — verify household and surgery form endpoints appear

- [ ] **Step 4: Start ngrok**

```bash
ngrok http 8000
```

- [ ] **Step 5: Update frontend .env with ngrok URL**

Edit `frontend/.env`:
```
EXPO_PUBLIC_API_URL=https://<your-ngrok-url>.ngrok-free.dev
```

- [ ] **Step 6: Start Expo**

```bash
cd frontend
npm start
```

- [ ] **Step 7: Scan QR with Expo Go on Android → test login → fill and submit both forms**

- [ ] **Step 8: Verify data in Google Sheets**

Open the Google Sheet and verify `household_surveys` and `surgery_surveys` worksheets have the submitted data with user_id populated.
