from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from app.schemas import LoginRequest, LoginResponse, User, VerifyTokenRequest, RefreshTokenRequest, RefreshTokenResponse, HouseholdFormData, SurgeryFormData, FormSubmitResponse
import json
from app.google_sheets import get_sheets_manager
from app.auth import get_token_manager

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Sevadham App API",
    description="Backend API for Sevadham Android App - Using Google Sheets",
    version="1.0.0"
)

# Configure CORS - Allow all origins for development
# In production, specify exact origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Health Check Endpoints ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={"status": "ok", "message": "Backend is running!"}
    )

# ============ Authentication Endpoints ============

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    User login with phone number
    
    - Check if user exists in Google Sheets
    - Generate JWT token
    - Return user data and token
    """
    try:
        phone = request.phone.strip()
        
        # Get Google Sheets manager
        sheets_manager = get_sheets_manager()
        
        # Check if user exists in Google Sheets
        user_data = sheets_manager.get_user_by_phone(phone)
        
        if not user_data:
            raise HTTPException(
                status_code=401,
                detail="User not found. Phone number does not exist in our database."
            )
        
        # Get token manager
        token_manager = get_token_manager()
        
        # Generate JWT access + refresh tokens
        token = token_manager.generate_token(
            user_id=str(user_data['id']),
            phone=user_data['phone'],
            name=user_data['name']
        )
        refresh_token = token_manager.generate_refresh_token(
            user_id=str(user_data['id']),
            phone=user_data['phone'],
            name=user_data['name']
        )
        
        # Return response
        return LoginResponse(
            success=True,
            message=f"Login successful! Welcome {user_data['name']}",
            token=token,
            refresh_token=refresh_token,
            user=User(
                id=str(user_data['id']),
                name=user_data['name'],
                phone=user_data['phone']
            )
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during login: {str(e)}"
        )


@app.post("/api/auth/verify-token")
async def verify_token(request: VerifyTokenRequest):
    """
    Verify JWT token and return user data
    """
    try:
        token_manager = get_token_manager()
        payload = token_manager.verify_token(request.token)
        
        if not payload:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Token is valid",
                "user": {
                    "id": payload.get('user_id'),
                    "name": payload.get('name'),
                    "phone": payload.get('phone')
                }
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error verifying token: {str(e)}"
        )


@app.post("/api/auth/refresh", response_model=RefreshTokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """
    Refresh access token using a valid refresh token
    
    Returns a new access token + refresh token pair.
    The old refresh token is invalidated.
    """
    try:
        token_manager = get_token_manager()
        result = token_manager.refresh_access_token(request.refresh_token)
        
        if not result:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired refresh token. Please login again."
            )
        
        return RefreshTokenResponse(
            success=True,
            token=result['token'],
            refresh_token=result['refresh_token']
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error refreshing token: {str(e)}"
        )


@app.get("/api/auth/me")
async def get_current_user(authorization: str = Header(None)):
    """
    Get current user info using Bearer token
    
    Usage: Include header: Authorization: Bearer <token>
    """
    try:
        if not authorization:
            raise HTTPException(
                status_code=401,
                detail="Missing authorization header"
            )
        
        # Extract token from Bearer scheme
        try:
            scheme, token = authorization.split()
            if scheme.lower() != "bearer":
                raise ValueError("Invalid auth scheme")
        except ValueError:
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization header format. Use: Bearer <token>"
            )
        
        token_manager = get_token_manager()
        payload = token_manager.verify_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "user": {
                    "id": payload.get('user_id'),
                    "name": payload.get('name'),
                    "phone": payload.get('phone')
                }
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching user: {str(e)}"
        )


# ============ Test Endpoints ============

@app.get("/hello")
async def hello():
    """Simple hello world endpoint"""
    return JSONResponse(
        status_code=200,
        content={
            "message": "Hello from Sevadham Backend!",
            "status": "success"
        }
    )


# ============ Form Submission Endpoints ============


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
        submission_id = sheets_manager.append_form_data('household_surveys', data)

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
        submission_id = sheets_manager.append_form_data('surgery_surveys', data)

        return FormSubmitResponse(
            success=True,
            message="Surgery survey submitted successfully",
            id=submission_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting form: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
