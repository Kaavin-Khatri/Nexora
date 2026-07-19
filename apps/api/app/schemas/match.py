import uuid

from pydantic import BaseModel


class CandidateMatch(BaseModel):
    user_id: uuid.UUID
    full_name: str
    years_experience: float | None
    resume_id: uuid.UUID
    skills: list[str] | None
    similarity: float  # v1 score = 1 - cosine distance


class RecommendedJob(BaseModel):
    id: uuid.UUID
    title: str
    company_name: str
    location: str | None
    remote: bool
    job_type: str | None
    min_experience: float | None
    required_skills: list[str] | None
    similarity: float


class RecommendedResponse(BaseModel):
    items: list[RecommendedJob]
    # what the candidate still needs before matches can exist; empty = ready
    missing: list[str]
