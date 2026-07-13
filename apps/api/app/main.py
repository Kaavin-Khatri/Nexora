from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import CurrentUser, get_current_user
from app.db.models import Profile
from app.db.session import get_db
from app.routers import candidates, resumes
from app.services.embedding_service import model_loaded, warmup


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm the embedding model at startup so the first parse isn't cold.
    warmup()
    yield


app = FastAPI(title="Nexora API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candidates.router)
app.include_router(resumes.router)


@app.get("/health")
def health():
    # model_loaded is read by Phase 14 monitoring.
    return {"status": "ok", "model_loaded": model_loaded()}


@app.get("/health/db")
def health_db(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.get("/me")
def me(user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.get(Profile, user.id)
    return {
        "user_id": p.user_id,
        "role": p.role,
        "email": user.email,
        "full_name": p.full_name,
        "headline": p.headline,
        "location": p.location,
        "years_experience": p.years_experience,
        "desired_job_type": p.desired_job_type,
        "open_to_remote": p.open_to_remote,
    }


@app.post("/profiles/bootstrap")
def bootstrap_profile(user: CurrentUser = Depends(get_current_user)):
    # get_current_user already created the row if it was missing — idempotent.
    return {"status": "ok", "user_id": str(user.id), "role": user.role}
