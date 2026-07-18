from pydantic import BaseModel, ConfigDict


class ParsedJob(BaseModel):
    """Blank-first structured job description. Stored in jobs.parsed_json."""

    model_config = ConfigDict(extra="ignore")

    responsibilities: list[str] = []
    extracted_skills: list[str] = []
    seniority_hint: str | None = None
