# Nexora — memory.md

Append-only project history. Every step appends one block. Newest at the bottom.
Rule: every AI session reads this file AND codebase_audit.md before acting, and
appends here + updates the audit after finishing. Never store secret values here.

---

## Step 0.0 — Project born
**Timestamp:** 2026-07-12T06:03:26Z
**Status:** COMPLETE

### What was done
- Repo Kaavin-Khatri/Nexora cloned locally; dual-file memory protocol bootstrapped
- Phase 0 OUTCOMES notes backfilled below (Steps 0.1–0.3 ran before this repo existed)

---

## Step 0.1 — Local Toolchain Setup
**Timestamp:** 2026-07-11T00:00:00Z
**Status:** COMPLETE

### What was done
- Verified toolchain: Node v24.16.0, pnpm 11.8.0, Python 3.14.6, Git 2.55.0
- Git identity confirmed: Kaavin / 165266039+Kaavin-Khatri@users.noreply.github.com
- Docker Desktop skipped (optional local-Postgres fallback only)

### Decisions
- User environment: Windows 11 Home + PowerShell — all commands use PowerShell syntax
- AI coding agent: Claude Code (VS Code extension)

### Key values for future steps
- OS/shell: Windows 11 / PowerShell
- Node 24 / pnpm 11 / Python 3.14 / Git 2.55 (all above minimums)
- Python 3.14 is newer than the plan's 3.11 target; fall back to 3.11 only if a dependency lacks wheels

---

## Step 0.2 — GitHub Repo + Supabase Project (pgvector)
**Timestamp:** 2026-07-11T00:00:00Z
**Status:** COMPLETE

### What was done
- GitHub repo created (private, default branch main, empty — no README)
- Supabase project `nexora` provisioned in ap-south-1 (Mumbai)
- pgvector extension enabled (extensions schema); verified via pg_extension query
- Initial service_role + sb_secret keys were exposed in chat → JWT secret rotated,
  secret key regenerated; new keys saved in password manager only

### Decisions
- Region ap-south-1 for lowest latency from India
- Key custody: anon/publishable = browser-safe (RLS-limited); service_role/secret = API server only, never in chat/frontend/git

### Key values for future steps
- Supabase project ref: vduadmxexdgkhmkxloyd
- Dashboard: https://supabase.com/dashboard/project/vduadmxexdgkhmkxloyd
- SUPABASE_URL: https://vduadmxexdgkhmkxloyd.supabase.co (bare domain — NOT the /rest/v1/ path)
- Direct conn (migrations only): postgresql://postgres:<PASSWORD>@db.vduadmxexdgkhmkxloyd.supabase.co:5432/postgres
- Pooler conn (app runtime): postgresql://postgres.vduadmxexdgkhmkxloyd:<PASSWORD>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

---

## Step 0.3 — Groq Key, Vercel & Render Accounts, Env Convention
**Timestamp:** 2026-07-12T00:00:00Z
**Status:** COMPLETE

### What was done
- Groq API key `nexora-dev` created, saved in password manager only
- Vercel account created (GitHub sign-in, Hobby) — no project imported (Phase 14.2)
- Render account created (GitHub sign-in, free) — no service created (Phase 14.1)
- UptimeRobot free account created (used in Phase 14)

### Decisions
- LLM: Groq llama-3.3-70b-versatile, swappable via GROQ_MODEL env var
- Env var registry fixed (see codebase_audit.md → Env Var Registry)
- Secrets rule #1: .env / .env.local are git-ignored forever
- Secrets rule #2: every new env var is added to .env.example with a placeholder in the same commit

### Key values for future steps
- GROQ_MODEL default: llama-3.3-70b-versatile
- Deploy targets: Vercel = apps/web, Render = apps/api (both deferred to Phase 14)

---

## Step 1.1 — Scaffold apps/web + apps/api + Protocol Files
**Timestamp:** 2026-07-12T06:03:26Z
**Status:** COMPLETE

