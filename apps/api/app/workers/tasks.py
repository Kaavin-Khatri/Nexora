import os
import uuid

from app.core.storage import download_resume
from app.db.models import Resume
from app.db.session import SessionLocal
from app.services.ats_scorer import score_resume
from app.services.embedding_service import build_resume_embed_text, embed_text
from app.services.resume_parser import ParseError, extract_text, structure_resume
from app.services.skill_extractor import extract_skills

import structlog
from app.core.logging import bind_contextvars

logger = structlog.get_logger(__name__)


def parse_resume(resume_id: uuid.UUID) -> None:
    """Real parse pipeline: download → extract text → Groq structuring → persist.

    Runs in-process after the HTTP response (FastAPI BackgroundTasks), so it
    MUST open its own DB session. Any failure flips the row to status=failed
    with a human-readable error_message — a raised error never leaves a row
    stuck at 'parsing'.
    """
    bind_contextvars(resume_id=str(resume_id))
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

        # canonical, taxonomy-normalized union of listed + demonstrated skills
        skills = extract_skills(db, parsed, raw_text)
        ats = score_resume(parsed, raw_text)
        embedding = embed_text(build_resume_embed_text(parsed, skills))

        resume.raw_text = raw_text
        resume.parsed_json = parsed.model_dump()
        resume.skills = skills or None  # matcher input (Phase 8)
        resume.ats_score = ats.total
        resume.ats_breakdown = ats.model_dump()
        resume.embedding = embedding  # 384-dim, same space jobs join in Phase 7
        resume.status = "parsed"
        db.commit()
        logger.info("resume_parsed_success")
    except ParseError as exc:
        logger.warning("resume_parse_error", error=str(exc))
        _fail(db, resume_id, str(exc))
    except Exception as exc:  # noqa: BLE001
        logger.exception("resume_parse_failure")
        _fail(db, resume_id, "Something went wrong while reading your resume. Please try again.")
    finally:
        db.close()


def _fail(db, resume_id: uuid.UUID, message: str) -> None:
    db.rollback()
    resume = db.get(Resume, resume_id)
    if resume is not None:
        resume.status = "failed"
        resume.error_message = message[:500]
        db.commit()
