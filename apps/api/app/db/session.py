from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings, sqlalchemy_url

# DO NOT "optimize" this pooling setup:
# DATABASE_URL points at Supavisor in TRANSACTION mode (port 6543), which pools
# and reuses server connections for us. Therefore:
#   - NullPool: the app must NOT hold a client-side pool on top of the pooler.
#   - pool_pre_ping: survive Supabase free-tier pauses/wakes.
#   - prepare_threshold=None: transaction pooling breaks server-side prepared
#     statements (a different backend may serve each transaction), so psycopg
#     must never create them.
engine = create_engine(
    sqlalchemy_url(settings.DATABASE_URL),
    poolclass=NullPool,
    pool_pre_ping=True,
    connect_args={"prepare_threshold": None},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
