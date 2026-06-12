from fastapi import APIRouter
from app.api.v1.endpoints import auth, members, trainers, memberships, attendance, workouts, payments, dashboard

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(members.router, prefix="/members", tags=["Members"])
api_router.include_router(trainers.router, prefix="/trainers", tags=["Trainers"])
api_router.include_router(memberships.router, prefix="/memberships", tags=["Memberships"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(workouts.router, prefix="/workouts", tags=["Workouts"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
