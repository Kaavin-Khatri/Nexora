from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.models import GapAnalysis, Resume, Job
from app.services.llm_client import chat_json
from app.services.matching_engine import skill_terms

class SkillGap(BaseModel):
    why_it_matters: str = Field(..., description="1 line, grounded ONLY in the provided job context")
    how_to_close: str = Field(..., description="1 practical line")

class GapAnalysisResponse(BaseModel):
    narratives: dict[str, SkillGap] = Field(
        ..., description="Map of missing skill name to its narrative"
    )

def generate_gap_analysis(db: Session, resume: Resume, job: Job) -> dict:
    # Check cache
    cached = (
        db.query(GapAnalysis)
        .filter(GapAnalysis.resume_id == resume.id, GapAnalysis.job_id == job.id)
        .first()
    )
    if cached:
        return cached.result

    # Compute missing skills using same logic as matcher
    resume_skills_set = set(skill_terms(resume.skills)) if resume.skills else set()
    req_skills_set = set(skill_terms(job.required_skills)) if job.required_skills else set()
    missing_skills = list(req_skills_set - resume_skills_set)

    if not missing_skills:
        result = {"narratives": {}}
        _cache_result(db, resume.id, job.id, result)
        return result

    # Prepare prompt
    job_context = (
        f"Job Title: {job.title}\n"
        f"Description: {job.description or ''}\n"
        f"Missing Skills: {', '.join(missing_skills)}\n"
    )

    system_prompt = (
        "You are an expert technical recruiter providing actionable gap analysis for a candidate. "
        "For each missing skill, provide a 1-line explanation of why it matters for this specific job, "
        "and a 1-line practical suggestion on how the candidate can close this gap. "
        "Only discuss the skills provided. Do not introduce requirements not present in the input."
    )
    
    # Call LLM
    try:
        response = chat_json(system_prompt, job_context, GapAnalysisResponse)
        # Ensure only the requested missing skills are in the result
        filtered_narratives = {}
        for skill in missing_skills:
            # Case-insensitive matching from LLM output
            for k, v in response.narratives.items():
                if k.lower() == skill.lower():
                    filtered_narratives[skill] = v.model_dump()
                    break
        
        result = {"narratives": filtered_narratives}
    except Exception:
        # Fallback in case of LLM failure
        result = {"narratives": {}}

    _cache_result(db, resume.id, job.id, result)
    return result

def _cache_result(db: Session, resume_id, job_id, result: dict):
    gap = GapAnalysis(resume_id=resume_id, job_id=job_id, result=result)
    db.add(gap)
    try:
        db.commit()
    except Exception:
        db.rollback()
