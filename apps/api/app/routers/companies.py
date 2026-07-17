from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import CurrentUser, require_role
from app.db.models import Company, Profile, RecruiterProfile
from app.db.session import get_db
from app.schemas.company import CompanyCreate, CompanyOut, CompanyUpdate

router = APIRouter(prefix="/companies", tags=["companies"])

# v1: ONE recruiter = ONE company (recruiter_profiles row is the link).
# Teams / multi-recruiter per company is explicitly deferred.


def _my_company(db: Session, user_id) -> Company:
    rp = db.get(RecruiterProfile, user_id)
    if rp is None:
        raise HTTPException(404, "No company yet")
    return db.get(Company, rp.company_id)


@router.post("", response_model=CompanyOut, status_code=201)
def create_company(
    payload: CompanyCreate,
    user: CurrentUser = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    if db.get(RecruiterProfile, user.id) is not None:
        raise HTTPException(409, "You already have a company")

    profile = db.get(Profile, user.id)
    company = Company(owner_user_id=user.id, **payload.model_dump())
    db.add(company)
    db.flush()  # get company.id
    db.add(RecruiterProfile(user_id=user.id, company_id=company.id, full_name=profile.full_name))
    db.commit()
    db.refresh(company)
    return company


@router.get("/me", response_model=CompanyOut)
def get_my_company(
    user: CurrentUser = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    return _my_company(db, user.id)


@router.patch("/me", response_model=CompanyOut)
def update_my_company(
    payload: CompanyUpdate,
    user: CurrentUser = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    company = _my_company(db, user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company
