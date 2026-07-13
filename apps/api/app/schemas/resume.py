import uuid
from datetime import datetime

from pydantic import BaseModel


class ResumeOut(BaseModel):
    id: uuid.UUID
    status: str
    error_message: str | None = None
    ats_score: float | None = None
    skills: list[str] | None = None
    created_at: datetime | None = None
