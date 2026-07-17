from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import CurrentUser, get_current_user
from app.db.models import Skill
from app.db.session import get_db

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("", response_model=list[str])
def autocomplete(
    q: str = Query(min_length=1, max_length=60),
    limit: int = Query(default=10, ge=1, le=25),
    _user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Taxonomy autocomplete for tag inputs (any authenticated user)."""
    return db.scalars(
        select(Skill.name).where(Skill.name.ilike(f"%{q}%")).order_by(Skill.name).limit(limit)
    ).all()
