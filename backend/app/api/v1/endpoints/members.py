from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional
import math
from app.core.database import get_db
from app.models.member import Member
from app.models.membership import Membership
from app.schemas.member import MemberCreate, MemberUpdate, MemberResponse, MemberListResponse
from app.api.v1.endpoints.auth import require_role

router = APIRouter()

@router.get("/", response_model=MemberListResponse)
def get_members(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None)
):
    query = db.query(Member)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Member.first_name.ilike(search_pattern),
                Member.last_name.ilike(search_pattern),
                Member.email.ilike(search_pattern),
                Member.phone.ilike(search_pattern),
                Member.status.ilike(search_pattern)
            )
        )
        
    total = query.count()
    pages = math.ceil(total / size) if total > 0 else 0
    items = query.offset((page - 1) * size).limit(size).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@router.get("/{id}", response_model=MemberResponse)
def get_member(id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.post("/", response_model=MemberResponse, dependencies=[Depends(require_role(["Admin", "Trainer"]))])
def create_member(member_in: MemberCreate, db: Session = Depends(get_db)):
    db_member = db.query(Member).filter(Member.email == member_in.email).first()
    if db_member:
        raise HTTPException(status_code=400, detail="A member with this email already exists")
        
    if member_in.membership_plan_id:
        membership = db.query(Membership).filter(Membership.id == member_in.membership_plan_id).first()
        if not membership:
            raise HTTPException(status_code=404, detail="Membership plan not found")
            
    member_data = member_in.model_dump()
    member = Member(**member_data)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@router.put("/{id}", response_model=MemberResponse, dependencies=[Depends(require_role(["Admin", "Trainer"]))])
def update_member(id: int, member_in: MemberUpdate, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    if member_in.membership_plan_id:
        membership = db.query(Membership).filter(Membership.id == member_in.membership_plan_id).first()
        if not membership:
            raise HTTPException(status_code=404, detail="Membership plan not found")
            
    update_data = member_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)
        
    db.commit()
    db.refresh(member)
    return member

@router.delete("/{id}", dependencies=[Depends(require_role(["Admin"]))])
def delete_member(id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    db.delete(member)
    db.commit()
    return {"message": "Member deleted successfully"}
