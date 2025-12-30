"""
backend/app/routers/auth.py
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt, JWTError
import bcrypt

from app.database import get_db
from app.models.schemas import User
from app.utils.config import settings
from app.utils.validations import LoginRequest, LoginResponse
from app.utils.logger import logger
from app.middleware.rate_limiter import login_rate_limit

router = APIRouter()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

@router.post("/login")
async def login(
    request: LoginRequest, 
    db: Session = Depends(get_db),
    _rate_limit: bool = Depends(login_rate_limit)
):
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        # Generic error - don't reveal if email exists
        logger.warning(f"Login attempt failed for: {request.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not bcrypt.checkpw(request.password.encode('utf-8'), user.password_hash.encode('utf-8')):
        # Generic error - don't reveal which part failed
        logger.warning(f"Login attempt failed for: {request.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create token
    roles = [role.name for role in user.roles]
    access_token = create_access_token({"id": user.id, "email": user.email, "roles": roles})
    
    logger.info(f"User logged in: {user.email}")
    
    return {
        "token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "roles": roles,
            "isAdmin": "Admin" in roles
        }
    }
