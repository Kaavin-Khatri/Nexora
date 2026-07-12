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
- Design system: shadcn/ui (CLI v4, radix base) — avatar, badge, button, card, dialog, dropdown-menu, field (+separator; replaces removed "form"), input, label, select, sheet, skeleton, sonner, table, tabs, tooltip. Fonts via next/font: Sora (headings), Inter (body), JetBrains Mono (data). Icons: lucide-react.
- apps/api: Python 3.14.6 venv, FastAPI 0.139.0, uvicorn 0.51.0, SQLAlchemy 2.0.51, Alembic 1.18.5, psycopg 3.3.4 (binary), pydantic 2.13.4, pydantic-settings 2.14.2, python-dotenv, ruff 0.15.21 (dev)
- Monorepo: pnpm workspace (pnpm-workspace.yaml), single lockfile at root

## Services
- Supabase (Postgres + pgvector + Auth + Storage): project ref `vduadmxexdgkhmkxloyd`, region ap-south-1 (Mumbai), dashboard https://supabase.com/dashboard/project/vduadmxexdgkhmkxloyd — pgvector enabled
- Supabase Auth: email/password provider, role captured at signup in user_metadata.role; **Confirm email OFF for dev (LAUNCH BLOCKER — re-enable in 15.1)**; web uses @supabase/ssr cookie-based sessions
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
| NEXT_PUBLIC_SUPABASE_URL | apps/web | no | ACTIVE (.env.local) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | apps/web | no (browser-safe, RLS-limited) | ACTIVE (.env.local) |
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
    │   ├── middleware.ts   # session refresh + redirect matrix (Node runtime)
    │   ├── app/            # layout.tsx (fonts), page.tsx (minimal landing), globals.css (ALL tokens)
    │   │   ├── (auth)/     # signup, login
    │   │   ├── logout/     # POST route handler
    │   │   ├── candidate/dashboard/   # placeholder (real one in later phase)
    │   │   ├── recruiter/dashboard/   # placeholder
    │   │   └── styleguide/ # dev-only visual regression page (404 in prod)
    │   ├── components/ui/  # 17 shadcn primitives
    │   ├── lib/            # api-client, supabase/, bootstrap-profile, nav.ts, utils.ts (cn)
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
        ├── scripts/
        │   └── seed.py     # idempotent demo seed (120 skills, 2 companies, 6 jobs)
        ├── requirements.txt
        ├── requirements-dev.txt  # + ruff
        ├── pyproject.toml  # [tool.ruff] line-length 100, py311
        ├── .env            # (ignored) real values live here
        ├── .env.example
        └── .venv/          # (ignored) Python 3.14.6
