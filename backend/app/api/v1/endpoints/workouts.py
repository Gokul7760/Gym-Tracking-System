from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.workout import Workout
from app.models.member import Member
from app.models.trainer import Trainer
from app.schemas.workout import WorkoutCreate, WorkoutUpdate, WorkoutResponse
from app.api.v1.endpoints.auth import require_role

router = APIRouter()

def get_workout_response_with_names(w: Workout, db: Session) -> WorkoutResponse:
    member = db.query(Member).filter(Member.id == w.member_id).first()
    trainer = db.query(Trainer).filter(Trainer.id == w.trainer_id).first() if w.trainer_id else None
    
    m_name = f"{member.first_name} {member.last_name}" if member else "Unknown Member"
    t_name = trainer.name if trainer else "None Assigned"
    
    res = WorkoutResponse.model_validate(w)
    res.member_name = m_name
    res.trainer_name = t_name
    return res

@router.get("/", response_model=List[WorkoutResponse])
def get_workouts(
    db: Session = Depends(get_db),
    member_id: Optional[int] = Query(None),
    trainer_id: Optional[int] = Query(None)
):
    query = db.query(Workout)
    if member_id:
        query = query.filter(Workout.member_id == member_id)
    if trainer_id:
        query = query.filter(Workout.trainer_id == trainer_id)
        
    workouts = query.all()
    return [get_workout_response_with_names(w, db) for w in workouts]

@router.get("/{id}", response_model=WorkoutResponse)
def get_workout(id: int, db: Session = Depends(get_db)):
    workout = db.query(Workout).filter(Workout.id == id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return get_workout_response_with_names(workout, db)

@router.post("/", response_model=WorkoutResponse, dependencies=[Depends(require_role(["Admin", "Trainer"]))])
def create_workout(workout_in: WorkoutCreate, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == workout_in.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    if workout_in.trainer_id:
        trainer = db.query(Trainer).filter(Trainer.id == workout_in.trainer_id).first()
        if not trainer:
            raise HTTPException(status_code=404, detail="Trainer not found")
            
    workout = Workout(**workout_in.model_dump())
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return get_workout_response_with_names(workout, db)

@router.put("/{id}", response_model=WorkoutResponse, dependencies=[Depends(require_role(["Admin", "Trainer"]))])
def update_workout(id: int, workout_in: WorkoutUpdate, db: Session = Depends(get_db)):
    workout = db.query(Workout).filter(Workout.id == id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
        
    if workout_in.member_id:
        member = db.query(Member).filter(Member.id == workout_in.member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
            
    if workout_in.trainer_id:
        trainer = db.query(Trainer).filter(Trainer.id == workout_in.trainer_id).first()
        if not trainer:
            raise HTTPException(status_code=404, detail="Trainer not found")
            
    update_data = workout_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workout, field, value)
        
    db.commit()
    db.refresh(workout)
    return get_workout_response_with_names(workout, db)

@router.delete("/{id}", dependencies=[Depends(require_role(["Admin", "Trainer"]))])
def delete_workout(id: int, db: Session = Depends(get_db)):
    workout = db.query(Workout).filter(Workout.id == id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
        
    db.delete(workout)
    db.commit()
    return {"message": "Workout plan deleted successfully"}
