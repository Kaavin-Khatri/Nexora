import sqlalchemy as sa

# One place for every Postgres enum. job_type is shared by profiles.desired_job_type
# and jobs.job_type on purpose — same vocabulary, one type.
user_role = sa.Enum("candidate", "recruiter", name="user_role")
job_type = sa.Enum("full_time", "part_time", "contract", "internship", name="job_type")
resume_status = sa.Enum("uploaded", "parsing", "parsed", "failed", name="resume_status")
job_status = sa.Enum("open", "closed", name="job_status")
application_status = sa.Enum(
    "applied",
    "screening",
    "shortlisted",
    "interview",
    "rejected",
    "hired",
    name="application_status",
)
