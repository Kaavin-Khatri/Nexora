import uuid

from pydantic import BaseModel


class MatchBreakdown(BaseModel):
    """Explainable score components. weights are the weights ACTUALLY used
    (post-redistribution), so components always recompute to the score."""

    embedding_sim: float
    skill_overlap: float | None  # None = job listed no required skills
    exp_fit: float
    matched: list[str]
    missing: list[str]
    weights: dict[str, float]
    note: str | None = None


class CandidateMatch(BaseModel):
    user_id: uuid.UUID
    full_name: str
    years_experience: float | None
    resume_id: uuid.UUID
    skills: list[str] | None
    score: float  # hybrid: w_sim*sim + w_skill*overlap + w_exp*exp_fit
    breakdown: MatchBreakdown


class RecommendedJob(BaseModel):
    id: uuid.UUID
    title: str
    company_name: str
    location: str | None
    remote: bool
    job_type: str | None
    min_experience: float | None
    required_skills: list[str] | None
    score: float
    breakdown: MatchBreakdown


class RecommendedResponse(BaseModel):
    items: list[RecommendedJob]
    # what the candidate still needs before matches can exist; empty = ready
    missing: list[str]
