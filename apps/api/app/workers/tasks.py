import time
import uuid

from app.db.models import Resume
from app.db.session import SessionLocal


def parse_resume(resume_id: uuid.UUID) -> None:
    """Background parse. STUB until 5.3 (real pdfplumber/docx + Groq pipeline).

    Runs in-process after the HTTP response (FastAPI BackgroundTasks), so it
    MUST open its own DB session — the request's get_db session is already
    closed. Any exception flips the row to status=failed with the message, so
    a stuck 'parsing' never happens from a raised error.
    """
    db = SessionLocal()
    try:
        resume = db.get(Resume, resume_id)
        if resume is None:
            return
        resume.status = "parsing"
        db.commit()

        time.sleep(2)  # ponytail: stand-in for the real pipeline (5.3)

        resume.parsed_json = {}
        resume.status = "parsed"
        db.commit()
    except Exception as exc:  # noqa: BLE001 — any failure must be recorded, not swallowed silently
        db.rollback()
        resume = db.get(Resume, resume_id)
        if resume is not None:
            resume.status = "failed"
            resume.error_message = str(exc)[:500]
            db.commit()
    finally:
        db.close()
