"""
backend/app/utils/validations.py
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    roles: List[str]
    isAdmin: bool

class LoginResponse(BaseModel):
    status: str
    token: str
    data: dict # user object

class BudgetUpdate(BaseModel):
    uid: Optional[str] = None
    parent_uid: Optional[str] = None
    vendor: Optional[str] = None
    service: Optional[str] = None   # mapped to description in some contexts? No, description is separate?
    description: Optional[str] = None
    tower: Optional[str] = None
    budget_head: Optional[str] = None
    contract: Optional[str] = None
    po_entity: Optional[str] = None
    allocation_basis: Optional[str] = None
    initiative_type: Optional[str] = None
    service_type: Optional[str] = None
    currency: Optional[str] = None
    service_start_date: Optional[str] = None # Using string for date input
    service_end_date: Optional[str] = None
    renewal_month: Optional[str] = None
    budget: Optional[float] = None
    actuals: Optional[float] = None
    remarks: Optional[str] = None

class BudgetCreate(BudgetUpdate):
    # Enforce required fields if necessary, currently sticking to Optional to matching existing style
    uid: str
    vendor: str
    description: str

