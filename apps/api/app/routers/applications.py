from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.rate_limit import limiter
from app.core.security import CurrentUser, require_role
from app.db.models import Application, Job, Profile, Resume
from app.db.session import get_db
from app.schemas.application import ApplicationCreate, ApplicationOut, CandidateApplicationOut, ApplicationStatusUpdate, InterviewQuestionOut
from app.services.matching_engine import _vec, score_pair
from app.services.interview_questions import generate_questions_for_application
from app.db.models import InterviewQuestion
import uuid

router = APIRouter(prefix="/applications", tags=["applications"])

@router.post("", response_model=ApplicationOut)
def apply(
    payload: ApplicationCreate,
    user: CurrentUser = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    job = db.get(Job, payload.job_id)
    if not job or job.status != "open":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or not open"
        )

    resume = (
        db.query(Resume)
        .filter(Resume.candidate_id == user.id, Resume.status == "parsed")
        .order_by(Resume.created_at.desc())
        .first()
    )
    if not resume or not resume.embedding:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A parsed resume is required to apply",
        )

    profile = db.get(Profile, user.id)

    sim_query = text(
        "SELECT 1 - (embedding <=> CAST(:job_emb AS vector)) FROM resumes WHERE id = :resume_id"
    )
    sim = db.execute(
        sim_query, {"job_emb": _vec(job.embedding), "resume_id": resume.id}
    ).scalar()

    score, breakdown = score_pair(
        float(sim),
        resume.skills,
        job.required_skills,
        profile.years_experience,
        job.min_experience,
    )

    app = Application(
        job_id=job.id,
        candidate_id=user.id,
        resume_id=resume.id,
        match_score=score,
        match_breakdown=breakdown,
        status="applied",
    )
    db.add(app)
    try:
        db.commit()
        db.refresh(app)
        return app
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied to this job",
        )


@router.get("/me", response_model=list[CandidateApplicationOut])
def my_applications(
    user: CurrentUser = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    apps = (
        db.query(Application)
        .filter(Application.candidate_id == user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return apps


TRANSITION_MAP = {
    "applied": {"screening", "shortlisted", "rejected"},
    "screening": {"shortlisted", "interview", "rejected"},
    "shortlisted": {"interview", "rejected"},
    "interview": {"hired", "rejected"},
    "hired": set(),
    "rejected": set(),
}


@router.patch("/{id}/status", response_model=ApplicationOut)
def update_status(
    id: uuid.UUID,
    payload: ApplicationStatusUpdate,
    user: CurrentUser = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    app = db.get(Application, id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Application not found"
        )

    # Verify ownership of the job
    job = db.get(Job, app.job_id)
    if not job or job.recruiter_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Application not found"
        )

    allowed_next = TRANSITION_MAP.get(app.status, set())
    if payload.status not in allowed_next:
        allowed_str = ", ".join(sorted(allowed_next)) if allowed_next else "none"
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Illegal transition. Allowed next states: {allowed_str}",
        )

    app.status = payload.status
    db.commit()
    db.refresh(app)
    return app


@router.post("/{id}/interview-questions", response_model=list[InterviewQuestionOut])
@limiter.limit("5/minute")
def generate_interview_questions(
    request: Request,
    id: uuid.UUID,
    regenerate: bool = False,
    user: CurrentUser = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    app = db.get(Application, id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Application not found"
        )
    job = db.get(Job, app.job_id)
    if not job or job.recruiter_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Application not found"
        )
    
    # Check if they exist
    existing = db.query(InterviewQuestion).filter(InterviewQuestion.application_id == app.id).all()
    if existing and not regenerate:
        return existing
    
    if regenerate and existing:
        db.query(InterviewQuestion).filter(InterviewQuestion.application_id == app.id).delete()
        db.commit()

    return generate_questions_for_application(db, app)


@router.get("/{id}/interview-questions", response_model=list[InterviewQuestionOut])
def get_interview_questions(
    id: uuid.UUID,
    user: CurrentUser = Depends(),
    db: Session = Depends(get_db),
):
    app = db.get(Application, id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Application not found"
        )
    
    # Either the recruiter owner or the applicant themselves
    if user.role == "recruiter":
        job = db.get(Job, app.job_id)
        if not job or job.recruiter_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Application not found"
            )
    elif user.role == "candidate":
        if app.candidate_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Application not found"
            )
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(InterviewQuestion).filter(InterviewQuestion.application_id == app.id).all()

