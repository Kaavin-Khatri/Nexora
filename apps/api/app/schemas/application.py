import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.match import MatchBreakdown


class ApplicationCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    job_id: uuid.UUID


class ApplicationStatusUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    status: str


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_id: uuid.UUID
    candidate_id: uuid.UUID
    resume_id: uuid.UUID
    status: str
    match_score: float | None
    match_breakdown: MatchBreakdown | None
    applied_at: datetime


class AppliedJobCompany(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str


class AppliedJob(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    location: str | None
    remote: bool
    company: AppliedJobCompany


class CandidateApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job: AppliedJob
    status: str
    match_score: float | None
    match_breakdown: MatchBreakdown | None
    applied_at: datetime


class AppCandidateProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    full_name: str
    headline: str | None
    location: str | None
    years_experience: float | None


class AppCandidateResume(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    skills: list[str] | None
    parsed_json: dict | None


class RecruiterApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    candidate_id: uuid.UUID
    candidate: AppCandidateProfile
    resume: AppCandidateResume
    status: str
    match_score: float | None
    match_breakdown: MatchBreakdown | None
    applied_at: datetime


class InterviewQuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question: str
    category: str | None
    targets_skill: str | None
    created_at: datetime
