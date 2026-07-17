import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.candidate import JobType
from app.schemas.company import CompanyOut


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    location: str | None
    remote: bool
    job_type: JobType | None
    min_experience: float | None
    required_skills: list[str] | None
    status: str
    created_at: datetime


class JobDetailOut(JobOut):
    company: CompanyOut


class JobListOut(BaseModel):
    items: list[JobDetailOut]
    total: int
    limit: int
    offset: int


class JobCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=50, max_length=10000)
    location: str | None = Field(default=None, max_length=120)
    remote: bool = False
    job_type: JobType | None = None
    min_experience: float | None = Field(default=None, ge=0, le=50)
    required_skills: list[str] = Field(default_factory=list, max_length=30)


class JobUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=50, max_length=10000)
    location: str | None = Field(default=None, max_length=120)
    remote: bool | None = None
    job_type: JobType | None = None
    min_experience: float | None = Field(default=None, ge=0, le=50)
    required_skills: list[str] | None = Field(default=None, max_length=30)
    status: Literal["open", "closed"] | None = None
