from sqlalchemy import Column, Integer, String, Date, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    dob = Column(Date, nullable=True)
    address = Column(Text, nullable=True)
    membership_plan_id = Column(Integer, ForeignKey("memberships.id", ondelete="SET NULL"), nullable=True)
    joining_date = Column(Date, nullable=False)
    status = Column(String(50), default="New", nullable=False)  # Active, New, Expiring, Inactive
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="member_profile")
    membership_plan = relationship("Membership", backref="members")
