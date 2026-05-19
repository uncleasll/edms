# EDMS Full-Stack Project

Electronic Document Management System built with React, FastAPI, and PostgreSQL.
For older Macs without Docker, the backend can also run locally with SQLite.

## Stack

- Frontend: React 19, Vite, Tailwind CSS, Recharts
- Backend: Python FastAPI, SQLAlchemy 2, JWT auth
- Database: PostgreSQL 16
- Files: local uploads in `backend/storage` for no-Docker mode, persistent volume/object storage for production

## Quick Start

### No Docker / Old Mac

Open Terminal 1:

```bash
./scripts/start_backend_no_docker.sh
```

Open Terminal 2:

```bash
./scripts/start_frontend_no_docker.sh
```

Then open:

- Frontend: http://127.0.0.1:5173
- Admin panel: http://127.0.0.1:5173/admin
- Backend API docs: http://127.0.0.1:8000/docs

This mode creates `backend/edms.db` automatically and stores uploads in `backend/storage`.

## Deploy

Free deploy guide is in [DEPLOY.md](DEPLOY.md).

### Docker + PostgreSQL

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

Demo users all use password `1234`:

- `direktor`
- `ombor1`
- `ombor2`
- `ombor3`
- `ishlab1`
- `rejalar`
- `tayyor`

The backend creates tables and seeds demo users/documents on first startup.

## Local Development

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload
```

Frontend:

```bash
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

For PostgreSQL without Docker, set `DATABASE_URL` before starting the backend:

```bash
cd backend
pip install -r requirements-postgres.txt
export DATABASE_URL=postgresql+psycopg://edms:edms@localhost:5432/edms
uvicorn app.main:app --reload
```

## Main Features

- JWT login with seeded role-based demo users
- PostgreSQL-backed documents in production, SQLite local mode for old Macs
- Separate professional `/admin` console for employees, document templates, and audit logs
- Director-only currency selection; regular users are locked to `UZS`
- Excel import/export for document rows without extra native system dependencies
- Director approval flow for editing signed/approved documents
- Document export download as JSON
- File attachment upload and authenticated attachment downloads
- Dockerized production-style frontend, backend, database, and persistent volumes
