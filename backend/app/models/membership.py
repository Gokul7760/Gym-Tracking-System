from sqlalchemy import Column, Integer, String, DECIMAL, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Membership(Base):
    __tablename__ = "memberships"

    id = Column(Integer, primary_key=True, index=True)
    plan_name = Column(String(100), unique=True, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    duration = Column(Integer, nullable=False)  # Duration in months
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
