from typing import List, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.models import Application, InterviewQuestion
from app.services.llm_client import chat_json

class GenQuestion(BaseModel):
    question: str = Field(..., description="The interview question text")
    category: str = Field(..., description="'technical', 'missing_skill', or 'behavioral'")
    targets_skill: Optional[str] = Field(None, description="The specific skill targeted (if technical or missing_skill)")

class GenQuestionResponse(BaseModel):
    questions: List[GenQuestion] = Field(..., description="Exactly 8 interview questions")

def generate_questions_for_application(db: Session, application: Application) -> List[InterviewQuestion]:
    resume = application.resume
    job = application.job
    breakdown = application.match_breakdown or {}

    resume_json = resume.parsed_json or {}
    job_json = job.parsed_json or {}
    matched_skills = breakdown.get("matched", [])
    missing_skills = breakdown.get("missing", [])

    system_prompt = (
        "You are an expert technical interviewer preparing a custom interview script for a candidate. "
        "Your task is to generate EXACTLY 8 interview questions based on the candidate's resume, the job description, and the gap analysis.\n\n"
        "Requirements for the 8 questions:\n"
        "- 3 'technical' questions probing their strengths (skills they have that match the job).\n"
        "- 3 'missing_skill' questions probing the skills they lack for this job (to see if they can learn them or have adjacent experience).\n"
        "- 2 'behavioral' questions based on their experience level and the role.\n\n"
        "Rules:\n"
        "1. Output must be exactly 8 questions in the mix described above.\n"
        "2. At least one technical question MUST reference a specific project or role from the resume.\n"
        "3. Missing skill questions MUST target actual missing skills from the provided gap data.\n"
        "4. Provide the 'category' for each ('technical', 'missing_skill', 'behavioral').\n"
        "5. Provide the 'targets_skill' (the specific skill name) for technical and missing_skill questions, otherwise null."
    )

    context = (
        f"Job Title: {job.title}\n"
        f"Job Data: {job_json}\n\n"
        f"Candidate Resume: {resume_json}\n\n"
        f"Matched Skills: {matched_skills}\n"
        f"Missing Skills: {missing_skills}\n"
    )

    try:
        response = chat_json(system_prompt, context, GenQuestionResponse)
    except Exception as e:
        # Fallback if LLM fails
        return []

    # Insert into database
    created_questions = []
    for q in response.questions:
        iq = InterviewQuestion(
            application_id=application.id,
            question=q.question,
            category=q.category,
            targets_skill=q.targets_skill
        )
        db.add(iq)
        created_questions.append(iq)
    
    db.commit()
    for iq in created_questions:
        db.refresh(iq)

    return created_questions