### What was done
- Root: package.json (scripts dev:web / dev:api), pnpm-workspace.yaml (packages: apps/web; allowBuilds for sharp + unrs-resolver), .gitignore
- apps/web scaffolded with create-next-app: Next.js 16.2.10, React 19.2.4, TypeScript 5.9.3, Tailwind 4.3.2, ESLint 9, App Router, import alias @/*
- Removed nested apps/web/pnpm-workspace.yaml + pnpm-lock.yaml left by create-next-app; single lockfile lives at repo root
- apps/api scaffolded: .venv (Python 3.14.6), requirements.txt (FastAPI 0.139.0, uvicorn 0.51.0, SQLAlchemy 2.0.51, Alembic 1.18.5, psycopg 3.3.4, pydantic-settings 2.14.2, python-dotenv), app/main.py with GET /health
- memory.md + codebase_audit.md bootstrapped with Phase 0 backfill
- apps/web/.env.example + apps/api/.env.example created (canonical var names, placeholders)
- Commit: chore(scaffold): monorepo skeleton + memory protocol files — pushed to main

### Decisions
- pnpm workspace defined in pnpm-workspace.yaml (pnpm 11 ignores package.json workspaces; field kept for documentation)
- dev:api root script calls the venv python directly with --app-dir apps/api (no activation needed)
- Web deps hoisted to root node_modules (single-lockfile monorepo)

### Key values for future steps
- Web: pnpm --filter web dev → localhost:3000
- API: pnpm dev:api (or venv uvicorn) → localhost:8000, GET /health
- Venv: apps/api/.venv — activate with apps/api/.venv/Scripts/Activate.ps1

---

## Step 1.2 — Lint, Format & Local Dev Ergonomics
**Timestamp:** 2026-07-12T06:25:00Z
**Status:** COMPLETE

### What was done
- apps/web: added prettier 3.9.5 + eslint-config-prettier 10.1.8 (flat config entry appended in eslint.config.mjs), `format` script; ran prettier repo-wide once (only next.config.ts changed)
- apps/api: requirements-dev.txt (-r requirements.txt + ruff), pyproject.toml [tool.ruff] line-length 100 / target py311; ruff 0.15.21 installed in venv
- Root README.md: what Nexora is, stack, run instructions for both apps, lint/format commands, link to codebase_audit.md
- docker-compose.yml: pgvector/pgvector:pg16 on port 5433, named volume nexora_pgdata — commented as OPTIONAL LOCAL FALLBACK only
- QA: pnpm --filter web lint clean; ruff check + ruff format --check clean; Docker not installed so compose validation deferred to first use
- Commit: chore(tooling): eslint+prettier, ruff, readme, optional local pg compose

### Decisions
- Prettier defaults (no .prettierrc) — zero config to argue about; Prettier 3 respects .gitignore for ignores
- Ruff line-length 100, target py311 (floor for syntax compat even though local venv is 3.14)
- Local pg compose is fallback ONLY — Supabase stays primary; port 5433 to avoid clashing with any local Postgres

### Key values for future steps
- Format/lint: pnpm --filter web lint | format; ruff check | format apps/api (ruff.exe lives in the venv Scripts/)
- Local fallback DB (only if Supabase paused): docker compose up -d → postgresql://postgres:postgres@localhost:5433/postgres

---

## Step 1.3 — Typed API Client + CORS Handshake
**Timestamp:** 2026-07-12T07:05:00Z
**Status:** COMPLETE

### What was done
- apps/api/app/config.py: pydantic-settings Settings (env_file .env, extra ignore); ALLOWED_ORIGINS comma-separated, default http://localhost:3000
- apps/api/app/main.py: CORSMiddleware from settings, allow_credentials=True
- apps/web/lib/api-client.ts: typed fetch wrapper (base URL NEXT_PUBLIC_API_URL, default http://localhost:8000); ApiError carries status + server message (FastAPI `detail` parsed)
- apps/web/app/debug/page.tsx: temp server component rendering GET /health — DELETE IN PHASE 4
- QA verified live: /debug rendered status ok; wrong ALLOWED_ORIGINS removed the allow-origin header (browser-block equivalent, tested via curl, env override at launch only — nothing to revert on disk); ApiError from real 404 gave status=404 message="Not Found"
- Commit: feat(core): typed api client + cors handshake

### Decisions
- api-client pattern locked: lib/api-client.ts is the ONLY way web talks to api
- ApiError uses explicit field assignment (no TS parameter properties) — keeps the file erasable-syntax-only, so plain Node can import it (Node 24 strip-mode chokes on parameter properties)
- ALLOWED_ORIGINS is a plain comma-separated string split in config.py (no JSON parsing games)

### Key values for future steps
- Web → API calls: `import { api, ApiError } from "@/lib/api-client"`; api<T>(path, init?) throws ApiError on non-2xx
- Active env vars: ALLOWED_ORIGINS (api), NEXT_PUBLIC_API_URL (web) — both default to localhost, so no .env needed for local dev yet

---

## Step 2.1 — SQLAlchemy + Alembic Wired to Supabase
**Timestamp:** 2026-07-12T07:55:00Z
**Status:** COMPLETE

### What was done
- app/core/config.py: Settings with full env registry (DATABASE_URL + DIRECT_DATABASE_URL required, rest optional); env_file anchored to apps/api/.env regardless of CWD; sqlalchemy_url() rewrites postgresql:// → postgresql+psycopg:// so pasted Supabase strings work with psycopg 3
- app/config.py removed (superseded by app/core/config.py); main.py import updated
- app/db/base.py (DeclarativeBase) + app/db/session.py (NullPool, pool_pre_ping, prepare_threshold=None, get_db dependency)
- alembic init; env.py reads DIRECT_DATABASE_URL from settings, target_metadata = Base.metadata; alembic.ini URL line disabled
- Migration 91b5ea993551: ping table (proof only, dropped next migration)
- GET /health/db: SELECT 1 through get_db
- QA all green against live Supabase: upgrade head OK; /health/db {"status":"ok"} over pooler; downgrade -1 + upgrade head round-trip OK; git grep (raw + URL-encoded password) finds nothing tracked; .env confirmed ignored
- apps/api/.env.example updated to the working connection formats

### Decisions
- DIRECT_DATABASE_URL points at the SESSION POOLER (port 5432, same host/user as transaction pooler), NOT db.<ref>.supabase.co — the true direct host is IPv6-only and unreachable from this network (getaddrinfo fails). Session mode = dedicated connection per session, safe for DDL/migrations.
- DB password contained special chars (@ etc.) → stored URL-encoded in .env; rule noted in .env.example
- prepare_threshold=None on the runtime engine: transaction pooling breaks server-side prepared statements
- Engine pooling: NullPool + pool_pre_ping (Supavisor pools server-side; comment in session.py explains why not to "optimize")

### Key values for future steps
- Migrations: run from apps/api/ → .venv/Scripts/python.exe -m alembic upgrade head (uses DIRECT_DATABASE_URL = session pooler :5432)
- Runtime DB: DATABASE_URL = transaction pooler :6543; ACTIVE env vars now include both DB URLs
- Current head: 91b5ea993551 (ping table — drop it in the Phase 2.2 schema migration)
- pooler host is aws-1-ap-south-1.pooler.supabase.com (not aws-0)

---

## Step 2.2 — Core Schema Migration (relational + vector)
**Timestamp:** 2026-07-12T08:40:00Z
**Status:** COMPLETE

### What was done
- pgvector python package added to requirements + installed
- Models in app/db/models/: enums.py, profile.py, company.py (Company + RecruiterProfile), resume.py, job.py, skill.py, application.py (Application + InterviewQuestion); base.py imports models for autogenerate
- Migration 6a7169635a41 (autogenerated, then hand-fixed): creates all 8 tables + 5 enums + 6 secondary indexes, drops the 2.1 ping table. Hand fixes: missing `import pgvector.sqlalchemy`; downgrade now drops the 5 enum types (drop_table alone leaves them and breaks re-upgrade)
- Full schema recorded in codebase_audit.md → Database Schema (single source of truth)
- QA green on live Supabase: upgrade created everything; pg_indexes shows both hnsw + 2 GIN + 2 btree; invalid enum insert rejected + rolled back (profiles count 0); downgrade base left only alembic_version and zero public enums; upgrade head restored all 9 tables
- Commit: feat(db): core nexora schema v1

### Decisions
- Skills denormalized as text[] on resumes/jobs for fast overlap math + GIN; skills TABLE is the normalization/autocomplete taxonomy
- profiles.user_id mirrors auth.users.id WITHOUT cross-schema FK (Postgres can't FK into Supabase's auth schema); app layer enforces via verified JWT — documented in Profile docstring
- One shared job_type enum for profiles.desired_job_type and jobs.job_type (same vocabulary)
- UUID PKs with gen_random_uuid() server default everywhere except skills (serial per spec)
- Embeddings are Vector(384) → matches the fastembed all-MiniLM-L6-v2 dimension planned for Phase 5

### Key values for future steps
- Alembic head: 6a7169635a41
- Enums: user_role, job_type, resume_status, job_status, application_status (values in audit)
- applications has UNIQUE(job_id, candidate_id) as uq_applications_job_candidate — upserts must respect it
- interview_questions.application_id cascades on delete

---

## Step 2.3 — Seed Data (skills, companies, jobs)
**Timestamp:** 2026-07-12T09:05:00Z
**Status:** COMPLETE

### What was done
- apps/api/scripts/seed.py: 120 skills across 6 categories (languages 15, frameworks 25, data-ai 25, cloud-devops 25, fintech-domain 15, soft 15); 2 demo recruiter profiles + 2 companies (PayOrbit fintech/Ahmedabad, Brightpath Consulting/Bengaluru); 6 jobs (Backend, Frontend, AI Engineer, Data Analyst, PM, DevOps) with honest 150-250 word descriptions, mixed locations (Ahmedabad/Bengaluru/Remote), mixed job_type (full_time/internship/contract), min_experience 0-5
- QA green: two consecutive runs → identical counts (120/2/2/2/6); all 6 jobs embedding NULL + status open
- Commit: feat(db): seed script

### Decisions
- Idempotency = INSERT-ONLY on natural keys (skill name via ON CONFLICT DO NOTHING; profiles/companies/recruiter_profiles via fixed uuid5 IDs; jobs via title+company existence check). Existing rows never updated → re-seeding after Phase 7.3 cannot wipe backfilled embeddings
- Seed had to create 2 demo recruiter PROFILES (fixed uuid5, no matching auth.users rows — legal because no cross-schema FK); real users replace this pattern in Phase 3
- No fake vectors ever: embedding left NULL until the Phase 7.3 pipeline backfills

### Key values for future steps
- OPEN ITEM → Phase 7.3: backfill embeddings for the 6 seeded jobs
- Seed UUID namespace: uuid5(NAMESPACE_DNS, "seed.nexora"), keys like company/payorbit, recruiter/brightpath
- Re-run anytime: cd apps/api && .venv/Scripts/python.exe scripts/seed.py

---
