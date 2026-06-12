from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime

class PaymentBase(BaseModel):
    member_id: int
    amount: Decimal = Field(..., gt=0)
    payment_method: Optional[str] = Field(None, max_length=100)
    payment_date: date
    status: str = "Paid" # Paid, Pending, Failed

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    member_id: Optional[int] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    payment_method: Optional[str] = Field(None, max_length=100)
    payment_date: Optional[date] = None
    status: Optional[str] = None

class PaymentResponse(PaymentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    member_name: Optional[str] = None

    class Config:
        from_attributes = True

class PaymentDashboardStats(BaseModel):
    total_revenue: Decimal
    pending_payments_count: int
    recent_transactions: List[PaymentResponse]
