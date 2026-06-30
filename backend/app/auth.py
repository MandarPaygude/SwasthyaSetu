"""
Authentication Module
Handles JWT token generation and validation for user authentication
"""

import jwt
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class TokenManager:
    """Manages JWT token generation and validation"""
    
    REFRESH_TOKEN_EXPIRY_DAYS = 30
    
    def __init__(self):
        """Initialize token manager with secret key"""
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
        self.algorithm = 'HS256'
        self.token_expiry_hours = int(os.getenv('JWT_EXPIRY_HOURS', 1))
    
    def generate_token(self, user_id: str, phone: str, name: str) -> str:
        """Generate short-lived access JWT token"""
        try:
            payload = {
                'user_id': user_id,
                'phone': phone,
                'name': name,
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=self.token_expiry_hours),
                'type': 'access'
            }
            return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        except Exception:
            raise
    
    def generate_refresh_token(self, user_id: str, phone: str, name: str) -> str:
        """Generate long-lived refresh JWT token (30 days)"""
        try:
            payload = {
                'user_id': user_id,
                'phone': phone,
                'name': name,
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(days=self.REFRESH_TOKEN_EXPIRY_DAYS),
                'type': 'refresh'
            }
            return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        except Exception:
            raise
    
    def refresh_access_token(self, refresh_token: str) -> Optional[Dict[str, str]]:
        """Validate refresh token and issue a new access + refresh pair"""
        try:
            payload = jwt.decode(refresh_token, self.secret_key, algorithms=[self.algorithm])
            if payload.get('type') != 'refresh':
                return None
            new_access = self.generate_token(
                user_id=payload['user_id'],
                phone=payload['phone'],
                name=payload['name']
            )
            new_refresh = self.generate_refresh_token(
                user_id=payload['user_id'],
                phone=payload['phone'],
                name=payload['name']
            )
            return {'token': new_access, 'refresh_token': new_refresh}
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return None
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode an access JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
        except Exception:
            return None


# Create a singleton instance
_token_manager = None

def get_token_manager() -> TokenManager:
    """Get or create the token manager instance"""
    global _token_manager
    if _token_manager is None:
        _token_manager = TokenManager()
    return _token_manager
