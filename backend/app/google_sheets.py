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
            'id', 'created_at', 'survey_location', 'surveyor_name',
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
            'id', 'created_at', 'survey_location', 'surveyor_name',
            'interview_date', 'house_address', 'patient_name', 'ward',
            'ward_code', 'house_code_uhi', 'patient_code', 'colony_name',
            'mobile_number', 'age', 'gender', 'education', 'occupation',
            'occupation_other', 'body_sections', 'menstrual_info',
            'pregnancy_history', 'family_planning', 'has_bp',
            'bp_reading', 'has_diabetes', 'blood_sugar_level', 'tobacco_use',
            'alcohol_use', 'other_addictions', 'sf12_answers',
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

    def append_form_data(self, worksheet_name: str, data: Dict[str, Any]) -> Optional[str]:
        try:
            ws = self._get_or_create_worksheet(worksheet_name, [])
            records = ws.get_all_records()
            next_id = len(records) + 1

            row = {
                'id': str(next_id),
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
