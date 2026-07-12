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

## Step 3.1 — Supabase Auth + Signup/Login UI
**Timestamp:** 2026-07-12T10:10:00Z
**Status:** COMPLETE

### What was done
- Installed @supabase/supabase-js 2.110.2 + @supabase/ssr 0.12.0
- lib/supabase/client.ts (createBrowserClient) + lib/supabase/server.ts (createServerClient with the @supabase/ssr getAll/setAll cookie pattern — required for 3.3 middleware sessions)
- (auth) route group: /signup (two-button role selector → signUp with options.data={role}), /login, POST /logout route handler (signOut + 303 → /login)
- lib/bootstrap-profile.ts: feature-flagged POST /profiles/bootstrap call (BOOTSTRAP_ENABLED=false until 3.2; non-fatal by design)
- apps/web/.env.local created by user (URL + anon key); Supabase Confirm-email toggled OFF
- QA green: REST signup issued session with user_metadata.role=candidate (proves confirm-email off); auth.users shows role; duplicate signup → "User already registered" (shown as friendly form error); /signup + /login render 200; POST /logout → 303 to /login; git grep finds zero password hashing/storage code
- Commit: feat(auth): supabase auth signup/login with role metadata

### Decisions
- DECISION CHANGE: Supabase Auth replaces the earlier Auth.js plan — DB, storage and auth in one free service, no password custody, JWT independently verifiable in FastAPI (3.2)
- Role captured at signup in user_metadata.role — single source for role routing until profiles row exists
- Auth pages deliberately minimal Tailwind — design system + animation stacks arrive in Phase 4, not before

### Key values for future steps
- LAUNCH BLOCKER → Phase 15.1: re-enable Supabase email confirmation before launch
- Test user exists: qa.candidate.31@example.com (candidate) — visible in dashboard Users; reusable for 3.2/3.3 testing
- 3.2 must: build POST /profiles/bootstrap, then flip BOOTSTRAP_ENABLED=true in lib/bootstrap-profile.ts and remove the flag
- ACTIVE env vars now: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (apps/web/.env.local)

---

## Step 3.2 — FastAPI JWT Verification + Role Guards
**Timestamp:** 2026-07-12T10:55:00Z
**Status:** COMPLETE

### What was done
- PyJWT 2.13.0 + cryptography 49.0.0 added to requirements
- app/core/security.py: verify_token dual-path (HS256 if SUPABASE_JWT_SECRET set, else cached PyJWKClient → RS256/ES256), aud='authenticated' + exp always validated, leeway=30s; CurrentUser dataclass; get_current_user (bearer → verify → load-or-create profiles row, race-safe via IntegrityError catch); require_role factory (403)
- Routes: GET /me (full profile), POST /profiles/bootstrap (idempotent — verified twice), TEMP GET /debug/recruiter-only for guard QA (delete in Phase 4)
- Web: BOOTSTRAP_ENABLED flag removed from lib/bootstrap-profile.ts — bootstrap call now always fires (still non-fatal try/catch)
- .env: SUPABASE_JWT_SECRET placeholder cleared (would have wrongly triggered HS256 path); .env.example documents "leave empty on JWKS projects"
- QA green against live project: fresh ES256 token → /me returns profile immediately; tampered/garbage/missing token → 401; candidate token on recruiter route → 403; deleted profiles row recreated on next /me
- Commit: feat(auth): jwt verification + role guards in fastapi

### Decisions
- SIGNING MODE: this project uses JWKS/ES256 (EC key, kid 47c1668c…) — detected from live JWKS endpoint + token header; NO shared JWT secret exists. Dual-path kept so the code survives a move to an HS256 project.
- leeway=30s on JWT validation — QA caught a real failure: local clock a few seconds behind Supabase made fresh tokens "not yet valid (iat)"
- Bootstrap-on-first-request in get_current_user guarantees a profiles row after ANY authenticated call — web bootstrap POST is now just a warm-up nicety
- CurrentUser(id, role, email) is the auth contract for every future route; require_role(role) is the only guard pattern

### Key values for future steps
- Route guards: Depends(get_current_user) for auth, Depends(require_role("candidate"|"recruiter")) for role
- Role source at bootstrap: token user_metadata.role (defaults to candidate if absent); full_name falls back to email local-part
- TEMP /debug/recruiter-only → delete in Phase 4

---

## Step 3.3 — Route Protection & Role Redirects (Web)
**Timestamp:** 2026-07-12T11:45:00Z
**Status:** COMPLETE

