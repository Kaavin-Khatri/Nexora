"""Idempotently structure + embed every job with a NULL embedding.

Pays the Phase 2 seed debt (6 seeded jobs) and catches any job whose
background ingest failed. Second run is a no-op.

Run from apps/api:  .venv/Scripts/python.exe scripts/backfill_jobs.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from sqlalchemy import select  # noqa: E402

from app.db.models import Job  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.services.job_ingest import ingest_job  # noqa: E402


def main() -> None:
    db = SessionLocal()
    try:
        ids = db.scalars(select(Job.id).where(Job.embedding.is_(None))).all()
    finally:
        db.close()

    print(f"jobs needing ingestion: {len(ids)}")
    for job_id in ids:
        ingest_job(job_id)  # opens its own session; logs success/failure
        print(f"  ingested {job_id}")
    print("done")


if __name__ == "__main__":
    main()
