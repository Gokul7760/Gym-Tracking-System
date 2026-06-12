from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List, Optional
from datetime import date, datetime
from app.core.database import get_db
from app.models.attendance import Attendance
from app.models.member import Member
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceResponse
from app.api.v1.endpoints.auth import require_role

router = APIRouter()

@router.get("/", response_model=List[AttendanceResponse])
def get_all_attendance(
    db: Session = Depends(get_db),
    member_id: Optional[int] = Query(None),
    date_val: Optional[date] = Query(None)
):
    query = db.query(Attendance)
    if member_id:
        query = query.filter(Attendance.member_id == member_id)
    if date_val:
        query = query.filter(Attendance.date == date_val)
        
    records = query.all()
    # Add member_name manually
    res = []
    for r in records:
        member = db.query(Member).filter(Member.id == r.member_id).first()
        name = f"{member.first_name} {member.last_name}" if member else "Unknown"
        item = AttendanceResponse.model_validate(r)
        item.member_name = name
        res.append(item)
    return res

@router.post("/", response_model=AttendanceResponse, dependencies=[Depends(require_role(["Admin", "Trainer"]))])
def mark_attendance(attendance_in: AttendanceCreate, db: Session = Depends(get_db)):
    # Check if member exists
    member = db.query(Member).filter(Member.id == attendance_in.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    # Check if record already exists for this member on this date (upsert logic)
    record = db.query(Attendance).filter(
        Attendance.member_id == attendance_in.member_id,
        Attendance.date == attendance_in.date
    ).first()
    
    if record:
        # Update existing record
        for field, value in attendance_in.model_dump(exclude_unset=True).items():
            setattr(record, field, value)
    else:
        # Create new record
        record = Attendance(**attendance_in.model_dump())
        db.add(record)
        
    db.commit()
    db.refresh(record)
    
    name = f"{member.first_name} {member.last_name}"
    res = AttendanceResponse.model_validate(record)
    res.member_name = name
    return res

@router.get("/daily", response_model=List[AttendanceResponse])
def get_daily_report(date_val: date = Query(default=date.today()), db: Session = Depends(get_db)):
    records = db.query(Attendance).filter(Attendance.date == date_val).all()
    res = []
    for r in records:
        member = db.query(Member).filter(Member.id == r.member_id).first()
        name = f"{member.first_name} {member.last_name}" if member else "Unknown"
        item = AttendanceResponse.model_validate(r)
        item.member_name = name
        res.append(item)
    return res

@router.get("/monthly", response_model=List[AttendanceResponse])
def get_monthly_report(
    member_id: int,
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    db: Session = Depends(get_db)
):
    records = db.query(Attendance).filter(
        Attendance.member_id == member_id,
        extract("month", Attendance.date) == month,
        extract("year", Attendance.date) == year
    ).all()
    
    member = db.query(Member).filter(Member.id == member_id).first()
    name = f"{member.first_name} {member.last_name}" if member else "Unknown"
    
    res = []
    for r in records:
        item = AttendanceResponse.model_validate(r)
        item.member_name = name
        res.append(item)
    return res
