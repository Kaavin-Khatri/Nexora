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

## Production Migrations (Render + Supabase)

Because the API runs on Render's Free Tier (which does not provide a shell to run commands), **database migrations must be executed from your local machine** before deploying code that relies on those schema changes.

**Workflow:**
1. From your local terminal, ensure your `.env` contains the production `DIRECT_DATABASE_URL` (Port 5432, Session pooler or direct IPv6).
2. Run the migration locally against the production database:
   ```powershell
   cd apps/api
   .venv\Scripts\Activate.ps1
   alembic upgrade head
   ```
3. Push your code to GitHub. Render will automatically pull the code and deploy the API, which will now use the successfully migrated database schema.

## Demo Kit (Live Presentation Prep)

Nexora runs on $0 free-tier cloud services, which means cold-starts and pausing behavior are reality. To ensure a flawless live demo, perform this ritual **exactly 10 minutes before any demo**:

1. **Wake the Database:** Supabase free-tier projects pause if unused for ~1 week. Log into your Supabase dashboard or just hit the `/health/db` endpoint to ensure the database is awake.
2. **Wake the API:** Render spins down free web services after 15 minutes of inactivity. Keep your UptimeRobot monitor active (pinging `/health` every 5 mins). Manually hit your `NEXT_PUBLIC_API_URL` to guarantee it's warm. The initial spin-up can take 50 seconds.
3. **Pre-Load Accounts:** Open two separate browser profiles (or one incognito window).
   - Log into the Recruiter demo account. Navigate to the job dashboard and open the Applicant Table so it is fully rendered.
   - Log into the Candidate demo account. Navigate to the Candidate dashboard.
4. **No Surprises:** Run a quick test action (like applying for a fake job) to ensure the Groq API and Supabase Auth are responding instantly.
