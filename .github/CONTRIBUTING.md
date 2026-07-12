# Contributing

## Branching

- `main` — production-ready, protected
- `develop` — integration branch
- `feature/*` — one branch per feature, branched from `develop`

## Commit messages

Conventional commits:

```
feat: add carbon transaction auto-calculation
fix: correct XP deduction on reward redemption
chore: add alembic migration for department_scores
```

## Local development

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec backend alembic upgrade head
docker compose exec backend python -m scripts.seed
```

Backend lint/type-check:

```bash
docker compose exec backend ruff check .
docker compose exec backend mypy app
```

Frontend lint/type-check:

```bash
cd frontend
npm run lint
npx tsc -b
```
