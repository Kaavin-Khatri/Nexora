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

## Step 4.2 — Dashboard Shell (sidebar / topbar / responsive)
**Timestamp:** 2026-07-12T13:20:00Z
**Status:** COMPLETE

### What was done
- SHARED components/layout/: sidebar.tsx (Logo + NavLinks + Sidebar — desktop aside, hidden below lg), topbar.tsx (sticky, backdrop-blur; mobile Sheet nav trigger below lg; avatar dropdown with email, Profile link, Logout form POST → /logout), app-shell.tsx (Sidebar + Topbar + max-w-6xl main; min-w-0 guards horizontal overflow), page-header.tsx (title/description/action — every page uses it from now on)
- PER-ROLE: app/candidate/layout.tsx + app/recruiter/layout.tsx (server components: getClaims → AppShell with role/name/email). Dashboards rebuilt: PageHeader + welcome Card via shell
- lib/nav.ts extended with lucide icons per item (additive to the locked shape)
- Sheet nav closes on navigate (controlled open state); active nav = aria-current="page" + bg-sidebar-accent/text-sidebar-primary, prefix-matched so child routes keep parent highlighted
- QA green (server-rendered with real role cookies): candidate shell shows Dashboard/Jobs/Resume/Applications/Profile with zero recruiter items and vice versa; active state in SSR HTML; sheet trigger lg:hidden present; POST /logout → 303 /login. (Dropdown content is portal-rendered on open, so the logout form is verified via its working target + source, not SSR HTML.)
- Animation note: shell motion = shadcn/tw-animate CSS (sheet slide, transitions) — GSAP deliberately not added for a sidebar

### Decisions
- Shared vs per-role: everything in components/layout/ is role-agnostic and driven by the `role` prop + NAV map; the ONLY per-role code is the two thin layout files
- Topbar has no page-title — PageHeader owns titles inside content (simpler, avoids double title sources)
- Logout in the avatar menu is a plain form POST (browser follows 303) — no client fetch dance

