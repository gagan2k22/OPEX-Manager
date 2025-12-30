"""
backend/app/utils/security.py
Security utilities and configurations
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import secrets
import string

from app.database import get_db
from app.models.schemas import User
from app.utils.config import settings
from app.utils.logger import logger

# Security scheme
security = HTTPBearer()

class SecurityConfig:
    """Security configuration constants"""
    
    # JWT Settings
    JWT_ALGORITHM = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 120  # 2 hours (reduced from 24)
    JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7
    
    # Password Requirements
    MIN_PASSWORD_LENGTH = 8
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGIT = True
    REQUIRE_SPECIAL_CHAR = True
    
    # Rate Limiting
    LOGIN_MAX_ATTEMPTS = 5
    LOGIN_WINDOW_MINUTES = 15
    API_MAX_REQUESTS = 100
    API_WINDOW_MINUTES = 1
    
    # File Upload
    MAX_FILE_SIZE_MB = 10
    ALLOWED_EXTENSIONS = {'.xlsx', '.xls', '.csv'}

def generate_strong_password(length: int = 16) -> str:
    """
    Generate a cryptographically strong random password
    
    Args:
        length: Password length (minimum 12)
        
    Returns:
        Strong random password
    """
    if length < 12:
        length = 12
    
    alphabet = string.ascii_letters + string.digits + string.punctuation
    
    # Ensure at least one of each required character type
    password = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice(string.punctuation),
    ]
    
    # Fill the rest randomly
    password += [secrets.choice(alphabet) for _ in range(length - 4)]
    
    # Shuffle to avoid predictable pattern
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password meets security requirements
    
    Returns:
        (is_valid, error_message)
    """
    if len(password) < SecurityConfig.MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {SecurityConfig.MIN_PASSWORD_LENGTH} characters"
    
    if SecurityConfig.REQUIRE_UPPERCASE and not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if SecurityConfig.REQUIRE_LOWERCASE and not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if SecurityConfig.REQUIRE_DIGIT and not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    
    if SecurityConfig.REQUIRE_SPECIAL_CHAR and not any(c in string.punctuation for c in password):
        return False, "Password must contain at least one special character"
    
    return True, ""

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    
    Args:
        data: Data to encode in token
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=SecurityConfig.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET, 
        algorithm=SecurityConfig.JWT_ALGORITHM
    )
    
    return encoded_jwt

def verify_token(token: str) -> dict:
    """
    Verify and decode JWT token
    
    Args:
        token: JWT token to verify
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[SecurityConfig.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.warning(f"Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer credentials
        db: Database session
        
    Returns:
        Current user object
        
    Raises:
        HTTPException: If authentication fails
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id = payload.get("id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Require user to have Admin role
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user if admin
        
    Raises:
        HTTPException: If user is not admin
    """
    roles = [role.name for role in current_user.roles]
    if "Admin" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent directory traversal attacks
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    import os
    import re
    
    # Get just the filename, no path
    filename = os.path.basename(filename)
    
    # Remove any non-alphanumeric characters except dots, dashes, underscores
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    
    # Prevent hidden files
    if filename.startswith('.'):
        filename = '_' + filename[1:]
    
    return filename

class CSRFProtection:
    """
    Simple CSRF token generation and validation
    For production, use a proper CSRF library
    """
    
    @staticmethod
    def generate_token() -> str:
        """Generate CSRF token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_token(token: str, expected: str) -> bool:
        """Validate CSRF token using constant-time comparison"""
        return secrets.compare_digest(token, expected)