### What was done
- apps/web/middleware.ts (@supabase/ssr getUser pattern, Node runtime, cookie-carrying redirects)
- Redirect matrix VERBATIM:
  - logged-out + /candidate/* or /recruiter/* → /login?next=<path>
  - logged-in + /login or /signup → /<role>/dashboard
  - candidate + /recruiter/* → /candidate/dashboard
  - recruiter + /candidate/* → /recruiter/dashboard
  - everything else → pass through with refreshed session cookies
- Login honors ?next= (falls back to /<role>/dashboard); signup lands on /<role>/dashboard
- Placeholder dashboards: app/candidate/dashboard + app/recruiter/dashboard (server components, name+role from session)
- lib/nav.ts: NAV: Record<Role, NavItem[]> — candidate: Dashboard/Jobs/Resume/Applications/Profile; recruiter: Dashboard/Jobs/Company
- Second test user created: qa.recruiter.33@example.com (recruiter)
- QA green (headless, real session cookies for both roles): every matrix cell verified incl. mirror case, session survives refresh (two 200s), /file.svg untouched, dashboard body renders email+role
- Commit: feat(auth): middleware protection + role redirects

### Decisions
- middleware uses getUser() NOT getClaims(): getClaims silently returns no session in this middleware environment (both edge and node runtimes tested) — getUser verifies with the auth server and works
- middleware runtime: nodejs (config.runtime) — matches the environment where the ssr cookie parsing is proven
- Matcher: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
- Redirects copy refreshed session cookies onto the redirect response — otherwise a token refresh done during the request is lost
- ROOT CAUSE of initial QA failure: apps/web/.env.local still had the placeholder SUPABASE_URL → ssr derived the wrong cookie name ("sb-your-project-ref-…") → "Auth session missing". Fixed the URL. LESSON: when auth "finds no session", check the URL-derived cookie name first.

### Key values for future steps
- SECURITY GAP FOUND AND CLOSED (2026-07-12): pre-rotation anon key still authenticated → Step 0.2 rotation had never taken effect → both keys leaked in chat on 2026-07-11 were live. User disabled legacy API keys + switched .env.local to the sb_publishable key. VERIFIED: old anon → 401, old service_role → 401, publishable key login → session OK. Web now runs on publishable keys only; legacy eyJ keys are dead project-wide.
- Test users: qa.candidate.31@example.com + qa.recruiter.33@example.com (password in QA scripts only, dev-only accounts)
- Phase 4 shell consumes NAV from lib/nav.ts

---

## Step 4.1 — Tokens, shadcn/ui & Typography
**Timestamp:** 2026-07-12T12:40:00Z
**Status:** COMPLETE

### What was done
- Visual identity LOCKED (validated against ui-ux-pro-max design DB; its gold/Orbitron suggestion rejected as off-brand for professional recruiting):
  bg #0B0F1A · surface #121A2E · surface-2 #1A2440 · border #22304E · text #E6EDF7 · text-muted #8A99B8 · accent #22D3EE (cyan) · accent-2 #8B5CF6 (violet) · success #34D399 · warning #FBBF24 · danger #FB7185 · sidebar #0E1424
- Fonts via next/font (self-hosted, zero layout shift): Sora (display/headings), Inter (body), JetBrains Mono (scores/data, tabular-nums)
- shadcn init (CLI v4, radix base, nova preset) + 17 primitives: avatar badge button card dialog dropdown-menu field(+separator, replaces removed "form") input label select sheet skeleton sonner table tabs tooltip
- globals.css: all tokens in :root (dark = default and only theme, color-scheme: dark), Nexora aliases registered in @theme (bg-surface, bg-surface-2, text-text-muted, *-accent-2, *-success, *-warning, *-danger); radius scale sm→4xl from --radius 10px; 3-step shadow scale; h1-h4 default to font-heading
- /styleguide (dev-only, notFound() in prod): all token swatches + every primitive — the visual regression page
- Deleted: web /debug page, api /debug/recruiter-only route, CNA boilerplate home (replaced with token-clean minimal landing — QA caught hardcoded hex in it)
- QA green: /styleguide 200 with all sections; zero hardcoded hex in components/app/lib; fonts self-hosted (no external font links, no Geist leftovers); /debug 404
- Commit: feat(ui): design tokens + shadcn primitives + styleguide

### Decisions
- RULE ADOPTED: no hardcoded colors, ever — tokens only (grep-enforced each phase)
- Nexora "accent" = shadcn "primary" (cyan). shadcn's internal --accent stays a neutral hover surface — overriding it would paint every dropdown hover cyan
- Status colors use 400-series (desaturated-light) for dark-mode legibility per dark-mode contrast rule
- shadcn v4 registry replaced "form" with "field" — Field/FieldLabel/FieldDescription is our form pattern
- Type scale: Sora 36/30/24/20 (bold/semibold headings), Inter 16 body + 14 secondary, JetBrains Mono for all numeric data with tabular-nums

### Key values for future steps
- Token utilities: bg-background/surface/surface-2, border-border, text-foreground/muted-foreground, bg-primary (accent), *-accent-2, *-success/warning/danger, font-heading/sans/mono
- /styleguide is the visual regression check — verify it after any design-system change
- GSAP/anime.js animation stacks: intentionally NOT installed in 4.1 — first animation surface is the 4.2 shell

---
