"""Job ingestion: Groq-structure the description + embed into the shared
384-dim space. Groq call #3 (via llm_client, the single gateway).

Failure semantics: ingestion is best-effort — a failure logs and leaves
embedding NULL, which scripts/backfill_jobs.py can retry. Jobs have no
parse-status field on purpose (the posting itself is already live).
"""

import logging
import uuid

from app.db.models import Job
from app.db.session import SessionLocal
from app.schemas.job_parsed import ParsedJob
from app.services.embedding_service import build_job_embed_text, embed_text
from app.services.llm_client import chat_json
from app.services.skill_extractor import normalize_skills

logger = logging.getLogger("nexora.jobs")

SYSTEM_PROMPT = """You are a precise job-description parser. Read the job description and return a \
single JSON object matching this exact schema:

{"responsibilities": [str], "extracted_skills": [str], "seniority_hint": str|null}

If a field is not explicitly present in the description, return null (or [] for lists). \
Never infer or fabricate values.
- responsibilities: the concrete duties/outcomes of the role, one short sentence each
- extracted_skills: tools/technologies/competencies the text explicitly requires or mentions
- seniority_hint: junior|mid|senior|lead if clearly signalled, else null
Output ONLY the JSON object, no prose."""


def structure_job(description: str) -> ParsedJob:
    return chat_json(SYSTEM_PROMPT, f"Job description:\n{description}", ParsedJob)


def ingest_job(job_id: uuid.UUID) -> None:
    """Full ingest: structure (Groq) → merge skills → embed. Own session
    (runs as a FastAPI BackgroundTask after the response)."""
    db = SessionLocal()
    try:
        job = db.get(Job, job_id)
        if job is None:
            return
        parsed = structure_job(job.description or "")

        # MERGE RULE: recruiter-entered skills are AUTHORITATIVE — kept verbatim
        # (already canonical from CRUD-time normalization) and listed first;
        # extracted skills append after, deduped case-insensitively.
        recruiter_skills = job.required_skills or []
        seen = {s.lower() for s in recruiter_skills}
        extracted = [
            s for s in normalize_skills(db, parsed.extracted_skills) if s.lower() not in seen
        ]
        merged = [*recruiter_skills, *extracted]

        job.parsed_json = parsed.model_dump()
        job.required_skills = merged or None
        job.embedding = embed_text(
            build_job_embed_text(
                job.title,
                float(job.min_experience) if job.min_experience is not None else None,
                merged,
                parsed.responsibilities,
            )
        )
        db.commit()
        logger.info(
            "ingested job %s (%d skills, %d responsibilities)",
            job_id,
            len(merged),
            len(parsed.responsibilities),
        )
    except Exception:  # noqa: BLE001 — best-effort; backfill retries NULL embeddings
        logger.exception("job ingest failed for %s (embedding left NULL)", job_id)
        db.rollback()
    finally:
        db.close()


def reembed_job(job_id: uuid.UUID) -> None:
    """Re-embed ONLY (no Groq): for edits to title/min_experience, which change
    the embed text but not the description being structured."""
    db = SessionLocal()
    try:
        job = db.get(Job, job_id)
        if job is None:
            return
        parsed = ParsedJob.model_validate(job.parsed_json or {})
        job.embedding = embed_text(
            build_job_embed_text(
                job.title,
                float(job.min_experience) if job.min_experience is not None else None,
                job.required_skills or [],
                parsed.responsibilities,
            )
        )
        db.commit()
        logger.info("re-embed only (no Groq) for job %s", job_id)
    except Exception:  # noqa: BLE001
        logger.exception("job re-embed failed for %s", job_id)
        db.rollback()
    finally:
        db.close()
