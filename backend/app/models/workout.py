from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    trainer_id = Column(Integer, ForeignKey("trainers.id", ondelete="SET NULL"), nullable=True)
    workout_name = Column(String(255), nullable=False)
    exercise = Column(String(255), nullable=False)
    sets = Column(Integer, default=3, nullable=False)
    reps = Column(Integer, default=10, nullable=False)
    duration = Column(Integer, default=30, nullable=False) # in minutes
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    member = relationship("Member", backref="workouts")
    trainer = relationship("Trainer", backref="workouts")
