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
