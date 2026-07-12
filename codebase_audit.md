# Nexora — codebase_audit.md

Living snapshot of the system AS IT IS NOW. Sections are rewritten in place —
history lives in memory.md. Never store secret values here.

## Environment
- OS: Windows 11 Home, shell: PowerShell (all commands use PowerShell syntax)
- Node v24.16.0, pnpm 11.8.0, Python 3.14.6, Git 2.55.0
- AI agent: Claude Code (VS Code extension)
- Docker: not installed (Supabase is the primary database)

## Stack & Versions
- apps/web: Next.js 16.2.10 (App Router, Turbopack), React 19.2.4, TypeScript 5.9.3, Tailwind CSS 4.3.2, ESLint 9.39.5 + Prettier 3.9.5 (eslint-config-prettier 10.1.8), import alias `@/*`
- apps/api: Python 3.14.6 venv, FastAPI 0.139.0, uvicorn 0.51.0, SQLAlchemy 2.0.51, Alembic 1.18.5, psycopg 3.3.4 (binary), pydantic 2.13.4, pydantic-settings 2.14.2, python-dotenv, ruff 0.15.21 (dev)
- Monorepo: pnpm workspace (pnpm-workspace.yaml), single lockfile at root

## Services
- Supabase (Postgres + pgvector + Auth + Storage): project ref `vduadmxexdgkhmkxloyd`, region ap-south-1 (Mumbai), dashboard https://supabase.com/dashboard/project/vduadmxexdgkhmkxloyd — pgvector enabled
- Groq (LLM): key `nexora-dev`, model llama-3.3-70b-versatile via GROQ_MODEL
- Vercel: account ready, hosts apps/web (deploy in Phase 14.2)
- Render: account ready, hosts apps/api (deploy in Phase 14.1)
- UptimeRobot: account ready (keep-alive pings, Phase 14)

### Connection strategy
- DATABASE_URL → Transaction pooler, port 6543 (`aws-1-ap-south-1.pooler.supabase.com`, user `postgres.<ref>`) — app runtime. Supavisor pools server-side, so the engine uses NullPool + pool_pre_ping + prepare_threshold=None (see app/db/session.py comment).
- DIRECT_DATABASE_URL → SESSION pooler, port 5432, same host/user — Alembic migrations ONLY (dedicated connection per session, safe for DDL).
- Why not `db.<ref>.supabase.co`: that host is IPv6-only and unreachable from this (IPv4-only) network — getaddrinfo fails. Session pooler is the documented IPv4 fallback.
- DB password contains special characters → stored URL-encoded in .env.

## Env Var Registry
Canonical names only — values live in git-ignored .env files / host dashboards.

| Var | Owner | Secret | Status |
|-----|-------|--------|--------|
| NEXT_PUBLIC_SUPABASE_URL | apps/web | no | planned |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | apps/web | no (browser-safe, RLS-limited) | planned |
| NEXT_PUBLIC_API_URL | apps/web | no | ACTIVE (default `http://localhost:8000`) |
| DATABASE_URL | apps/api | YES (transaction pooler :6543) | ACTIVE |
| DIRECT_DATABASE_URL | apps/api | YES (session pooler :5432, migrations) | ACTIVE |
| SUPABASE_URL | apps/api | no | planned |
| SUPABASE_SERVICE_ROLE_KEY | apps/api | YES | planned |
| SUPABASE_JWT_SECRET | apps/api | YES | planned |
| GROQ_API_KEY | apps/api | YES | planned |
| GROQ_MODEL | apps/api | no (llama-3.3-70b-versatile) | planned |
| ALLOWED_ORIGINS | apps/api | no | ACTIVE (default `http://localhost:3000`) |
| FASTEMBED_CACHE | apps/api | no | planned |

