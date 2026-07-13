from pydantic import BaseModel, ConfigDict


class Contact(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None


class Experience(BaseModel):
    title: str | None = None
    company: str | None = None
    start: str | None = None
    end: str | None = None
    current: bool | None = None
    bullets: list[str] = []


class Education(BaseModel):
    degree: str | None = None
    institution: str | None = None
    year: str | None = None


class ParsedResume(BaseModel):
    """Blank-first structured resume. EVERY field is optional — a field not
    explicitly present in the resume is null/empty, never inferred.
    extra='ignore': tolerate stray keys the LLM may add without failing."""

    model_config = ConfigDict(extra="ignore")

    contact: Contact = Contact()
    summary: str | None = None
    skills: list[str] = []
    experience: list[Experience] = []
    education: list[Education] = []
    certifications: list[str] = []
    total_years_estimate: float | None = None
