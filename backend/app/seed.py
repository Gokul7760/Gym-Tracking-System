import sys
import os
from datetime import date, timedelta, time
from decimal import Decimal

# Add current directory to path so imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.membership import Membership
from app.models.member import Member
from app.models.trainer import Trainer
from app.models.attendance import Attendance
from app.models.workout import Workout
from app.models.payment import Payment

def seed_db():
    print("Seeding database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Clear existing tables (optional, but good for clean seeding)
        print("Cleaning up old data...")
        db.query(Payment).delete()
        db.query(Workout).delete()
        db.query(Attendance).delete()
        db.query(Member).delete()
        db.query(Trainer).delete()
        db.query(Membership).delete()
        db.query(User).delete()
        db.commit()

        # 2. Create Default Users for login
        print("Creating authentication users...")
        users = [
            User(
                email="admin@fitzone.com",
                hashed_password=get_password_hash("admin123"),
                role="Admin"
            ),
            User(
                email="trainer@fitzone.com",
                hashed_password=get_password_hash("trainer123"),
                role="Trainer"
            ),
            User(
                email="member@fitzone.com",
                hashed_password=get_password_hash("member123"),
                role="Member"
            )
        ]
        for u in users:
            db.add(u)
        db.commit()
        
        # Keep track of users
        admin_user = db.query(User).filter(User.role == "Admin").first()
        trainer_user = db.query(User).filter(User.role == "Trainer").first()
        member_user = db.query(User).filter(User.role == "Member").first()

        # 3. Create Memberships
        print("Creating membership plans...")
        plans = [
            Membership(
                plan_name="Basic",
                price=Decimal("999.00"),
                duration=1,
                description="Access to gym floor, locker room, and core cardio equipment."
            ),
            Membership(
                plan_name="Premium",
                price=Decimal("1799.00"),
                duration=3,
                description="Access to all gym zones, group fitness classes, and steam room."
            ),
            Membership(
                plan_name="Elite",
                price=Decimal("2999.00"),
                duration=12,
                description="All-access pass, personal trainer consultation, diet plans, and massage session."
            )
        ]
        for p in plans:
            db.add(p)
        db.commit()
        
        basic_plan = db.query(Membership).filter(Membership.plan_name == "Basic").first()
        premium_plan = db.query(Membership).filter(Membership.plan_name == "Premium").first()
        elite_plan = db.query(Membership).filter(Membership.plan_name == "Elite").first()

        # 4. Create Trainers
        print("Creating trainers...")
        trainers = [
            Trainer(
                name="Rahul Sharma",
                specialization="Strength & Conditioning",
                phone="9876543210",
                email="rahul@fitzone.com",
                salary=Decimal("45000.00"),
                experience=6,
                status="Active",
                user_id=trainer_user.id
            ),
            Trainer(
                name="Ananya Sen",
                specialization="Yoga & Flexibility",
                phone="9876543211",
                email="ananya@fitzone.com",
                salary=Decimal("38000.00"),
                experience=4,
                status="Active"
            ),
            Trainer(
                name="David Miller",
                specialization="Cardio & HIIT",
                phone="9876543212",
                email="david@fitzone.com",
                salary=Decimal("40000.00"),
                experience=5,
                status="Active"
            )
        ]
        # Seed 15 more mock trainers to reach the count of 18 active trainers listed in the dashboard
        for i in range(15):
            trainers.append(
                Trainer(
                    name=f"Trainer {i+1}",
                    specialization="General Fitness",
                    phone=f"987654320{i}",
                    email=f"trainer{i+1}@fitzone.com",
                    salary=Decimal("30000.00"),
                    experience=3,
                    status="Active"
                )
            )
            
        for t in trainers:
            db.add(t)
        db.commit()
        
        main_trainer = db.query(Trainer).filter(Trainer.email == "rahul@fitzone.com").first()

        # 5. Create Members
        print("Creating members...")
        # Add the exact recent members listed in the dashboard specifications
        members_data = [
            {"first": "Arjun", "last": "Sharma", "email": "arjun@gmail.com", "plan": basic_plan, "status": "New", "phone": "9999888877", "uid": member_user.id},
            {"first": "Priya", "last": "Nair", "email": "priya@gmail.com", "plan": premium_plan, "status": "Active", "phone": "9999888878"},
            {"first": "Karthik", "last": "R", "email": "karthik@gmail.com", "plan": elite_plan, "status": "Expiring", "phone": "9999888879"},
            {"first": "Sneha", "last": "Iyer", "email": "sneha@gmail.com", "plan": premium_plan, "status": "Active", "phone": "9999888880"},
            {"first": "Vikram", "last": "Das", "email": "vikram@gmail.com", "plan": basic_plan, "status": "Expiring", "phone": "9999888881"}
        ]
        
        db_members = []
        for index, m in enumerate(members_data):
            member = Member(
                first_name=m["first"],
                last_name=m["last"],
                email=m["email"],
                phone=m["phone"],
                gender="Male" if index % 2 == 0 else "Female",
                dob=date(1995, 5, 10 + index),
                address=f"Flat {100 + index}, Park Street, Kolkata",
                membership_plan_id=m["plan"].id,
                joining_date=date.today() - timedelta(days=30 * index),
                status=m["status"],
                user_id=m.get("uid")
            )
            db.add(member)
            db_members.append(member)
        db.commit()
        
        # Refresh members list
        seeded_members = db.query(Member).all()

        # 6. Create Payments
        print("Creating payments...")
        payments = [
            Payment(
                member_id=seeded_members[0].id,
                amount=Decimal("999.00"),
                payment_method="UPI",
                payment_date=date.today(),
                status="Paid"
            ),
            Payment(
                member_id=seeded_members[1].id,
                amount=Decimal("1799.00"),
                payment_method="Card",
                payment_date=date.today() - timedelta(days=5),
                status="Paid"
            ),
            Payment(
                member_id=seeded_members[2].id,
                amount=Decimal("2999.00"),
                payment_method="UPI",
                payment_date=date.today() - timedelta(days=28),
                status="Paid"
            ),
            Payment(
                member_id=seeded_members[3].id,
                amount=Decimal("1799.00"),
                payment_method="Cash",
                payment_date=date.today() - timedelta(days=12),
                status="Paid"
            ),
            Payment(
                member_id=seeded_members[4].id,
                amount=Decimal("999.00"),
                payment_method="UPI",
                payment_date=date.today() - timedelta(days=29),
                status="Pending" # Pending/Expiring Soon
            )
        ]
        
        # Seed extra historical payments to create high monthly revenue graph (Totaling around 4.2L for Jun)
        # We can seed 100 payments of Premium/Elite plans to simulate realistic revenue data
        for i in range(80):
            payments.append(
                Payment(
                    member_id=seeded_members[i % 5].id,
                    amount=Decimal("2999.00") if i % 3 == 0 else Decimal("1799.00"),
                    payment_method="UPI" if i % 2 == 0 else "Card",
                    payment_date=date.today() - timedelta(days=i % 60),
                    status="Paid"
                )
            )
            
        for p in payments:
            db.add(p)
        db.commit()

        # 7. Create Workouts
        print("Creating workouts...")
        workouts = [
            Workout(
                member_id=seeded_members[0].id,
                trainer_id=main_trainer.id,
                workout_name="Push Day Routine",
                exercise="Bench Press",
                sets=4,
                reps=10,
                duration=45
            ),
            Workout(
                member_id=seeded_members[0].id,
                trainer_id=main_trainer.id,
                workout_name="Push Day Routine",
                exercise="Overhead Press",
                sets=3,
                reps=12,
                duration=30
            ),
            Workout(
                member_id=seeded_members[1].id,
                trainer_id=main_trainer.id,
                workout_name="Leg hypertrophy",
                exercise="Barbell Squats",
                sets=4,
                reps=8,
                duration=50
            ),
            Workout(
                member_id=seeded_members[2].id,
                trainer_id=main_trainer.id,
                workout_name="Core & Yoga",
                exercise="Plank",
                sets=3,
                reps=1,
                duration=20
            )
        ]
        for w in workouts:
            db.add(w)
        db.commit()

        # 8. Create Attendance
        print("Creating attendance records...")
        attendance_logs = [
            Attendance(member_id=seeded_members[0].id, date=date.today(), check_in=time(7, 30), check_out=time(8, 45), status="Present"),
            Attendance(member_id=seeded_members[1].id, date=date.today(), check_in=time(8, 15), check_out=time(9, 30), status="Present"),
            Attendance(member_id=seeded_members[2].id, date=date.today(), check_in=time(18, 0), check_out=time(19, 0), status="Late"),
            Attendance(member_id=seeded_members[3].id, date=date.today(), check_in=time(6, 45), check_out=time(8, 0), status="Present"),
            
            # Historical attendance for member 0 to show in monthly report
            Attendance(member_id=seeded_members[0].id, date=date.today() - timedelta(days=1), check_in=time(7, 30), check_out=time(8, 30), status="Present"),
            Attendance(member_id=seeded_members[0].id, date=date.today() - timedelta(days=2), check_in=time(7, 40), check_out=time(8, 40), status="Present"),
            Attendance(member_id=seeded_members[0].id, date=date.today() - timedelta(days=3), check_in=time(7, 30), check_out=time(8, 30), status="Present"),
            Attendance(member_id=seeded_members[0].id, date=date.today() - timedelta(days=4), check_in=None, check_out=None, status="Absent")
        ]
        for a in attendance_logs:
            db.add(a)
        db.commit()

        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
