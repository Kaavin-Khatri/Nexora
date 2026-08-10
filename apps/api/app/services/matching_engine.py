"""Matcher: hard filters in SQL, pgvector ANN cosine, then hybrid rerank.

Two symmetric queries — candidates for a job, jobs for a candidate — retrieve a
LIMIT-50 ANN pool, which score_pair reranks:

    score = W_SIM * embedding_sim + W_SKILL * skill_overlap + W_EXP * exp_fit

Every result carries an explainable breakdown (components, matched/missing
skills, the weights actually used). Weights live in Settings (env-tunable).

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

from app.core.config import settings
from app.db.models import Job, Profile, Resume

RETRIEVAL_LIMIT = 50  # ANN pool size fed to the rerank
IDEAL_OFFSET = 2.0  # ideal years = job.min_experience + 2
EXP_BAND = 4.0  # exp_fit falls linearly to 0 across +/- 4 years from ideal

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


def _norm(s: str) -> str:
    return s.strip().casefold()


def skill_terms(
    resume_skills: list[str] | None, required: list[str] | None
) -> tuple[float | None, list[str], list[str]]:
    """Overlap on normalized names. Both sides are already canonical (the single
    normalizer runs at write time), so casefold comparison is enough here.
    overlap is None when the job lists no required skills => weight redistributes."""
    req: dict[str, str] = {}
    for s in required or []:
        n = _norm(s)
        if n and n not in req:
            req[n] = s.strip()
    have = {_norm(s) for s in resume_skills or []}
    matched = sorted(v for k, v in req.items() if k in have)
    missing = sorted(v for k, v in req.items() if k not in have)
    overlap = len(matched) / len(req) if req else None
    return overlap, matched, missing


def exp_fit(years: Any, min_experience: Any) -> float:
    """1 at ideal (min_experience + IDEAL_OFFSET), falling linearly to 0 at
    +/- EXP_BAND years; clamped. NULLs coalesce to 0 like the SQL filters."""
    ideal = float(min_experience or 0) + IDEAL_OFFSET
    return 1.0 - min(abs(float(years or 0) - ideal) / EXP_BAND, 1.0)


def score_pair(
    sim: float,
    resume_skills: list[str] | None,
    required_skills: list[str] | None,
    years: Any,
    min_experience: Any,
) -> tuple[float, dict]:
    """Hybrid score + explainable breakdown for one candidate<->job pair.

    The score is computed FROM the rounded components, so the breakdown always
    recomputes exactly to the stored score (explainability is data, not vibes).
    """
    overlap, matched, missing = skill_terms(resume_skills, required_skills)
    fit = exp_fit(years, min_experience)
    w_sim, w_skill, w_exp = settings.MATCH_W_SIM, settings.MATCH_W_SKILL, settings.MATCH_W_EXP
    note = None
    if overlap is None:
        # Job lists no required skills — nothing to overlap against, so the
        # skill weight redistributes to semantic. Said out loud in the breakdown.
        w_sim, w_skill = w_sim + w_skill, 0.0
        note = "No required skills listed — skill weight redistributed to semantic similarity."
    sim_r = round(float(sim), 4)
    fit_r = round(fit, 4)
    ov_r = round(overlap, 4) if overlap is not None else None
    score = round(w_sim * sim_r + w_skill * (ov_r or 0.0) + w_exp * fit_r, 4)
    breakdown = {
        "embedding_sim": sim_r,
        "skill_overlap": ov_r,
        "exp_fit": fit_r,
        "matched": matched,
        "missing": missing,
        "weights": {"semantic": w_sim, "skills": w_skill, "experience": w_exp},
        "note": note,
    }
    return score, breakdown


def rerank(rows: list[dict], job: Job) -> list[dict]:
    """Hybrid rerank of the ANN candidate pool for one job. Mutates + returns
    rows: 'similarity' becomes breakdown.embedding_sim; adds score + breakdown.
    Stable sort keeps ANN (distance) order on exact score ties."""
    for r in rows:
        r["score"], r["breakdown"] = score_pair(
            r.pop("similarity"),
            r["skills"],
            job.required_skills,
            r["years_experience"],
            job.min_experience,
        )
    rows.sort(key=lambda r: r["score"], reverse=True)
    return rows


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
    return rerank([dict(r) for r in rows], job)


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
    # Mirror of rerank() with the fixed/per-row sides swapped: the candidate's
    # skills/years are fixed, each row brings its own required_skills/min_exp.
    out = [dict(r) for r in rows]
    for r in out:
        r["score"], r["breakdown"] = score_pair(
            r.pop("similarity"),
            resume.skills,
            r["required_skills"],
            profile.years_experience,
            r["min_experience"],
        )
    out.sort(key=lambda r: r["score"], reverse=True)
    return out
