import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ResumeOut(BaseModel):
    id: uuid.UUID
    status: str
    error_message: str | None = None
    ats_score: float | None = None
    skills: list[str] | None = None
    parsed_json: dict[str, Any] | None = None
    created_at: datetime | None = None


class SkillsUpdate(BaseModel):
    # Full replacement of the editable skills list (the matcher-facing column).
    model_config = ConfigDict(extra="forbid")

    skills: list[str]
