"""Skill extraction + taxonomy normalization.

Two sources are unioned then normalized against the skills taxonomy:
  A) skills the resume LISTS (parsed.skills)
  B) skills DEMONSTRATED in experience bullets (one Groq pass — llm_client)

normalize_skills() is the SINGLE normalizer for BOTH the resume and the job
pipelines (Phase 7.3 reuses it). Divergence here silently breaks matching — so
there is exactly one, here.
"""

import logging

from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.models import Skill
from app.schemas.resume_parsed import ParsedResume
from app.services.llm_client import chat_json

logger = logging.getLogger("nexora.skills")

# Alias map: lowercased input → canonical taxonomy name. GROWTH RULE: add
# aliases as you meet them, ALWAYS here — this is the one place. Case variants
# (Javascript vs JavaScript) do NOT need entries; the taxonomy match is
# case-insensitive. Only abbreviations / alternate spellings belong here.
ALIASES: dict[str, str] = {
    "js": "JavaScript",
    "ts": "TypeScript",
    "py": "Python",
    "python3": "Python",
    "golang": "Go",
    "cpp": "C++",
    "csharp": "C#",
    "c sharp": "C#",
    "postgres": "PostgreSQL",
    "psql": "PostgreSQL",
    "postgres sql": "PostgreSQL",
    "next": "Next.js",
    "nextjs": "Next.js",
    "node": "Node.js",
    "nodejs": "Node.js",
    "reactjs": "React",
    "react.js": "React",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "k8s": "Kubernetes",
    "ml": "Machine Learning",
    "dl": "Deep Learning",
    "sklearn": "scikit-learn",
    "scikit learn": "scikit-learn",
    "tf": "TensorFlow",
    "rest": "REST APIs",
    "restful": "REST APIs",
    "rest api": "REST APIs",
    "gh actions": "GitHub Actions",
    "ci cd": "CI/CD",
    "cicd": "CI/CD",
    "gpt": "LLMs",
    "llm": "LLMs",
}


def normalize_one(db: Session, raw_name: str) -> str | None:
    """One raw skill string → its canonical taxonomy name. Unknown skills are
    inserted into the taxonomy as category=uncategorized, flagged=True."""
    clean = " ".join(raw_name.strip().split())
    if not clean or len(clean) > 60:  # guard against sentences / junk
        return None
    candidate = ALIASES.get(clean.lower(), clean)

    existing = db.scalar(select(Skill).where(func.lower(Skill.name) == candidate.lower()))
    if existing:
        return existing.name

    # New skill → insert flagged. Savepoint so a concurrent insert can't kill
    # the outer parse transaction.
    try:
        with db.begin_nested():
            db.add(Skill(name=candidate, category="uncategorized", flagged=True))
        return candidate
    except IntegrityError:
        existing = db.scalar(select(Skill).where(func.lower(Skill.name) == candidate.lower()))
        return existing.name if existing else candidate


def normalize_skills(db: Session, names: list[str]) -> list[str]:
    """Normalize + dedupe (case-insensitive, order-preserving). SHARED by resume
    and job pipelines — keep it the only normalizer."""
    out: list[str] = []
    seen: set[str] = set()
    for name in names:
        canon = normalize_one(db, name)
        if canon and canon.lower() not in seen:
            seen.add(canon.lower())
            out.append(canon)
    return out


class _MinedSkills(BaseModel):
    skills: list[str] = []


_MINE_SYSTEM = (
    "You extract technical and professional skills that are DEMONSTRATED in a "
    "resume's experience/work bullets, even if they are not listed in a skills "
    'section. Return a JSON object: {"skills": ["...", ...]}. '
    "Only include skills clearly evidenced by the text — never invent skills. "
    "Return an empty list if none. Prefer concrete tools/technologies over vague terms."
)


def mine_skills(raw_text: str) -> list[str]:
    """Groq pass for skills demonstrated in bullets. Best-effort: if it fails,
    fall back to listed skills only rather than failing the whole parse."""
    try:
        return chat_json(_MINE_SYSTEM, f"Resume text:\n{raw_text}", _MinedSkills).skills
    except Exception:  # noqa: BLE001 — mining is a bonus; never fail the parse for it
        logger.warning("skill mining failed; using listed skills only")
        return []


def extract_skills(db: Session, parsed: ParsedResume, raw_text: str) -> list[str]:
    listed = parsed.skills or []
    mined = mine_skills(raw_text)
    return normalize_skills(db, [*listed, *mined])
