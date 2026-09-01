from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, date

# ============ Authentication Schemas ============

class User(BaseModel):
    """User model"""
    id: str
    name: str
    phone: str


class LoginRequest(BaseModel):
    """Request body for user login"""
    phone: str = Field(..., description="User's phone number", min_length=10)


class LoginResponse(BaseModel):
    """Response body for successful login"""
    success: bool
    message: str
    token: str
    refresh_token: str
    user: User


class VerifyTokenRequest(BaseModel):
    """Request to verify token"""
    token: str = Field(..., description="JWT token")


class TokenPayload(BaseModel):
    """JWT token payload"""
    user_id: str
    phone: str
    name: str


class RefreshTokenRequest(BaseModel):
    """Request to refresh an access token"""
    refresh_token: str = Field(..., description="Refresh JWT token")


class RefreshTokenResponse(BaseModel):
    """Response for token refresh"""
    success: bool
    token: str
    refresh_token: str


class ErrorResponse(BaseModel):
    """Generic error response"""
    success: bool = False
    message: str
    details: Optional[dict] = None


# ============ Legacy Schemas (for reference) ============

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    message: str

class HelloResponse(BaseModel):
    """Hello endpoint response"""
    message: str
    status: str


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
    family_members_json: str = Field(..., max_length=10000)  # JSON string
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
