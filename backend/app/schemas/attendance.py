from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime

class AttendanceBase(BaseModel):
    member_id: int
    date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: str = "Present" # Present, Absent, Late

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    member_id: Optional[int] = None
    date: Optional[date] = None
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    member_name: Optional[str] = None  # Helper to display member's name

    class Config:
        from_attributes = True
        # Allow time to serialize as string
        json_encoders = {
            time: lambda v: v.strftime("%H:%M:%S") if v else None
        }
