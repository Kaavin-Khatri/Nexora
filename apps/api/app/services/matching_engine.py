"""v1 matcher: hard filters in SQL first, pgvector ANN cosine on the survivors.

Two symmetric queries — candidates for a job, jobs for a candidate. v1 score =
pure cosine similarity (1 - distance). LIMIT 50 is the retrieval budget: it is
also the rerank pool size for 8.2's hybrid scorer.

Filter semantics (both directions, mirrored):
  - experience: coalesce(candidate_years, 0) >= coalesce(job_min_experience, 0)
  - job type:   strict equality when both sides state one; a side with NULL
                (no preference / unspecified) relaxes the constraint
  - location:   remote job OR remote-open candidate OR ILIKE location match
Enums are compared as ::text to avoid enum-vs-text operator errors on binds.
"""

from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.models import Job, Profile, Resume

RETRIEVAL_LIMIT = 50  # rerank pool size for 8.2

CANDIDATES_FOR_JOB_SQL = text("""
SELECT p.user_id, p.full_name, p.years_experience, r.id AS resume_id, r.skills,
       1 - (r.embedding <=> CAST(:emb AS vector)) AS similarity
FROM profiles p
JOIN LATERAL (
  SELECT r2.id, r2.skills, r2.embedding
  FROM resumes r2
  WHERE r2.candidate_id = p.user_id
    AND r2.status = 'parsed' AND r2.embedding IS NOT NULL
  ORDER BY r2.created_at DESC
  LIMIT 1
) r ON true
WHERE p.role = 'candidate'
  AND coalesce(p.years_experience, 0) >= coalesce(:min_experience, 0)
  AND (CAST(:job_type AS text) IS NULL OR p.desired_job_type IS NULL
       OR p.desired_job_type::text = :job_type)
  AND (:remote OR p.open_to_remote
       OR (CAST(:loc AS text) IS NOT NULL AND p.location ILIKE :loc))
ORDER BY r.embedding <=> CAST(:emb AS vector)
LIMIT :lim
""")

JOBS_FOR_CANDIDATE_SQL = text("""
SELECT j.id, j.title, j.location, j.remote, j.job_type, j.min_experience,
       j.required_skills, c.name AS company_name,
       1 - (j.embedding <=> CAST(:emb AS vector)) AS similarity
FROM jobs j
JOIN companies c ON c.id = j.company_id
WHERE j.status = 'open' AND j.embedding IS NOT NULL
  AND coalesce(:years, 0) >= coalesce(j.min_experience, 0)
  AND (CAST(:desired AS text) IS NULL OR j.job_type IS NULL OR j.job_type::text = :desired)
  AND (j.remote OR :open_remote
       OR (CAST(:loc AS text) IS NOT NULL AND j.location ILIKE :loc))
ORDER BY j.embedding <=> CAST(:emb AS vector)
LIMIT :lim
""")


def _vec(embedding: Any) -> str:
    # pgvector text input: '[f1,f2,...]'
    return "[" + ",".join(str(float(x)) for x in embedding) + "]"


def candidates_for_job(db: Session, job: Job) -> list[dict]:
    rows = db.execute(
        CANDIDATES_FOR_JOB_SQL,
        {
            "emb": _vec(job.embedding),
            "min_experience": float(job.min_experience) if job.min_experience is not None else None,
            "job_type": job.job_type,
            "remote": bool(job.remote),
            "loc": f"%{job.location}%" if job.location else None,
            "lim": RETRIEVAL_LIMIT,
        },
    ).mappings()
    return [dict(r) for r in rows]


def jobs_for_candidate(db: Session, profile: Profile, resume: Resume) -> list[dict]:
    rows = db.execute(
        JOBS_FOR_CANDIDATE_SQL,
        {
            "emb": _vec(resume.embedding),
            "years": float(profile.years_experience)
            if profile.years_experience is not None
            else None,
            "desired": profile.desired_job_type,
            "open_remote": bool(profile.open_to_remote),
            "loc": f"%{profile.location}%" if profile.location else None,
            "lim": RETRIEVAL_LIMIT,
        },
    ).mappings()
    return [dict(r) for r in rows]
