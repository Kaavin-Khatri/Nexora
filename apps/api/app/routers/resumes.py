import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import CurrentUser, require_role
from app.core.storage import upload_resume
from app.db.models import Resume
from app.db.session import get_db
from app.schemas.resume import ResumeOut
from app.workers.tasks import parse_resume

router = APIRouter(prefix="/resumes", tags=["resumes"])

MAX_BYTES = 5 * 1024 * 1024  # 5MB
# ext -> allowed content-type(s). Both the extension AND the content-type must match.
ALLOWED = {
    ".pdf": {"application/pdf"},
    ".docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",  # some browsers send this for .docx
    },
}


@router.post("", response_model=ResumeOut)
async def upload(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    user: CurrentUser = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    filename = file.filename or ""
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
    if ext not in ALLOWED or file.content_type not in ALLOWED[ext]:
        raise HTTPException(415, "Only PDF or DOCX files are accepted")

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "File exceeds the 5MB limit")
    if len(data) == 0:
        raise HTTPException(422, "File is empty")

    resume_id = uuid.uuid4()
    path = f"{user.id}/{resume_id}{ext}"
    upload_resume(path, data, file.content_type)

    resume = Resume(id=resume_id, candidate_id=user.id, file_path=path, status="uploaded")
    db.add(resume)
    db.commit()

    background_tasks.add_task(parse_resume, resume_id)
    return ResumeOut(id=resume_id, status="uploaded")


@router.get("/latest", response_model=ResumeOut | None)
def latest(
    user: CurrentUser = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    return db.scalar(
        select(Resume)
        .where(Resume.candidate_id == user.id)
        .order_by(Resume.created_at.desc())
        .limit(1)
    )


@router.get("/{resume_id}", response_model=ResumeOut)
def get_one(
    resume_id: uuid.UUID,
    user: CurrentUser = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    resume = db.get(Resume, resume_id)
    # 404 (not 403) for someone else's resume: never leak that the id exists.
    if resume is None or resume.candidate_id != user.id:
        raise HTTPException(404, "Resume not found")
    return resume
