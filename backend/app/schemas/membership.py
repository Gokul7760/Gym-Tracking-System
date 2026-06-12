from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime

class MembershipBase(BaseModel):
    plan_name: str = Field(..., max_length=100)
    price: Decimal = Field(..., gt=0)
    duration: int = Field(..., gt=0, description="Duration in months")
    description: Optional[str] = None

class MembershipCreate(MembershipBase):
    pass

class MembershipUpdate(BaseModel):
    plan_name: Optional[str] = Field(None, max_length=100)
    price: Optional[Decimal] = Field(None, gt=0)
    duration: Optional[int] = Field(None, gt=0)
    description: Optional[str] = None

class MembershipResponse(MembershipBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