### Key values for future steps
- New pages: drop into app/candidate/* or app/recruiter/* → shell applies automatically; start content with <PageHeader>
- Adding a nav item = one line in lib/nav.ts (label/href/icon)
- USER VISUAL CHECK pending: eyeball 360px width for horizontal scroll (structurally guarded: min-w-0 + no fixed widths + sheet below lg)

---

## Step 4.3 — Empty, Skeleton & Status Primitives
**Timestamp:** 2026-07-12T14:05:00Z
**Status:** COMPLETE

### What was done
- components/ui-patterns/: empty-state.tsx (icon/title/sub/action, product-voice copy), skeletons.tsx (SkeletonCard, SkeletonTable(rows,cols), SkeletonForm(fields)), status-badge.tsx (StatusBadge + ALL_STATUSES — THE single status-color source), data-table.tsx (generic Column<T> defs, client sorting via sortValue + aria-sort, built-in loading→SkeletonTable and empty→caller's EmptyState)
- Styleguide: StatusBadge section rendering every variant; Skeleton patterns; EmptyState demo; DataTableDemo with loading/data/empty state-flip buttons; 4.1's hand-colored badges replaced with StatusBadge (QA grep caught one leftover in the raw Table demo)
- QA green: /styleguide 200 with all 12 status variants + new sections; tsc/eslint/prettier clean; grep confirms bg-success/warning/danger appear ONLY in status-badge.tsx across components/lib (styleguide's 3 hits are the token swatch grid, by design)
- Commit: feat(ui): empty/skeleton/status primitives + datatable

### Decisions
- STATUS → COLOR MAP (verbatim, soft badges: tint/15 bg + colored text + /30 border):
  applied → neutral (surface-2) · screening → warning · shortlisted → accent-2 (violet) · interview → accent (cyan) · rejected → danger · hired → success · open → success · closed → neutral muted · uploaded → neutral · parsing → warning · parsed → success · failed → danger
- RULE: all future lists use DataTable or a card grid — no bespoke tables
- RULE: adding a status = one entry in STATUS_STYLES, nowhere else
- Soft (tinted) badges over solid fills: better dark-mode contrast, calmer data-dense tables

### Key values for future steps
- Imports: @/components/ui-patterns/{empty-state,skeletons,status-badge,data-table}
- DataTable contract: columns: Column<T>[] (sortValue = sortable), rowKey, loading, empty (pass an EmptyState)
- Empty-state copy pattern: "No X yet." + what-to-do sub + action button

---

## Step 5.1 — Candidate Profile CRUD
**Timestamp:** 2026-07-12T14:45:00Z
**Status:** COMPLETE

### What was done
- API: app/schemas/candidate.py (CandidateProfileOut + CandidateProfileUpdate with extra="forbid"), app/routers/candidates.py (GET + PATCH /candidates/me, both require_role("candidate")); router included in main.py. PATCH uses model_dump(exclude_unset=True) so only sent fields update.
- Web: lib/candidate-schema.ts (zod, mirrors API field-for-field), app/candidate/profile/page.tsx (server component: getSession → authed GET), profile-form.tsx (react-hook-form + zodResolver, Controller for Select/Switch, sonner toast, reset(saved) clears dirty). Installed react-hook-form 7.81, zod 4.4, @hookform/resolvers 5.4, shadcn switch.
- Global <Toaster/> moved to root layout (removed the dev-only one from /styleguide to avoid double toasts)
- QA all green (live stack): GET returns profile; PATCH persists (verified re-GET + DB row = QA Candidate/Ahmedabad/3.5/full_time/true); negative years → 422, >50 → 422, unknown field → 422 (extra_forbidden), unknown job_type → 422; recruiter token → 403; no token → 401; web page 200 with all fields + values + placeholders
- Commit: feat(candidate): profile crud

### Decisions
- PROFILE FIELDS LOCKED (hard-filter inputs for Phase 8 matcher — changing them later means touching the matcher): full_name (req, 1-200), headline (≤200, nullable), location (≤120, nullable), years_experience (0-50, nullable), desired_job_type (full_time|part_time|contract|internship, nullable), open_to_remote (bool)
- Server rejects what client rejects: zod on the client, pydantic extra="forbid" + ge/le + Literal on the server — never trust the browser
- Select can't hold empty value → NONE sentinel "__none__" maps to/from null; empty text inputs setValueAs → null
- Authed API calls: server component uses getSession().access_token; client form same via browser supabase client. api-client stays the only fetch path; Authorization passed per-call.

### Key values for future steps
- Endpoints: GET/PATCH /candidates/me (candidate-only)
- Reusable form pattern: rhf + zodResolver + Field/FieldError + Controller for Select/Switch + reset(saved) + sonner
- Adding a profile field = schema (both sides) + form control + (if it needs a column) a migration

---

## Step 5.2 — Resume Upload → Storage → Parse Kickoff
**Timestamp:** 2026-07-12T15:40:00Z
**Status:** COMPLETE

### What was done
- Manual: created private Supabase Storage bucket `resumes`; SUPABASE_SERVICE_ROLE_KEY (sb_secret_) added to apps/api/.env
- API deps: supabase 2.31.0, python-multipart added to requirements
- app/core/storage.py: lru_cached service-role supabase client; upload_resume / download_resume against bucket "resumes" (BUCKET const)
- app/routers/resumes.py: POST /resumes (multipart; ext AND content-type must both match .pdf/.docx, ≤5MB, non-empty; upload to {user_id}/{uuid}.{ext}; insert row status=uploaded; BackgroundTasks parse_resume; returns {id,status}). GET /resumes/latest (candidate's newest or null). GET /resumes/{id} (owner-only, 404 not 403 for non-owner). All require_role("candidate").
- app/workers/tasks.py: parse_resume STUB (own SessionLocal session — bg task runs after response; set parsing → sleep 2s → parsed with empty parsed_json; try/except flips to failed+error_message on any exception). Real pipeline = 5.3.
- app/schemas/resume.py: ResumeOut. Router wired in main.py.
- Web: lib/upload-resume.ts (XHR uploader with real progress — the one authed call that bypasses api-client, justified by multipart+progress; getResumeStatus; getAccessToken). app/candidate/resume/page.tsx (server: GET /resumes/latest → initial). resume-upload.tsx (react-dropzone accept pdf/docx + maxSize 5MB with per-code rejection toasts; XHR progress bar; poll GET /{id} every 2s until parsed/failed; MAX_POLLS=15 → 30s timeout trips to error+Retry so a died bg task never hangs the UI; Retry resets to dropzone).
- QA all green (live Supabase + storage): PDF + DOCX upload → uploaded→parsed; PNG → 415, 6MB → 413 (server-side); file at {user_id}/{uuid}.ext confirmed in bucket listing; non-owner candidate → 404, recruiter → 403, no token → 401; /resumes/latest → parsed; kill-mid-parse leaves row stuck 'parsing' → fresh upload recovers to parsed (UI timeout handles the stuck-row UX).
- Commit: feat(resume): upload to storage + background parse kickoff

### Decisions
- Storage path convention: {user_id}/{uuid}.{ext} in private bucket `resumes`; all access server-mediated via service role (no public policies)
- Poll interval 2s; non-owner access returns 404 not 403 so resource existence never leaks
- KNOWN LIMITATION ACCEPTED: FastAPI BackgroundTasks runs in-process and dies with the process → a resume can be left stuck at 'parsing'. Acceptable at this scale; UI 30s poll-timeout + Retry (re-upload) covers it. Upgrade path if ever needed: arq + Redis.
- Upload bypasses api-client via XHR only because fetch can't report upload progress; every other web→api call still goes through api-client
- .docx content-type also accepts application/octet-stream (some browsers send it for docx)

### Key values for future steps
- Resume statuses drive everything downstream: uploaded → parsing → parsed/failed (StatusBadge already maps them)
- 5.3 replaces the parse_resume STUB body (extraction + Groq structuring) — signature/status-contract stays; download_resume(path) is ready
- Endpoints: POST /resumes, GET /resumes/latest, GET /resumes/{id} (all candidate-only)
- Second test candidate: qa.candidate2.52@example.com (for owner/non-owner tests)

---

## Step 5.3 — Parse Pipeline: Extract → Groq Structuring (blank-first)
**Timestamp:** 2026-07-12T16:30:00Z
**Status:** COMPLETE

### What was done
- Manual: GROQ_API_KEY (gsk_) added to apps/api/.env. Deps: pdfplumber 0.11.10, python-docx, groq 1.5.0.
- app/schemas/resume_parsed.py: ParsedResume (Contact, Experience, Education nested) — EVERY field optional, lists default [], extra="ignore"
- app/services/llm_client.py: THE single Groq gateway. chat_json(system, user, model: type[T]) — response_format json_object, temp 0.1, model from GROQ_MODEL; on invalid JSON / ValidationError retries ONCE with the error appended, then raises. TypeVar (not PEP 695 generics — keeps ruff py311 floor). lru_cached client.
- app/services/resume_parser.py: extract_text(bytes, ext) — pdfplumber page-join (PDF) / python-docx paragraph-join (DOCX), whitespace-normalized; <200 chars → ParseError("Could not read text — is this a scanned/image PDF?"). structure_resume() builds the blank-first system prompt + schema hint → chat_json.
- app/workers/tasks.py: STUB replaced — download → extract → structure → persist raw_text + parsed_json + skills (denormalized), status=parsed. ParseError → failed with its friendly message; any other exception → logged + generic friendly message. Own SessionLocal (bg task).
- QA all green (live Groq + storage): rich DOCX → full sensible JSON (contact, 10 skills, 2 roles, education, cert, total_years_estimate 5.0, resume.skills populated); sparse DOCX → phone null + certifications [] (BLANK-FIRST PASS, nothing invented); scanned/low-text PDF → status failed with exact scanned-PDF message; retry-once proven (throwaway impossible schema → exactly 2 attempts logged then clean ValidationError raise).
- Commit: feat(ai): resume parse pipeline — extract + groq structuring, blank-first

### Decisions
- BLANK-FIRST POLICY (verbatim, in the system prompt AND enforced by all-optional pydantic — same convention as the Siko resume parser, deliberate reuse): "If a field is not explicitly present in the resume, return null. Never infer or fabricate values."
- Model llama-3.3-70b-versatile (GROQ_MODEL), temperature 0.1, retry-once on invalid JSON/schema
- llm_client.py is the SINGLE Groq gateway — no other file may import groq (grep-enforced: only llm_client imports it)
- retry-once tested via a throwaway impossible schema (not by mutating production code) — proves 1 retry + clean raise, nothing to revert
- resume.skills column populated from parsed.skills here (denormalized for the Phase 8 matcher)

### Key values for future steps
- parsed_json shape = ParsedResume (contact{name,email,phone,location}, summary, skills[], experience[{title,company,start,end,current,bullets[]}], education[{degree,institution,year}], certifications[], total_years_estimate)
- 5.4 review UI reads resumes.parsed_json + raw_text; edits write back
- Groq call inventory: #1 resume structuring (llm_client.chat_json). Future LLM calls go through the same gateway.
- ats_score/ats_breakdown still null (Phase 6); embedding still null (Phase 7)

---

## Step 5.4 — Parsed Resume Review UI
**Timestamp:** 2026-07-12T17:15:00Z
**Status:** COMPLETE

### What was done
- API: ResumeOut now includes parsed_json (so the review UI gets sections). New endpoints (owner-only, 404-not-403 via shared _owned_or_404 helper): PATCH /resumes/{id}/skills (full-list replace, trim + case-insensitive dedupe preserving order → resume.skills) and POST /resumes/{id}/reparse (resets status, re-kicks parse_resume). SkillsUpdate schema (extra="forbid").
- Web lib/upload-resume.ts: ParsedResume TS type (mirrors pydantic), ResumeStatus extended (skills, parsed_json), reparseResume + updateSkills clients.
- resume-review.tsx: sectioned cards — Contact (name/email/phone/location + summary), Skills (editable chip editor), Experience (vertical timeline with bullets), Education, Certifications. Every missing section renders honest text ("No certifications found in your resume") not a blank hole. Re-parse + Re-upload actions.
- resume-upload.tsx: state machine now renders <ResumeReview> on the parsed phase; onReparse (POST reparse → poll live through parsing→parsed) and onReupload (reset to dropzone). Parse-status banner already covers uploaded/parsing.
- SkillsEditor: optimistic add/remove, PATCH per change, revert + toast on failure.
- QA all green (live): rich resume renders every section incl. real certs + timeline; skills add/remove persist across re-GET; case-insensitive dedupe ("Python","python","PYTHON" → one); reparse walks uploaded→parsing→parsed live; non-owner PATCH skills AND reparse both → 404; sparse resume renders "No certifications found in your resume" + name + its one experience (honest empty proven).
- Commit: feat(resume): parsed review ui + skills editing

### Decisions
- v1 EDIT SCOPE = SKILLS ONLY. Full parsed-field editing (contact/experience/education/certs) DEFERRED. Rationale: skills are the only parsed field that feeds the Phase 8 matcher (resume.skills column); everything else is display-only for trust. Editing them would be pure UI polish with no matching impact — YAGNI until asked.
- Skills chips edit the resume.skills COLUMN (matcher-facing, editable); parsed_json stays the immutable parse record. Other sections render from parsed_json (display-only).
- Re-upload = new POST /resumes (new row, becomes latest); Re-parse = POST /reparse (same file, same row). Both re-run the pipeline.
- No animation library on the review UI — legibility/trust over motion (ponytail + ui-ux: right call for a data-review surface)

### Key values for future steps
- Endpoints now: PATCH /resumes/{id}/skills, POST /resumes/{id}/reparse (both candidate owner-only)
- resume.skills is the editable matcher input; parsed_json is the read-only parse record
- Review sections live in app/candidate/resume/resume-review.tsx

---

## Step 6.1 — Deterministic ATS Scorer
**Timestamp:** 2026-07-12T18:05:00Z
**Status:** COMPLETE

### What was done
- app/services/ats_scorer.py: score_resume(parsed, raw_text) → AtsResult(total, checks[Check{name,score,max,detail}]). PURE FUNCTION — no I/O, no LLM. total = sum of already-rounded parts (so parts always sum to total).
- Wired into workers/tasks.py parse pipeline after structuring: persists resume.ats_score + resume.ats_breakdown (JSONB).
- GET /resumes/{id}/ats-score (owner-only, 404 else) → {status, score, breakdown}.
- tests/test_ats_scorer.py: strong/weak/near-empty fixtures with PINNED golden totals (100.0 / 37.15 / 4.07) + determinism + parts-sum-to-total + monotonic (strong>weak>empty) + bounds + no-crash. Runnable via venv python directly (no pytest dep) and pytest-discoverable.
- QA all green: unit tests pass; grep confirms scorer imports no llm_client/groq; live end-to-end — real resume scored 71.6, breakdown total == parts sum == persisted score; scorer bit-identical on the same parse; non-owner ATS → 404.
- Commit: feat(ats): deterministic scorer with breakdown

### Decisions
- ATS scoring is RULE-BASED ON PURPOSE — reproducible + explainable beats clever. Same resume → same score, every point traces to a named check. LLM deliberately NOT used (grep-enforced).
- WEIGHTS (verbatim, sum=100): Contact completeness 15 (4 fields × 3.75) · Core sections present 20 (summary/skills/experience/education × 5) · Quantified bullets 20 (ratio of bullets containing a digit × 20) · Skills count 15 (ideal band 8–20 = full; below = linear; above = mild floor-11 penalty) · Length 10 (ideal 300–900 words; outside = linear penalty, floor 5) · Extraction formatting 10 (penalize short-line fragmentation + surviving table pipes) · Action verbs 10 (ratio of bullets starting with a fixed action-verb list × 10)
- Determinism guarantee is STRUCTURAL: score_resume is a pure function; the unit test pins golden totals. (End-to-end reparse can vary only if Groq's parse differs — the scorer itself never does.)
- Formatting check is a heuristic with a known ceiling (ponytail comment in code) — runs on the normalized raw_text; upgrade path = layout-aware pdfplumber extract_words if it ever matters.

### Key values for future steps
- ats_breakdown JSONB shape = {total: float, checks: [{name, score, max, detail}]}
- Endpoint: GET /resumes/{id}/ats-score (candidate owner-only)
- Dashboard payoff (later this phase) reads resume.ats_score + ats_breakdown
- Run tests: apps/api/.venv/Scripts/python.exe apps/api/tests/test_ats_scorer.py

---

## Step 6.2 — Skill Extraction & Taxonomy Normalization
**Timestamp:** 2026-07-12T18:55:00Z
**Status:** COMPLETE

### What was done
- app/services/skill_extractor.py: extract_skills(db, parsed, raw_text) unions source A (parsed.skills, listed) + source B (mine_skills — one Groq pass over raw_text for skills DEMONSTRATED in bullets, via llm_client → Groq call #2), then normalize_skills.
- normalize_one/normalize_skills(db, names): trim → ALIASES map (lowercased→canonical) → case-insensitive taxonomy match → unmatched INSERT as category=uncategorized, flagged=True (savepoint-guarded against concurrent insert). Dedupe case-insensitive, order-preserving.
- Wired into workers/tasks.py parse pipeline: resume.skills = extract_skills(...) (replaced the raw parsed.skills assignment) — runs after structuring, before embedding (Phase 7).
- mine_skills is BEST-EFFORT: Groq failure → [] + warn, never fails the whole parse (structuring already succeeded).
- QA all green: normalize (js/JS/JavaScript→JavaScript, postgres/psql→PostgreSQL, FastAPI pass-through, new skill→flagged uncategorized, re-normalize no dup); live end-to-end — resume listing only "Python, SQL" but with FastAPI/Docker/AWS/PostgreSQL in bullets → final resume.skills=[Python,SQL,FastAPI,Docker,AWS,PostgreSQL] (canonical casing), no duplicates on reparse. ATS tests still pass (scorer uses parsed.skills, unchanged).
- Commit: feat(ai): skill extraction + taxonomy normalization

### Decisions
- SINGLE NORMALIZER: normalize_skills() in skill_extractor.py is shared by the resume AND job pipelines (Phase 7.3 reuses it). Divergence silently breaks matching → there is exactly one, here.
- ALIAS MAP location: skill_extractor.py ALIASES dict. GROWTH RULE: add aliases as you meet them, ALWAYS in that one dict. Case variants need NO entry (taxonomy match is case-insensitive) — only abbreviations/alternate spellings (js, k8s, postgres, nextjs...).
- Unmatched skills are inserted flagged=uncategorized (not dropped) so the taxonomy grows and flagged skills can be curated later.
- resume.skills now = normalized union (matcher input); parsed_json.skills stays the raw LLM-listed set. ATS scorer still reads parsed.skills (pinned scores unchanged).
- mine_skills failure is non-fatal (bonus pass) — degrades to listed skills only.

### Key values for future steps
- Groq call inventory now = 2: #1 resume structuring (resume_parser), #2 skill mining (skill_extractor)
- Phase 7.3 job pipeline MUST import normalize_skills from app.services.skill_extractor (one normalizer)
- resume.skills is canonical, deduped, taxonomy-aligned — ready as the Phase 8 matcher's skill-overlap input

---

## Step 6.3 — Embeddings via fastembed
**Timestamp:** 2026-07-12T19:45:00Z
**Status:** COMPLETE

### What was done
- requirements: fastembed 0.8.0. app/services/embedding_service.py: lazy singleton TextEmbedding(BAAI/bge-small-en-v1.5, cache_dir=FASTEMBED_CACHE); warmup(), model_loaded(), embed_text(text)→list[float] len 384; build_resume_embed_text(parsed, skills); _top_bullets (quantified-first, deterministic).
- Parse task extended: after skills → embed_text(build_resume_embed_text(...)) → resume.embedding (384-dim).
- main.py: FastAPI lifespan warms the model at startup; /health now returns {"status":"ok","model_loaded":bool} (Phase 14 monitoring).
- scripts/backfill_embeddings.py: idempotently embeds parsed resumes with NULL embedding; second run no-op.
- .gitignore: .fastembed_cache/
- QA all green: warmup + embed → 384-dim; /health model_loaded=true after boot; fresh parse → vector_dims(embedding)=384, non-null; backfill filled 3 nulls (incl. older pre-embedding resumes) then run 2 = "0 needing" (no-op); MEASURED WARMUP RSS = 220.5 MB working set (peak 251 MB), 43% of the 512MB ceiling, 291MB headroom.
- Commit: feat(ai): fastembed embeddings + warmup + backfill

### Decisions
- MODEL: BAAI/bge-small-en-v1.5, 384-dim, ONNX via fastembed — chosen over sentence-transformers to avoid the PyTorch footprint on the 512MB free tier. Measured RSS 220MB confirms the fit.
- EMBED-TEXT TEMPLATE (VERBATIM — the JOB side must mirror this in 7.3 so both vectors share one semantic space):
    "{summary or contact.name or 'Candidate'}. {total_years_estimate or 0} years experience. Skills: {skills csv}. {up to 5 strongest bullets}"
  "strongest bullets" = quantified (digit-containing) bullets first, then the rest, original order within each group, capped at 5 — deterministic.
- Lazy singleton + lifespan warmup: model loads once at startup; embed_text warms lazily as a safety net.
- FASTEMBED_CACHE: .fastembed_cache locally (gitignored); set to /tmp/fastembed on Render (ephemeral disk).

### Key values for future steps
- embed_text(text)→384 floats; build_resume_embed_text(parsed, skills) for resumes
- Phase 7.3: build_job_embed_text must produce the SAME template shape ({lead}. {years} years experience. Skills: {csv}. {free text}) — mirror it or matching degrades
- resumes.embedding is now populated on every parse; backfill script covers historical rows
- /health.model_loaded is the readiness signal for Phase 14

---

## Step 6.4 — Candidate Dashboard v1
**Timestamp:** 2026-07-12T20:40:00Z
**Status:** COMPLETE

### What was done
- API: GET /candidates/me/overview — ONE round trip: {profile, resume_status, ats_score, improvements (3 lowest-ratio IMPERFECT checks straight from ats_breakdown — no invented advice), skills, completeness{profile_complete, resume_uploaded, resume_parsed}}. profile_complete = location + years_experience + desired_job_type set (the hard-filter fields).
- Schemas: Improvement, Completeness, CandidateOverview in app/schemas/candidate.py. FIX: CandidateProfileOut needed from_attributes=True — FastAPI coerces bare response models from ORM objects, but NESTED models constructed manually don't (500 caught by QA).
- Web app/candidate/dashboard/: dashboard-cards.tsx (Overview type + ScoreCard big mono score w/ top-3 actionable lines · SkillsCard chips + edit link · CompletenessCard checklist, unmet items link to their fix · NewAccountFunnel EmptyState pointing at profile + upload), page.tsx (server component, exactly one api() call), loading.tsx (SkeletonCards mirroring the loaded 2-col grid — no layout shift on swap).
- Branching: no resume uploaded → funnel (with Fill profile CTA only if profile incomplete); else cards.
- QA all green: complete account renders 71.60 + all 3 improvements verbatim (verified equal to ats_breakdown details in DB) + skills + checklist, no funnel; fresh account renders funnel + both CTAs and NO cards (early "leak" was a probe false-positive — funnel copy mentions "ATS score"); page.tsx contains exactly 1 await api(); loading.tsx mirrors layout.
- Commit: feat(candidate): dashboard v1

### Decisions
- OVERVIEW ENDPOINT SHAPE (locked): future dashboard cards EXTEND CandidateOverview — never add new dashboard API calls. One round trip is the contract.
- Improvements = 3 lowest score/max ratio checks where score < max, details passed through verbatim from the breakdown (explainability chain: scorer → breakdown → dashboard, unbroken)
- No animation library for the score display — a clear big tabular-mono number beats a count-up dependency (ponytail)

### Key values for future steps
- GET /candidates/me/overview is THE dashboard feed; extend its schema for new cards (e.g. Phase 8 match counts)
- Funnel logic: !resume_uploaded → NewAccountFunnel; completeness booleans drive the checklist
- Components: dashboard-cards.tsx exports Overview type, ScoreCard, SkillsCard, CompletenessCard, NewAccountFunnel

---

## Step 7.1 — Company & Recruiter Onboarding
**Timestamp:** 2026-07-12T21:30:00Z
**Status:** COMPLETE

### What was done
- API app/routers/companies.py (+ schemas/company.py): POST /companies (201; creates company + links caller via recruiter_profiles row with full_name from profile; 409 if already linked), GET /companies/me (404 = no company yet — the onboarding trigger), PATCH /companies/me (partial, extra=forbid). All require_role("recruiter").
- Web restructure: recruiter pages moved into app/recruiter/(shell)/ route group (URLs unchanged). (shell)/layout.tsx now GETs /companies/me and redirects to /recruiter/onboarding when absent. Onboarding lives OUTSIDE the group (no sidebar, no redirect loop) and itself redirects onboarded recruiters to the dashboard — forced exactly once, both directions.
- components/company-form.tsx: one reusable rhf+zod form, mode="create" (POST → dashboard) | mode="edit" (PATCH → toast + reset). lib/company.ts zod schema mirrors API. shadcn textarea added.
- (shell)/company/page.tsx: detail + edit using the same form.
- QA all green: fresh recruiter (new test user qa.recruiter3.71) → dashboard AND company both 307 → onboarding, onboarding renders form; onboarded recruiter → dashboard 200, onboarding 307 → dashboard, company page renders QA Talent Co + edited about; API: 404-before, create-201, second POST 409, PATCH persists, candidate 403 on all three endpoints. (QA hiccup: a stale uvicorn from 6.4 was squatting port 8000 serving pre-companies routes — killed, re-ran clean.)
- Commit: feat(recruiter): company onboarding

### Decisions
- V1 CONSTRAINT: one recruiter = one company (the recruiter_profiles row IS the link; its existence = onboarded). Teams/multi-recruiter-per-company explicitly DEFERRED — no invites, roles, or membership tables until a real need exists.
- Onboarding gate lives in the (shell) LAYOUT (route group keeps URLs identical) — pages inside the shell can assume a company exists
- GET /companies/me 404 doubles as the onboarding signal — no separate "has_company" flag

### Key values for future steps
- 7.2 job CRUD: recruiter's company = recruiter_profiles.company_id (guaranteed by the shell gate + 409 invariant)
- Test recruiters: qa.recruiter.33 (company: QA Talent Co) · qa.recruiter3.71 (fresh, NO company — keep for onboarding regression)
- Seeded recruiters (Ananya/Rohan) already have companies via seed — consistent with the one-recruiter-one-company invariant

---