## File Tree
```
nexora/
├── package.json            # scripts: dev:web, dev:api
├── pnpm-workspace.yaml     # packages: apps/web; allowBuilds
├── pnpm-lock.yaml
├── .gitignore
├── README.md               # what/stack/run/lint instructions
├── docker-compose.yml      # OPTIONAL local pgvector fallback (:5433)
├── memory.md
├── codebase_audit.md
├── node_modules/           # (ignored)
└── apps/
    ├── web/                # Next.js 16 App Router
    │   ├── app/            # layout.tsx, page.tsx, globals.css
    │   ├── public/
    │   ├── package.json    # name: web; scripts: dev/build/start/lint/format
    │   ├── next.config.ts
    │   ├── tsconfig.json
    │   ├── postcss.config.mjs
    │   ├── eslint.config.mjs   # next + ts + prettier (flat)
    │   └── .env.example
    └── api/
        ├── app/
        │   ├── main.py     # FastAPI app, /health + /health/db
        │   ├── core/
        │   │   └── config.py   # Settings (full env registry) + sqlalchemy_url()
        │   └── db/
        │       ├── base.py     # DeclarativeBase; import models here for autogenerate
        │       └── session.py  # engine (NullPool+pre_ping), SessionLocal, get_db
        ├── alembic/
        │   ├── env.py      # url from DIRECT_DATABASE_URL; metadata from app.db.base
        │   └── versions/   # 91b5ea993551 ping table (temp)
        ├── alembic.ini     # sqlalchemy.url intentionally unset
        ├── requirements.txt
        ├── requirements-dev.txt  # + ruff
        ├── pyproject.toml  # [tool.ruff] line-length 100, py311
        ├── .env            # (ignored) real values live here
        ├── .env.example
        └── .venv/          # (ignored) Python 3.14.6
```

## Database Schema
- alembic_version (Alembic bookkeeping)
- ping (id int PK) — migration-path proof, dropped in the Phase 2.2 schema migration
- pgvector extension enabled on Supabase (no vector columns yet)
- Current Alembic head: 91b5ea993551

## API Endpoints

| Method | Path | Auth | Returns |
|--------|------|------|---------|
| GET | /health | none | {"status": "ok"} |
| GET | /health/db | none | {"status": "ok"} — SELECT 1 via get_db over the pooler |

CORS: CORSMiddleware reads ALLOWED_ORIGINS (comma-separated) via app/config.py settings; allow_credentials on; default origin http://localhost:3000.

## Components
- apps/web/lib/api-client.ts — the ONLY web→api path: `api<T>(path, init?)`, base URL from NEXT_PUBLIC_API_URL (default localhost:8000), throws ApiError(status, message) on non-2xx (parses FastAPI `detail`)
- apps/web/app/debug/page.tsx — TEMP handshake page rendering /health; delete in Phase 4
- apps/web default create-next-app page (app/layout.tsx, app/page.tsx)

## Decisions
- Region ap-south-1 for lowest latency from India
- Groq llama-3.3-70b-versatile, swappable in one line via GROQ_MODEL
- Port 5432 = migrations only; port 6543 pooler = runtime
- pnpm workspace source of truth is pnpm-workspace.yaml (pnpm 11 ignores package.json `workspaces`)
- dev:api runs the venv python directly (`--app-dir apps/api`) — no activation required
- Formatting: Prettier defaults, no .prettierrc (zero bikeshedding; Prettier 3 respects .gitignore); eslint-config-prettier disables conflicting ESLint rules
- Python lint/format: ruff, line-length 100, target py311 (syntax floor; venv runs 3.14)
- docker-compose.yml is a fallback ONLY (Supabase paused scenario); port 5433 avoids local 5432 clashes

## Security
- Key custody: anon/publishable keys = browser-safe (RLS-limited); service_role/secret keys + DB password = server-only, never in frontend, chat, or git
- Secrets rule #1: .env / .env.local git-ignored forever
- Secrets rule #2: every new env var added to .env.example with a placeholder in the same commit that introduces it
- 2026-07-11 incident: original service_role + sb_secret keys exposed in chat → JWT secret rotated, secret key regenerated. Current keys never exposed.

## Known Issues
- Supabase free projects pause after ~1 week idle — first request wakes them (slow first hit); pool_pre_ping mitigates, local compose fallback exists (docker-compose.yml, :5433)
- db.<ref>.supabase.co (true direct connection) is IPv6-only and unreachable from this network — DIRECT_DATABASE_URL uses the session pooler (:5432) instead
- Python 3.14.6 is ahead of the plan's 3.11 target — all current deps installed fine; if a future dep lacks 3.14 wheels, install Python 3.11 alongside
- create-next-app drops a nested pnpm-workspace.yaml/lockfile when run inside the monorepo — was removed in Step 1.1; watch for it if re-scaffolding
