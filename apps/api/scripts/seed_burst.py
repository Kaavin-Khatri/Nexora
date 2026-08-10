import os
import sys
import uuid
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Add the parent directory to sys.path so we can import 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.db.models import Profile, Resume, Job, Application

def seed_burst():
    db = SessionLocal()
    try:
        # Find a job to apply to
        job = db.query(Job).first()
        if not job:
            print("No jobs found. Seed the database first.")
            return

        print(f"Seeding 30 applications for job: {job.title}")

        # Create 30 dummy candidates
        for i in range(30):
            user_id = uuid.uuid4()
            
            # Profile
            profile = Profile(
                user_id=user_id,
                role="candidate",
                full_name=f"Demo Candidate {i+1}",
                headline=random.choice([
                    "Software Engineer",
                    "Frontend Developer",
                    "Backend Developer",
                    "Full Stack Engineer",
                    "DevOps Engineer"
                ]),
                location=random.choice(["San Francisco, CA", "Remote", "New York, NY", "Austin, TX"]),
                years_experience=Decimal(random.randint(1, 10)),
                desired_job_type="full_time",
                open_to_remote=True
            )
            db.add(profile)
            
            # Resume
            resume_id = uuid.uuid4()
            resume = Resume(
                id=resume_id,
                candidate_id=user_id,
                status="parsed",
                skills=[random.choice(["Python", "React", "TypeScript", "Node.js", "AWS", "Docker"]) for _ in range(5)],
                parsed_json={
                    "contact": {"email": f"candidate{i+1}@example.com"},
                    "summary": "An experienced software engineer.",
                    "experience": [],
                    "education": []
                }
            )
            db.add(resume)
            
            # Application
            # Generate random match score biased towards top tiers
            score = random.uniform(0.3, 0.95)
            app = Application(
                id=uuid.uuid4(),
                job_id=job.id,
                candidate_id=user_id,
                resume_id=resume_id,
                status=random.choice(["applied", "screening", "shortlisted"]),
                match_score=Decimal(str(round(score, 2))),
                match_breakdown={
                    "score": round(score, 2),
                    "semantic_score": round(score * 0.9, 2),
                    "skill_overlap": round(score * 0.8, 2),
                    "experience_match": 1.0,
                    "explanation": "Matched perfectly"
                },
                applied_at=datetime.utcnow() - timedelta(days=random.randint(0, 5), hours=random.randint(0, 23))
            )
            db.add(app)
            
        db.commit()
        print("Successfully seeded 30 applications.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_burst()
