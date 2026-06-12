from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.membership import Membership
from app.schemas.membership import MembershipCreate, MembershipUpdate, MembershipResponse
from app.api.v1.endpoints.auth import require_role

router = APIRouter()

@router.get("/", response_model=List[MembershipResponse])
def get_memberships(db: Session = Depends(get_db)):
    return db.query(Membership).all()

@router.get("/{id}", response_model=MembershipResponse)
def get_membership(id: int, db: Session = Depends(get_db)):
    membership = db.query(Membership).filter(Membership.id == id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    return membership

@router.post("/", response_model=MembershipResponse, dependencies=[Depends(require_role(["Admin"]))])
def create_membership(membership_in: MembershipCreate, db: Session = Depends(get_db)):
    db_membership = db.query(Membership).filter(Membership.plan_name == membership_in.plan_name).first()
    if db_membership:
        raise HTTPException(status_code=400, detail="Plan name already exists")
    
    membership = Membership(**membership_in.model_dump())
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership

@router.put("/{id}", response_model=MembershipResponse, dependencies=[Depends(require_role(["Admin"]))])
def update_membership(id: int, membership_in: MembershipUpdate, db: Session = Depends(get_db)):
    membership = db.query(Membership).filter(Membership.id == id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    
    update_data = membership_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(membership, field, value)
        
    db.commit()
    db.refresh(membership)
    return membership

@router.delete("/{id}", dependencies=[Depends(require_role(["Admin"]))])
def delete_membership(id: int, db: Session = Depends(get_db)):
    membership = db.query(Membership).filter(Membership.id == id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    
    db.delete(membership)
    db.commit()
    return {"message": "Membership plan deleted successfully"}
