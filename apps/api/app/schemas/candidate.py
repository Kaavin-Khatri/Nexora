from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

JobType = Literal["full_time", "part_time", "contract", "internship"]

# LOCKED (5.1): these fields are Phase 8's hard-filter inputs.
# Changing them later means touching the matcher.


class CandidateProfileOut(BaseModel):
    # from_attributes: validate straight from the SQLAlchemy Profile object
    # (needed when nested inside CandidateOverview).
    model_config = ConfigDict(from_attributes=True)

    full_name: str
    headline: str | None
    location: str | None
    years_experience: float | None
    desired_job_type: JobType | None
    open_to_remote: bool


class CandidateProfileUpdate(BaseModel):
    # extra="forbid": unknown fields -> 422. The server rejects everything
    # the client rejects — never trust the browser.
    model_config = ConfigDict(extra="forbid")

    full_name: str | None = Field(default=None, min_length=1, max_length=200)
    headline: str | None = Field(default=None, max_length=200)
    location: str | None = Field(default=None, max_length=120)
    years_experience: float | None = Field(default=None, ge=0, le=50)
    desired_job_type: JobType | None = None
    open_to_remote: bool | None = None


class Improvement(BaseModel):
    name: str
    score: float
    max: float
    detail: str


class Completeness(BaseModel):
    profile_complete: bool  # hard-filter fields set (location, years, desired job type)
    resume_uploaded: bool
    resume_parsed: bool


class CandidateOverview(BaseModel):
    """Everything the dashboard needs in ONE round trip — future cards extend
    this, never add new calls."""

    profile: CandidateProfileOut
    resume_status: str | None
    ats_score: float | None
    improvements: list[Improvement]  # the 3 lowest-scoring ATS checks
    skills: list[str]
    completeness: Completeness
