from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import CurrentUser, require_role
from app.db.models import Profile, Resume
from app.db.session import get_db
from app.schemas.candidate import (
    CandidateOverview,
    CandidateProfileOut,
    CandidateProfileUpdate,
    Completeness,
)

router = APIRouter(prefix="/candidates", tags=["candidates"])


@router.get("/me", response_model=CandidateProfileOut)
def get_my_profile(
    user: CurrentUser = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    return db.get(Profile, user.id)


@router.get("/me/overview", response_model=CandidateOverview)
def my_overview(
    user: CurrentUser = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    """Everything the dashboard needs, one round trip."""
    profile = db.get(Profile, user.id)
    resume = db.scalar(
        select(Resume)
        .where(Resume.candidate_id == user.id)
        .order_by(Resume.created_at.desc())
        .limit(1)
    )

    improvements = []
    if resume is not None and resume.ats_breakdown:
        checks = resume.ats_breakdown.get("checks", [])
        # 3 lowest-scoring (by ratio) checks that aren't already perfect —
        # straight from the breakdown, no invented advice.
        imperfect = [c for c in checks if c["score"] < c["max"]]
        improvements = sorted(imperfect, key=lambda c: c["score"] / c["max"])[:3]

    return CandidateOverview(
        profile=profile,
        resume_status=resume.status if resume else None,
        ats_score=float(resume.ats_score)
        if resume is not None and resume.ats_score is not None
        else None,
        improvements=improvements,
        skills=(resume.skills or []) if resume else [],
        completeness=Completeness(
            profile_complete=bool(
                profile.location
                and profile.years_experience is not None
                and profile.desired_job_type
            ),
            resume_uploaded=resume is not None,
            resume_parsed=bool(resume and resume.status == "parsed"),
        ),
    )


@router.patch("/me", response_model=CandidateProfileOut)
def update_my_profile(
    payload: CandidateProfileUpdate,
    user: CurrentUser = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    profile = db.get(Profile, user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
