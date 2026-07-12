# Nexora

Nexora is an AI-powered application built entirely on free tiers: a Next.js frontend, a FastAPI backend, Supabase for Postgres + pgvector + Auth + Storage, and Groq (llama-3.3-70b-versatile) as the LLM. Current system state always lives in [codebase_audit.md](codebase_audit.md); project history lives in [memory.md](memory.md).

## Stack

- **apps/web** — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **apps/api** — FastAPI, SQLAlchemy 2, Alembic, psycopg 3 (Python 3.11+)
- **Data** — Supabase Postgres with pgvector (primary), Groq LLM
- **Tooling** — pnpm workspace, ESLint + Prettier (web), ruff (api)

## Run locally

Prerequisites: Node 20+, pnpm 9+, Python 3.11+.

### Web (localhost:3000)

```powershell
pnpm install
pnpm dev:web
```

### API (localhost:8000)

```powershell
cd apps/api
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
cd ..\..
pnpm dev:api    # serves http://localhost:8000/health
```

## Lint & format

```powershell
pnpm --filter web lint       # ESLint
pnpm --filter web format     # Prettier (writes)
ruff check apps/api          # Python lint
ruff format apps/api         # Python format (writes)
```

## Optional local database

Supabase is the primary database. [docker-compose.yml](docker-compose.yml) provides an optional local pgvector Postgres (port 5433) used only if the Supabase free-tier project is paused — see the comments in that file.