```

## Database Schema
Single source of truth for schema questions. Alembic head: 6a7169635a41. Models in apps/api/app/db/models/.

**Enums** (Postgres types): user_role(candidate, recruiter) · job_type(full_time, part_time, contract, internship) — shared by profiles + jobs · resume_status(uploaded, parsing, parsed, failed) · job_status(open, closed) · application_status(applied, screening, shortlisted, interview, rejected, hired)

**profiles** — one row per Supabase auth user. user_id UUID PK (mirrors auth.users.id, NO cross-schema FK — app layer enforces via verified JWT), role user_role NOT NULL, full_name text NOT NULL, headline text, location text, years_experience numeric(4,1), desired_job_type job_type, open_to_remote bool NOT NULL default false

**companies** — id UUID PK default gen_random_uuid(), name text NOT NULL, website text, size text, about text, owner_user_id UUID NOT NULL FK→profiles.user_id

**recruiter_profiles** — user_id UUID PK FK→profiles.user_id, company_id UUID NOT NULL FK→companies.id, full_name text NOT NULL

**resumes** — id UUID PK default gen_random_uuid(), candidate_id UUID NOT NULL FK→profiles.user_id, file_path text, raw_text text, parsed_json jsonb, ats_score numeric(5,2), ats_breakdown jsonb, skills text[], embedding vector(384), status resume_status NOT NULL default 'uploaded', error_message text, created_at timestamptz NOT NULL default now()

**jobs** — id UUID PK default gen_random_uuid(), company_id UUID NOT NULL FK→companies.id, recruiter_id UUID NOT NULL FK→recruiter_profiles.user_id, title text NOT NULL, description text, location text, remote bool NOT NULL default false, job_type job_type, min_experience numeric(4,1), required_skills text[], parsed_json jsonb, embedding vector(384), status job_status NOT NULL default 'open', created_at timestamptz NOT NULL default now()

**applications** — id UUID PK default gen_random_uuid(), job_id UUID NOT NULL FK→jobs.id, candidate_id UUID NOT NULL FK→profiles.user_id, resume_id UUID NOT NULL FK→resumes.id, status application_status NOT NULL default 'applied', match_score numeric(5,2), match_breakdown jsonb, applied_at timestamptz NOT NULL default now(), UNIQUE(job_id, candidate_id) = uq_applications_job_candidate

**interview_questions** — id UUID PK default gen_random_uuid(), application_id UUID NOT NULL FK→applications.id ON DELETE CASCADE, question text NOT NULL, category text, targets_skill text, created_at timestamptz NOT NULL default now()

**skills** — id serial PK, name text NOT NULL UNIQUE, category text, flagged bool NOT NULL default false. Taxonomy for autocomplete/moderation; fast-path matching uses the text[] columns above.

**Indexes** (beyond PKs/uniques): ix_resumes_embedding_hnsw + ix_jobs_embedding_hnsw (HNSW, vector_cosine_ops) · ix_resumes_skills_gin + ix_jobs_required_skills_gin (GIN on text[]) · ix_jobs_location + ix_jobs_job_type (btree)

## API Endpoints

| Method | Path | Auth | Returns |
|--------|------|------|---------|
| GET | /health | none | {"status": "ok"} |
| GET | /health/db | none | {"status": "ok"} — SELECT 1 via get_db over the pooler |
| GET | /me | bearer (any role) | full profile row (bootstraps it if missing) |
| POST | /profiles/bootstrap | bearer (any role) | {"status","user_id","role"} — idempotent |

CORS: CORSMiddleware reads ALLOWED_ORIGINS (comma-separated) via app/config.py settings; allow_credentials on; default origin http://localhost:3000.

## Components
- apps/web/lib/api-client.ts — the ONLY web→api path: `api<T>(path, init?)`, base URL from NEXT_PUBLIC_API_URL (default localhost:8000), throws ApiError(status, message) on non-2xx (parses FastAPI `detail`)
- apps/web/lib/supabase/client.ts (browser) + server.ts (server components/route handlers, @supabase/ssr getAll/setAll cookie pattern)
- apps/web/lib/bootstrap-profile.ts — POST /profiles/bootstrap after signup/login (non-fatal; API also bootstraps on first authenticated request)
- apps/web/app/(auth)/signup + login pages (client components, minimal Tailwind; login honors ?next=); app/logout/route.ts (POST → signOut → 303 /login)
- apps/web/middleware.ts — redirect matrix + session refresh (see Decisions)
- apps/web/lib/nav.ts — NAV: Record<Role, NavItem[]> consumed by the Phase 4 shell
- apps/web/app/candidate/dashboard + app/recruiter/dashboard — placeholder server components (name + role from session)
- apps/web/components/ui/* — 17 shadcn primitives (see Stack); Field family is the form pattern
- apps/web/app/styleguide — dev-only token + primitive regression page
- apps/web/app/page.tsx — minimal token-clean landing (real marketing page in a later phase)

## Decisions
- Region ap-south-1 for lowest latency from India
- Groq llama-3.3-70b-versatile, swappable in one line via GROQ_MODEL
- Port 5432 = migrations only; port 6543 pooler = runtime
- pnpm workspace source of truth is pnpm-workspace.yaml (pnpm 11 ignores package.json `workspaces`)
- dev:api runs the venv python directly (`--app-dir apps/api`) — no activation required
- TOKEN SYSTEM (locked 4.1, dark-only v1, all values in :root of apps/web/app/globals.css — the ONLY place colors exist):
  bg #0B0F1A · surface #121A2E · surface-2 #1A2440 · border/input #22304E · text #E6EDF7 · text-muted #8A99B8 · accent=primary #22D3EE (on-accent #06121F) · accent-2=secondary #8B5CF6 · success #34D399 · warning #FBBF24 · danger #FB7185 · ring #22D3EE · sidebar #0E1424 · radius base 10px (sm 6 → 4xl 26) · shadows sm/md/lg subtle black
  RULE: no hardcoded colors in components, ever — tokens only. Nexora "accent"=shadcn "primary"; shadcn --accent stays the neutral hover surface.
- TYPE SCALE: Sora headings 36 bold / 30 / 24 / 20 semibold (h1–h4 default to font-heading); Inter body 16 (lh 1.5) + 14 muted secondary; JetBrains Mono for all scores/data with tabular-nums
- Supabase Auth replaces the earlier Auth.js plan: DB + storage + auth in one free service, zero password custody in Nexora code, JWT independently verifiable in FastAPI (3.2)
- Dual-path JWT verification (HS256 secret OR JWKS) so the code works on both Supabase project generations; this project is JWKS/ES256
- 30s JWT leeway: local clock skew vs Supabase made fresh tokens fail iat validation (caught by QA, not theory)
- Middleware: getUser() not getClaims() (getClaims silently finds no session in the middleware environment); runtime "nodejs"; matcher `/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)`; redirects carry refreshed session cookies
- Seeds exclude embeddings until the pipeline exists — no fake vectors ever; seed is insert-only on natural keys so re-runs never duplicate or overwrite (Phase 7.3 backfill survives re-seeding)
- Formatting: Prettier defaults, no .prettierrc (zero bikeshedding; Prettier 3 respects .gitignore); eslint-config-prettier disables conflicting ESLint rules
- Python lint/format: ruff, line-length 100, target py311 (syntax floor; venv runs 3.14)
- docker-compose.yml is a fallback ONLY (Supabase paused scenario); port 5433 avoids local 5432 clashes

## Security
- Token validation (app/core/security.py): every protected route verifies the Supabase JWT independently — signature via project JWKS (ES256, cached PyJWKClient; HS256 fallback if SUPABASE_JWT_SECRET set), aud must be 'authenticated', exp enforced, 30s clock-skew leeway. 401 on any failure; require_role() → 403 on role mismatch.
- Auth contract: CurrentUser(id, role, email); role read from profiles row (bootstrapped from token user_metadata on first authenticated request)
- This project's signing mode: JWKS/ES256 — SUPABASE_JWT_SECRET stays EMPTY in .env
- Key custody: anon/publishable keys = browser-safe (RLS-limited); service_role/secret keys + DB password = server-only, never in frontend, chat, or git
- Secrets rule #1: .env / .env.local git-ignored forever
- Secrets rule #2: every new env var added to .env.example with a placeholder in the same commit that introduces it
- 2026-07-11 incident: original service_role + sb_secret keys exposed in chat → JWT secret rotated, secret key regenerated. Current keys never exposed.

## Known Issues
- **LAUNCH BLOCKER**: Supabase email confirmation is OFF for dev speed — re-enable in Phase 15.1
- Supabase free projects pause after ~1 week idle — first request wakes them (slow first hit); pool_pre_ping mitigates, local compose fallback exists (docker-compose.yml, :5433)
- db.<ref>.supabase.co (true direct connection) is IPv6-only and unreachable from this network — DIRECT_DATABASE_URL uses the session pooler (:5432) instead
- Python 3.14.6 is ahead of the plan's 3.11 target — all current deps installed fine; if a future dep lacks 3.14 wheels, install Python 3.11 alongside
- create-next-app drops a nested pnpm-workspace.yaml/lockfile when run inside the monorepo — was removed in Step 1.1; watch for it if re-scaffolding
