"""
Data Models
"""

from pydantic import BaseModel, Field
from typing import Optional


class User(BaseModel):
    """User model"""
    id: str
    name: str
    phone: str


class LoginPayload(BaseModel):
    """Login request payload"""
    phone: str = Field(..., min_length=10, description="User's phone number")


class AuthToken(BaseModel):
    """Authentication token response"""
    access_token: str
    token_type: str = "bearer"
    user: User
