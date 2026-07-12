from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Anchor to apps/api/.env regardless of CWD (pnpm dev:api runs from repo root).
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

    # Required from Phase 2 on
    DATABASE_URL: str  # Supavisor transaction pooler, port 6543 — app runtime
    DIRECT_DATABASE_URL: str  # direct connection, port 5432 — Alembic migrations ONLY

    # Rest of the registry, optional until their phase arrives
    SUPABASE_URL: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    SUPABASE_JWT_SECRET: str | None = None
    GROQ_API_KEY: str | None = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    FASTEMBED_CACHE: str = ".fastembed_cache"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()


def sqlalchemy_url(url: str) -> str:
    # Supabase gives postgresql:// strings; SQLAlchemy would pick psycopg2.
    # Rewrite once here so pasted strings just work with psycopg 3.
    return url.replace("postgresql://", "postgresql+psycopg://", 1)
