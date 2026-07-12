# 🌍 EcoSphere — ESG Management Platform

A full-stack ESG (Environmental, Social & Governance) management platform that unifies carbon accounting, CSR tracking, governance compliance, and employee gamification into a single system.

Built for the Odoo Hackathon.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              Browser                                 │
│                    React 19 + Vite + TailwindCSS v4                  │
│         (Zustand · React Query · amCharts 5 · Framer Motion)           │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │  REST (JSON)  +  WebSocket
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          FastAPI (async)                             │
│   Auth (JWT) ─ 22 route modules ─ Repository/Service layers          │
│   AI Assistant (Llama 3.3 70B via NVIDIA NIM, SSE streaming)                     │
│   WebSocket Manager (real-time notifications)                        │
└───────┬───────────────────────────┬───────────────────────┬──────────┘
        │                           │                       │
        ▼                           ▼                       ▼
┌───────────────┐         ┌──────────────────┐     ┌─────────────────┐
│ PostgreSQL 16  │         │      Redis        │     │  Celery Worker   │
│  23 tables     │◄───────┤ cache · pub/sub    │     │  + Celery Beat   │
│  Alembic-      │         │                    │     │  (4 scheduled    │
│  managed       │         │                    │     │   jobs)          │
└───────────────┘         └──────────────────┘     └─────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.12), SQLAlchemy 2.0 (async), Alembic, PostgreSQL 16, Redis, Celery |
| Frontend | React 19, Vite, TypeScript, TailwindCSS v4, React Query v5, Zustand, amCharts 5, Framer Motion |
| AI | Llama 3.3 70B (NVIDIA NIM, OpenAI-compatible API) — streaming chat assistant + cached auto-insights |
| Auth | JWT access/refresh tokens, bcrypt, role-based access control (admin/manager/employee) |
| Real-time | FastAPI WebSockets, in-process pub/sub to connected clients |
| Infra | Docker Compose (postgres, redis, backend, frontend, celery worker, celery beat) |

## Quick Start

```bash
git clone <repo-url> ecosphere
cd ecosphere
cp .env.example .env
# Optionally set LLM_API_KEY in .env to enable the AI assistant (NVIDIA NIM / Llama 3.3 70B)

docker compose up -d --build

# Run migrations and seed demo data
docker compose exec backend alembic upgrade head
docker compose exec backend python -m scripts.seed
```

- Frontend: http://localhost:3000
- Backend API docs (Swagger): http://localhost:8000/docs
- Backend health check: http://localhost:8000/health

### Seed credentials

```
Email:    admin@ecosphere.com
Password: Admin@123
```

### Running backend tests

Tests run against a dedicated database (never the dev database — the test suite drops all tables on teardown):

```bash
docker exec <postgres-container> psql -U ecosphere -d ecosphere -c "CREATE DATABASE ecosphere_test;"
docker compose run --rm \
  -e DATABASE_URL=postgresql+asyncpg://ecosphere:ecosphere_secret@postgres:5432/ecosphere_test \
  -e TESTING=true \
  backend pytest -v
```

---

## ESG Scoring Formula

Each department's score is computed for a period (default: current calendar month) and stored in `department_scores`:

- **Environmental (0–100):** `100 - (actual_emissions / target_emissions × 100)`, clamped to [0, 100]. Departments with no active goals default to 100.
- **Social (0–100):** average of CSR participation rate and challenge completion rate among the department's employees.
- **Governance (0–100):** policy acknowledgement rate minus a penalty for open critical/high compliance issues (`critical × 10 + high × 5`), clamped to [0, 100].
- **Total score:** weighted average of the three, using the org's configurable weights (default 40% / 30% / 30%, must always sum to 100 — enforced by a DB `CHECK` constraint and a Pydantic validator).
- **Org score:** weighted average of all departments' latest total scores (weighted by employee count).

Recalculated nightly by a Celery Beat job, or on demand via `POST /department-scores/recalculate`.

---

## Feature Checklist

- ✅ 23-table PostgreSQL schema (UUID PKs, soft-delete, indexes, CHECK constraints), managed entirely through Alembic migrations
- ✅ JWT access + refresh auth with RBAC (admin / manager / employee)
- ✅ 74 REST endpoints across auth, master data, environmental, social, governance, gamification, reports, notifications, settings, AI, and dashboards
- ✅ Business rules enforced in the service layer: challenge lifecycle state machine, atomic reward redemption (`SELECT FOR UPDATE`), evidence-gated CSR/challenge approvals, badge auto-award, required compliance-issue owner/due-date
- ✅ Celery Beat: overdue compliance detection, policy reminders, nightly score recalculation, environmental goal tracking
- ✅ WebSocket-powered real-time notifications
- ✅ Llama-powered AI assistant (streaming chat) + cached department insights
- ✅ Report exports (CSV / Excel / PDF) plus a custom report builder
- ✅ React frontend: animated ESG score ring, KPI dashboard, full CRUD across all six module areas, gamification (challenges/leaderboard/badges/rewards), settings
- ✅ Full Docker Compose stack (6 services), verified end-to-end in a live browser session

## Hackathon Judging Criteria Alignment

| Criterion | How it's met |
|---|---|
| Database design | PostgreSQL 16, 23 normalized tables, UUIDs, indexes, CHECK constraints, soft-delete, Alembic-only migrations |
| Real-time & dynamic data | WebSocket notifications, React Query polling, live score recalculation |
| Input validation | Pydantic v2 on every backend endpoint; DB-level constraints (weight-sum CHECK, required owner/due_date) |
| Git workflow | `main`/`develop` branch structure, `.gitignore`, conventional commit style |
| Interactive UI | TailwindCSS v4 design system (light theme), Framer Motion animations, amCharts 5 visualizations |
| Trendy tech (AI) | LLM-powered streaming ESG assistant + auto-insights, badge auto-award intelligence |
| Strong backend | Async FastAPI, repository/service layering, Celery background jobs, RBAC |
| Clean frontend | Component library, TypeScript throughout, consistent light-theme design tokens |
| Workflow compliance | Full ESG loop: master data → operational transactions → scoring → dashboards |
