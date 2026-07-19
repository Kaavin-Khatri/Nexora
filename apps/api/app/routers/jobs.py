import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from sqlalchemy.orm import Session as OrmSession

from app.core.security import CurrentUser, require_role
from app.db.models import Job, Profile, RecruiterProfile, Resume
from app.db.session import get_db
from app.schemas.job import JobCreate, JobDetailOut, JobListOut, JobOut, JobUpdate
from app.schemas.match import CandidateMatch, RecommendedJob, RecommendedResponse
from app.services.job_ingest import ingest_job, reembed_job
from app.services.matching_engine import candidates_for_job, jobs_for_candidate
from app.services.skill_extractor import normalize_skills


def _latest_parsed_resume(db: OrmSession, user_id: uuid.UUID) -> Resume | None:
    return db.scalar(
        select(Resume)
        .where(
            Resume.candidate_id == user_id,
            Resume.status == "parsed",
            Resume.embedding.is_not(None),
        )
        .order_by(Resume.created_at.desc())
        .limit(1)
    )


router = APIRouter(prefix="/jobs", tags=["jobs"])


def _my_company_id(db: Session, user_id: uuid.UUID) -> uuid.UUID:
    rp = db.get(RecruiterProfile, user_id)
    if rp is None:
        raise HTTPException(409, "Set up your company first")
    return rp.company_id


@router.post("", response_model=JobDetailOut, status_code=201)
def create_job(
    payload: JobCreate,
    background_tasks: BackgroundTasks,
    user: CurrentUser = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    company_id = _my_company_id(db, user.id)
    data = payload.model_dump()
    # ONE normalizer for both worlds (resume + job) — divergence breaks matching.
    data["required_skills"] = normalize_skills(db, data["required_skills"]) or None
    job = Job(company_id=company_id, recruiter_id=user.id, **data)
    db.add(job)
    db.commit()
    db.refresh(job)
    background_tasks.add_task(ingest_job, job.id)
    return job


@router.get("/mine", response_model=list[JobOut])
def my_jobs(
    user: CurrentUser = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    return (
        db.scalars(
            select(Job)
            .where(Job.recruiter_id == user.id)
            .order_by(Job.created_at.desc(), Job.id.desc())
        )
        .unique()
        .all()
    )


@router.get("", response_model=JobListOut)
def browse_jobs(
    location: str | None = None,
    job_type: str | None = Query(
        default=None, pattern="^(full_time|part_time|contract|internship)$"
    ),
    remote: bool | None = None,
    max_experience: float | None = Query(default=None, ge=0, le=50),
    q: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=12, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    """Public browse: open jobs only. Stable order (created_at desc, id desc)
    keeps offset pagination duplicate-free."""
    stmt = select(Job).where(Job.status == "open")
    if location:
        stmt = stmt.where(Job.location.ilike(f"%{location}%"))
    if job_type:
        stmt = stmt.where(Job.job_type == job_type)
    if remote is not None:
        stmt = stmt.where(Job.remote == remote)
    if max_experience is not None:
        stmt = stmt.where(or_(Job.min_experience <= max_experience, Job.min_experience.is_(None)))
    if q:
        stmt = stmt.where(Job.title.ilike(f"%{q}%"))

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    items = (
        db.scalars(stmt.order_by(Job.created_at.desc(), Job.id.desc()).limit(limit).offset(offset))
        .unique()
        .all()
    )
    return JobListOut(
        items=[JobDetailOut.model_validate(j) for j in items],
        total=total,
        limit=limit,
        offset=offset,
    )


# NOTE: registered BEFORE /{job_id} so "recommended" never parses as a UUID.
@router.get("/recommended", response_model=RecommendedResponse)
def recommended_jobs(
    user: CurrentUser = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    """Candidate's recommended jobs. When the profile/resume is incomplete,
    returns an honest `missing` list instead of a silently empty grid."""
    profile = db.get(Profile, user.id)
    resume = _latest_parsed_resume(db, user.id)

    missing: list[str] = []
    if not (profile.location and profile.years_experience is not None and profile.desired_job_type):
        missing.append("profile")
    if resume is None:
        missing.append("resume")
    if missing:
        return RecommendedResponse(items=[], missing=missing)

    rows = jobs_for_candidate(db, profile, resume)
    return RecommendedResponse(
        items=[RecommendedJob(**r) for r in rows],
        missing=[],
    )


@router.get("/{job_id}/matches", response_model=list[CandidateMatch])
def job_matches(
    job_id: uuid.UUID,
    user: CurrentUser = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    job = db.get(Job, job_id)
    # owner-only, 404 not 403 — existence never leaks
    if job is None or job.recruiter_id != user.id:
        raise HTTPException(404, "Job not found")
    if job.embedding is None:
        return []  # still ingesting — matches appear once embedded
    return [CandidateMatch(**r) for r in candidates_for_job(db, job)]


@router.get("/{job_id}", response_model=JobDetailOut)
def get_job(
    job_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    # Public: open jobs only. (Recruiters manage their own — incl. closed —
    # via /jobs/mine + PATCH; existence of closed jobs is not leaked here.)
    job = db.get(Job, job_id)
    if job is None or job.status != "open":
        raise HTTPException(404, "Job not found")
    return job


@router.patch("/{job_id}", response_model=JobDetailOut)
def update_job(
    job_id: uuid.UUID,
    payload: JobUpdate,
    background_tasks: BackgroundTasks,
    user: CurrentUser = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    job = db.get(Job, job_id)
    # 404 (not 403) for non-owner: never leak that the id exists.
    if job is None or job.recruiter_id != user.id:
        raise HTTPException(404, "Job not found")
    data = payload.model_dump(exclude_unset=True)
    if "required_skills" in data and data["required_skills"] is not None:
        data["required_skills"] = normalize_skills(db, data["required_skills"]) or None

    # Value-level change detection (the form PATCHes every field, changed or not).
    def _neq(field: str, new) -> bool:
        old = getattr(job, field)
        if field == "min_experience" and old is not None and new is not None:
            return float(old) != float(new)
        return old != new

    changed = {k for k, v in data.items() if _neq(k, v)}
    for field, value in data.items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)

    # description/skills changed → full re-ingest (Groq). Only title/min_exp
    # changed → local re-embed, NO Groq (they're in the embed text but not
    # inputs to structuring).
    if changed & {"description", "required_skills"}:
        background_tasks.add_task(ingest_job, job.id)
    elif changed & {"title", "min_experience"}:
        background_tasks.add_task(reembed_job, job.id)
    return job
