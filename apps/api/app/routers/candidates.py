from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import CurrentUser, require_role
from app.db.models import Profile
from app.db.session import get_db
from app.schemas.candidate import CandidateProfileOut, CandidateProfileUpdate

router = APIRouter(prefix="/candidates", tags=["candidates"])


@router.get("/me", response_model=CandidateProfileOut)
def get_my_profile(
    user: CurrentUser = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    return db.get(Profile, user.id)


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
