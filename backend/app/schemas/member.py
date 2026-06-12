from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from app.schemas.membership import MembershipResponse

class MemberBase(BaseModel):
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[date] = None
    address: Optional[str] = None
    membership_plan_id: Optional[int] = None
    joining_date: date
    status: str = "New" # Active, New, Expiring, Inactive

class MemberCreate(MemberBase):
    user_id: Optional[int] = None

class MemberUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[date] = None
    address: Optional[str] = None
    membership_plan_id: Optional[int] = None
    joining_date: Optional[date] = None
    status: Optional[str] = None
    user_id: Optional[int] = None

class MemberResponse(MemberBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    membership_plan: Optional[MembershipResponse] = None

    class Config:
        from_attributes = True

class MemberListResponse(BaseModel):
    items: List[MemberResponse]
    total: int
    page: int
    size: int
    pages: int
