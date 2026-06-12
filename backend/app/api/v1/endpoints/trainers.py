from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.trainer import Trainer
from app.schemas.trainer import TrainerCreate, TrainerUpdate, TrainerResponse
from app.api.v1.endpoints.auth import require_role

router = APIRouter()

@router.get("/", response_model=List[TrainerResponse])
def get_trainers(db: Session = Depends(get_db)):
    return db.query(Trainer).all()

@router.get("/{id}", response_model=TrainerResponse)
def get_trainer(id: int, db: Session = Depends(get_db)):
    trainer = db.query(Trainer).filter(Trainer.id == id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return trainer

@router.post("/", response_model=TrainerResponse, dependencies=[Depends(require_role(["Admin"]))])
def create_trainer(trainer_in: TrainerCreate, db: Session = Depends(get_db)):
    db_trainer = db.query(Trainer).filter(Trainer.email == trainer_in.email).first()
    if db_trainer:
        raise HTTPException(status_code=400, detail="A trainer with this email already exists")
        
    trainer = Trainer(**trainer_in.model_dump())
    db.add(trainer)
    db.commit()
    db.refresh(trainer)
    return trainer

@router.put("/{id}", response_model=TrainerResponse, dependencies=[Depends(require_role(["Admin"]))])
def update_trainer(id: int, trainer_in: TrainerUpdate, db: Session = Depends(get_db)):
    trainer = db.query(Trainer).filter(Trainer.id == id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
        
    update_data = trainer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trainer, field, value)
        
    db.commit()
    db.refresh(trainer)
    return trainer

@router.delete("/{id}", dependencies=[Depends(require_role(["Admin"]))])
def delete_trainer(id: int, db: Session = Depends(get_db)):
    trainer = db.query(Trainer).filter(Trainer.id == id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
        
    db.delete(trainer)
    db.commit()
    return {"message": "Trainer deleted successfully"}
