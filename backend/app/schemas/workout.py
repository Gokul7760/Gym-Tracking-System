from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WorkoutBase(BaseModel):
    member_id: int
    trainer_id: Optional[int] = None
    workout_name: str = Field(..., max_length=255)
    exercise: str = Field(..., max_length=255)
    sets: int = Field(3, ge=1)
    reps: int = Field(10, ge=1)
    duration: int = Field(30, ge=1, description="Duration in minutes")

class WorkoutCreate(WorkoutBase):
    pass

class WorkoutUpdate(BaseModel):
    member_id: Optional[int] = None
    trainer_id: Optional[int] = None
    workout_name: Optional[str] = Field(None, max_length=255)
    exercise: Optional[str] = Field(None, max_length=255)
    sets: Optional[int] = Field(None, ge=1)
    reps: Optional[int] = Field(None, ge=1)
    duration: Optional[int] = Field(None, ge=1)

class WorkoutResponse(WorkoutBase):
    id: int
    created_at: datetime
    updated_at: datetime
    member_name: Optional[str] = None
    trainer_name: Optional[str] = None

    class Config:
        from_attributes = True
        
# For workout dashboard stats
class WorkoutDashboardStats(BaseModel):
    total_workouts: int
    active_workouts_today: int
