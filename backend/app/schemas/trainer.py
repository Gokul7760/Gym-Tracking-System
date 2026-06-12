from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime

class TrainerBase(BaseModel):
    name: str = Field(..., max_length=255)
    specialization: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = None
    email: EmailStr
    salary: Optional[Decimal] = Field(None, ge=0)
    experience: Optional[int] = Field(None, ge=0)
    status: str = "Active" # Active, Inactive

class TrainerCreate(TrainerBase):
    user_id: Optional[int] = None

class TrainerUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    specialization: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    salary: Optional[Decimal] = Field(None, ge=0)
    experience: Optional[int] = Field(None, ge=0)
    status: Optional[str] = None
    user_id: Optional[int] = None

class TrainerResponse(TrainerBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
