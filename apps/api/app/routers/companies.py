from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import CurrentUser, require_role
from app.db.models import Company, Profile, RecruiterProfile
from app.db.session import get_db
from app.schemas.company import CompanyCreate, CompanyOut, CompanyUpdate, AnalyticsOut
from app.db.models import Application, Job
from sqlalchemy import func, text
from datetime import datetime, timedelta
import logging

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


@router.get("/me/analytics", response_model=AnalyticsOut)
def get_my_analytics(
    user: CurrentUser = Depends(require_role("recruiter")),
    db: Session = Depends(get_db),
):
    company = _my_company(db, user.id)
    
    # Total open jobs
    total_open_jobs = db.query(Job).filter(Job.company_id == company.id, Job.status == "open").count()
    
    # Funnel and totals across applications for this company's jobs
    funnel_counts = db.query(Application.status, func.count(Application.id)).join(Job).filter(Job.company_id == company.id).group_by(Application.status).all()
    funnel = {k: v for k, v in funnel_counts}
    
    total_applicants = sum(funnel.values())
    total_shortlisted = funnel.get("shortlisted", 0) + funnel.get("interview", 0) + funnel.get("hired", 0)
    
    avg_match = db.query(func.avg(Application.match_score)).join(Job).filter(Job.company_id == company.id).scalar()
    
    # 14-day daily applications
    # Instead of generate_series which requires postgres-specific syntax, we can fetch all in last 14 days and bucket in Python
    fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
    recent_apps = db.query(Application.applied_at).join(Job).filter(Job.company_id == company.id, Application.applied_at >= fourteen_days_ago).all()
    
    daily_map = {}
    for i in range(14):
        d = (datetime.utcnow() - timedelta(days=13-i)).strftime("%Y-%m-%d")
        daily_map[d] = 0
        
    for app in recent_apps:
        d = app.applied_at.strftime("%Y-%m-%d")
        if d in daily_map:
            daily_map[d] += 1
            
    daily_applications = [{"date": k, "count": v} for k, v in daily_map.items()]
    
    # Per-job stats
    job_stats = db.query(
        Job.id,
        Job.title,
        func.count(Application.id).label("applicant_count"),
        func.max(Application.match_score).label("top_score")
    ).outerjoin(Application).filter(Job.company_id == company.id).group_by(Job.id).order_by(func.count(Application.id).desc()).limit(10).all()
    
    jobs = []
    for js in job_stats:
        jobs.append({
            "job_id": js.id,
            "title": js.title,
            "applicant_count": js.applicant_count,
            "top_score": float(js.top_score) if js.top_score is not None else None
        })

    return {
        "total_open_jobs": total_open_jobs,
        "total_applicants": total_applicants,
        "avg_match_score": float(avg_match) if avg_match is not None else None,
        "total_shortlisted": total_shortlisted,
        "funnel": funnel,
        "daily_applications": daily_applications,
        "jobs": jobs
    }

