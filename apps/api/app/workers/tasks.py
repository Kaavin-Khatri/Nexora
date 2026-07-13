import logging
import os
import uuid

from app.core.storage import download_resume
from app.db.models import Resume
from app.db.session import SessionLocal
from app.services.resume_parser import ParseError, extract_text, structure_resume

logger = logging.getLogger("nexora.parse")


def parse_resume(resume_id: uuid.UUID) -> None:
    """Real parse pipeline: download → extract text → Groq structuring → persist.

    Runs in-process after the HTTP response (FastAPI BackgroundTasks), so it
    MUST open its own DB session. Any failure flips the row to status=failed
    with a human-readable error_message — a raised error never leaves a row
    stuck at 'parsing'.
    """
    db = SessionLocal()
    try:
        resume = db.get(Resume, resume_id)
        if resume is None:
            return
        resume.status = "parsing"
        db.commit()

        data = download_resume(resume.file_path)
        ext = os.path.splitext(resume.file_path)[1].lower()
        raw_text = extract_text(data, ext)
        parsed = structure_resume(raw_text)

        resume.raw_text = raw_text
        resume.parsed_json = parsed.model_dump()
        resume.skills = parsed.skills or None  # denormalized for matching (Phase 8)
        resume.status = "parsed"
        db.commit()
    except ParseError as exc:
        _fail(db, resume_id, str(exc))
    except Exception as exc:  # noqa: BLE001 — any failure must be recorded, not swallowed
        logger.exception("parse_resume failed for %s", resume_id)
        _fail(db, resume_id, "Something went wrong while reading your resume. Please try again.")
        _ = exc
    finally:
        db.close()


def _fail(db, resume_id: uuid.UUID, message: str) -> None:
    db.rollback()
    resume = db.get(Resume, resume_id)
    if resume is not None:
        resume.status = "failed"
        resume.error_message = message[:500]
        db.commit()
