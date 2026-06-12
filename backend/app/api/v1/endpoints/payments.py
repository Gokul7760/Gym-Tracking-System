from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from decimal import Decimal
from app.core.database import get_db
from app.models.payment import Payment
from app.models.member import Member
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from app.api.v1.endpoints.auth import require_role

router = APIRouter()

def get_payment_response_with_name(p: Payment, db: Session) -> PaymentResponse:
    member = db.query(Member).filter(Member.id == p.member_id).first()
    name = f"{member.first_name} {member.last_name}" if member else "Unknown Member"
    res = PaymentResponse.model_validate(p)
    res.member_name = name
    return res

@router.get("/", response_model=List[PaymentResponse])
def get_payments(
    db: Session = Depends(get_db),
    member_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None)
):
    query = db.query(Payment)
    if member_id:
        query = query.filter(Payment.member_id == member_id)
    if status:
        query = query.filter(Payment.status == status)
        
    payments = query.all()
    return [get_payment_response_with_name(p, db) for p in payments]

@router.get("/pending", response_model=List[PaymentResponse])
def get_pending_payments(db: Session = Depends(get_db)):
    payments = db.query(Payment).filter(Payment.status == "Pending").all()
    return [get_payment_response_with_name(p, db) for p in payments]

@router.post("/", response_model=PaymentResponse, dependencies=[Depends(require_role(["Admin"]))])
def create_payment(payment_in: PaymentCreate, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == payment_in.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    payment = Payment(**payment_in.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return get_payment_response_with_name(payment, db)

@router.put("/{id}", response_model=PaymentResponse, dependencies=[Depends(require_role(["Admin"]))])
def update_payment(id: int, payment_in: PaymentUpdate, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
        
    if payment_in.member_id:
        member = db.query(Member).filter(Member.id == payment_in.member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
            
    update_data = payment_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(payment, field, value)
        
    db.commit()
    db.refresh(payment)
    return get_payment_response_with_name(payment, db)

@router.delete("/{id}", dependencies=[Depends(require_role(["Admin"]))])
def delete_payment(id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
        
    db.delete(payment)
    db.commit()
    return {"message": "Payment record deleted successfully"}

@router.get("/dashboard-stats")
def get_payment_stats(db: Session = Depends(get_db)):
    # Total Revenue (Paid)
    total_rev = db.query(func.sum(Payment.amount)).filter(Payment.status == "Paid").scalar() or 0.0
    pending_count = db.query(Payment).filter(Payment.status == "Pending").count()
    
    return {
        "total_revenue": float(total_rev),
        "pending_payments_count": pending_count
    }
