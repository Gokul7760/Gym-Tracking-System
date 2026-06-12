# FitZone Pro - Gym Management System

An enterprise-grade, role-based Gym Management System featuring an interactive dashboard, client management, trainer assignment, payment tracking, check-in logs, and executive analytics.

## Tech Stack

- **Frontend**: React.js (Vite) + Tailwind CSS + Recharts + React Icons + React Router DOM + Context API (Auth & Simulation)
- **Backend**: Python FastAPI + SQLAlchemy ORM + Pydantic + Uvicorn + JWT Cryptography
- **Database**: MySQL (with automatic local SQLite fallback for out-of-the-box running)

---


## Setup Instructions

### 1. Database Configuration (MySQL)

By default, the backend tries to connect to MySQL using the URL in `backend/.env`.
If you have a MySQL server running, connect and execute:
```sql
CREATE DATABASE gym_db;
```
Then import the database schema using `schema.sql`:
```bash
mysql -u root -p gym_db < schema.sql
```

> [!NOTE]
> **SQLite Fallback**: If a MySQL server is not detected or credentials fail, the application will automatically initialize a local SQLite file (`gym_db.db`) and create tables on startup. This allows testing all functionalities instantly.

---

### 2. Backend Installation & Run

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Seed the database with initial plans, trainers, and members (Arjun, Priya, Karthik, Sneha, Vikram) to match the dashboard metrics:
   ```bash
   python app/seed.py
   ```
4. Start the FastAPI development server:
   ```bash
   python run.py
   ```
   The backend API docs will be available at: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

### 3. Frontend Installation & Run

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open the browser at [http://localhost:5173](http://localhost:5173) to view the portal!

---

## Demo Accounts (Autofill Buttons Provided on Login Screen)

- **Admin Account**: `admin@fitzone.com` / `admin123`
- **Trainer Account**: `trainer@fitzone.com` / `trainer123`
- **Member Account**: `member@fitzone.com` / `member123`

---

## Key Features

1. **Role-based Dashboards**: Interactive charts and cards change automatically based on the user's role.
2. **View-As Simulation Selector**: Easily toggle between Admin, Trainer, and Member views from the bottom left of the Sidebar to test different access privileges.
3. **Advanced Charts**: Recharts-based bar chart, doughnut, cumulative line area, and stacked attendance bars.
4. **Dark Mode**: Supports persistent dark mode saving across sessions (Sun/Moon icon in the Top Navbar).
