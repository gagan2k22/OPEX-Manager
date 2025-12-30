"""
backend/app/routers/users.py
User management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import bcrypt

from app.database import get_db
from app.models.schemas import User, Role, UserRole
from app.utils.security import get_current_user, require_admin, validate_password_strength
from app.utils.logger import logger
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional

router = APIRouter()

# Pydantic models for request/response
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=1)
    roles: List[str] = Field(default=["Viewer"])
    is_active: bool = Field(default=True)
    
    model_config = ConfigDict(str_strip_whitespace=True)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=1)
    roles: Optional[List[str]] = None
    is_active: Optional[bool] = None
    
    model_config = ConfigDict(str_strip_whitespace=True)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    roles: List[str]
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)

@router.get("/users")
async def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all users (Admin only)"""
    users = db.query(User).all()
    
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "roles": [role.name for role in user.roles],
            "is_active": user.is_active
        })
    
    return result

@router.post("/users")
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new user (Admin only)"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    # Validate password strength
    is_valid, error_msg = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Hash password
    hashed_password = bcrypt.hashpw(
        user_data.password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')
    
    # Create user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        is_active=user_data.is_active
    )
    db.add(new_user)
    db.flush()  # Get the user ID
    
    # Assign roles
    for role_name in user_data.roles:
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            # Create role if it doesn't exist
            role = Role(name=role_name)
            db.add(role)
            db.flush()
        
        new_user.roles.append(role)
    
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"User created: {new_user.email} by {current_user.email}")
    
    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "roles": [role.name for role in new_user.roles],
        "is_active": new_user.is_active
    }

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a user (Admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update basic fields
    if user_data.name is not None:
        user.name = user_data.name
    if user_data.email is not None:
        # Check if email is already taken by another user
        existing = db.query(User).filter(
            User.email == user_data.email,
            User.id != user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already in use by another user"
            )
        user.email = user_data.email
    if user_data.password is not None and user_data.password != "":
        # Validate password strength
        is_valid, error_msg = validate_password_strength(user_data.password)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Hash new password
        hashed_password = bcrypt.hashpw(
            user_data.password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
        user.password_hash = hashed_password
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    # Update roles
    if user_data.roles is not None:
        # Clear existing roles
        user.roles.clear()
        
        # Add new roles
        for role_name in user_data.roles:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                # Create role if it doesn't exist
                role = Role(name=role_name)
                db.add(role)
                db.flush()
            user.roles.append(role)
    
    db.commit()
    db.refresh(user)
    
    logger.info(f"User updated: {user.email} by {current_user.email}")
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "roles": [role.name for role in user.roles],
        "is_active": user.is_active
    }

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a user (Admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete your own account"
        )
    
    # Prevent deleting the last admin
    admin_role = db.query(Role).filter(Role.name == "Admin").first()
    if admin_role and admin_role in user.roles:
        admin_count = db.query(User).join(User.roles).filter(Role.name == "Admin").count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the last admin user"
            )
    
    email = user.email
    db.delete(user)
    db.commit()
    
    logger.info(f"User deleted: {email} by {current_user.email}")
    
    return {"message": "User deleted successfully"}
