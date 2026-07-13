"""Idempotently embed any parsed resume whose embedding is NULL.

Second run is a no-op (no NULLs left). Run from apps/api:
    .venv/Scripts/python.exe scripts/backfill_embeddings.py
"""

import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from sqlalchemy import create_engine, select  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.core.config import settings, sqlalchemy_url  # noqa: E402
from app.db.models import Resume  # noqa: E402
from app.schemas.resume_parsed import ParsedResume  # noqa: E402
from app.services.embedding_service import build_resume_embed_text, embed_text, warmup  # noqa: E402


def main() -> None:
    warmup()
    engine = create_engine(sqlalchemy_url(settings.DIRECT_DATABASE_URL))
    with Session(engine) as db:
        # only parsed resumes have parsed_json/skills to embed
        rows = db.scalars(
            select(Resume).where(
                Resume.embedding.is_(None),
                Resume.status == "parsed",
                Resume.parsed_json.is_not(None),
            )
        ).all()
        print(f"resumes needing embedding: {len(rows)}")
        for resume in rows:
            parsed = ParsedResume.model_validate(resume.parsed_json)
            resume.embedding = embed_text(build_resume_embed_text(parsed, resume.skills or []))
            print(f"  embedded {resume.id}")
        db.commit()
    print("done")


if __name__ == "__main__":
    main()
