"""Idempotent demo seed: skills taxonomy, 2 companies + recruiters, 6 open jobs.

!!! Jobs are seeded WITHOUT embeddings on purpose — embedding stays NULL until
!!! Phase 7.3 backfills it through the real pipeline. Never insert fake vectors.

Idempotency: insert-only on natural keys (skill name, profile/company fixed
UUID, job title+company). Existing rows are never updated, so re-seeding after
Phase 7.3 cannot wipe backfilled embeddings.

Run from apps/api:  .venv/Scripts/python.exe scripts/seed.py
"""

import pathlib
import sys
import uuid

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from sqlalchemy import create_engine, func, select  # noqa: E402
from sqlalchemy.dialects.postgresql import insert as pg_insert  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.core.config import settings, sqlalchemy_url  # noqa: E402
from app.db.models import Company, Job, Profile, RecruiterProfile, Skill  # noqa: E402

NS = uuid.uuid5(uuid.NAMESPACE_DNS, "seed.nexora")


def sid(key: str) -> uuid.UUID:
    """Deterministic UUID so re-runs address the same rows."""
    return uuid.uuid5(NS, key)


SKILLS: dict[str, list[str]] = {
    "languages": [
        "JavaScript",
        "TypeScript",
        "Python",
        "Java",
        "C++",
        "C#",
        "Go",
        "Rust",
        "Kotlin",
        "Swift",
        "PHP",
        "Ruby",
        "SQL",
        "HTML",
        "CSS",
    ],
    "frameworks": [
        "React",
        "Next.js",
        "Vue.js",
        "Angular",
        "Svelte",
        "Node.js",
        "Express",
        "NestJS",
        "FastAPI",
        "Django",
        "Flask",
        "Spring Boot",
        ".NET",
        "Ruby on Rails",
        "Laravel",
        "Tailwind CSS",
        "Bootstrap",
        "React Native",
        "Flutter",
        "GraphQL",
        "REST APIs",
        "gRPC",
        "Redux",
        "Zustand",
        "Jest",
    ],
    "data-ai": [
        "Machine Learning",
        "Deep Learning",
        "NLP",
        "Computer Vision",
        "LLMs",
        "RAG",
        "Prompt Engineering",
        "LangChain",
        "PyTorch",
        "TensorFlow",
        "scikit-learn",
        "Pandas",
        "NumPy",
        "pgvector",
        "Embeddings",
        "Vector Databases",
        "Data Analysis",
        "Data Visualization",
        "Power BI",
        "Tableau",
        "Excel",
        "Statistics",
        "A/B Testing",
        "ETL",
        "Apache Spark",
    ],
    "cloud-devops": [
        "AWS",
        "Azure",
        "GCP",
        "Docker",
        "Kubernetes",
        "Terraform",
        "CI/CD",
        "GitHub Actions",
        "Jenkins",
        "Linux",
        "Bash",
        "Git",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Redis",
        "Elasticsearch",
        "Kafka",
        "RabbitMQ",
        "Nginx",
        "Serverless",
        "Microservices",
        "Prometheus",
        "Grafana",
        "Observability",
    ],
    "fintech-domain": [
        "Payments",
        "UPI",
        "Payment Gateways",
        "KYC",
        "AML",
        "Fraud Detection",
        "Risk Management",
        "Lending",
        "Credit Scoring",
        "Accounting",
        "Financial Modeling",
        "Regulatory Compliance",
        "Banking APIs",
        "Blockchain",
        "Trading Systems",
    ],
    "soft": [
        "Communication",
        "Teamwork",
        "Leadership",
        "Problem Solving",
        "Critical Thinking",
        "Time Management",
        "Stakeholder Management",
        "Agile",
        "Scrum",
        "Project Management",
        "Product Management",
        "Mentoring",
        "Presentation",
        "Negotiation",
        "Adaptability",
    ],
}

RECRUITERS = [
    {"key": "recruiter/payorbit", "full_name": "Ananya Sharma", "company_key": "company/payorbit"},
    {
        "key": "recruiter/brightpath",
        "full_name": "Rohan Mehta",
        "company_key": "company/brightpath",
    },
]

COMPANIES = [
    {
        "key": "company/payorbit",
        "name": "PayOrbit",
        "website": "https://payorbit.example",
        "size": "11-50",
        "about": "Ahmedabad-based fintech startup building UPI-first payment infrastructure "
        "and reconciliation tools for small merchants across India.",
        "owner_key": "recruiter/payorbit",
    },
    {
        "key": "company/brightpath",
        "name": "Brightpath Consulting",
        "website": "https://brightpath.example",
        "size": "51-200",
        "about": "Bengaluru technology consultancy delivering data platforms, cloud migrations "
        "and product engineering for mid-market clients in BFSI and retail.",
        "owner_key": "recruiter/brightpath",
    },
]

JOBS = [
    {
        "company_key": "company/payorbit",
        "title": "Backend Engineer",
        "location": "Ahmedabad",
        "remote": False,
        "job_type": "full_time",
        "min_experience": 2,
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "REST APIs", "Docker", "Payments"],
        "description": (
            "PayOrbit processes UPI collections and settlement for thousands of small merchants, "
            "and the backend team owns the services that make that money movement reliable. You will "
            "design and build FastAPI services in Python that handle payment webhooks, reconciliation "
            "runs and merchant reporting on PostgreSQL. The work is less about greenfield glamour and "
            "more about correctness under load: idempotent handlers, careful retries, clean migrations "
            "and API contracts the frontend team can trust. You will review pull requests, write tests "
            "that catch real regressions, and take part in a light on-call rotation with proper handoffs. "
            "We expect at least two years of production backend experience, comfort with SQL beyond "
            "ORM basics, and working knowledge of Docker. Exposure to payment systems, ledgers or "
            "double-entry accounting is a strong plus but teachable. You will work from our Ahmedabad "
            "office alongside the founding team, with real ownership of services end to end — from "
            "design docs through deployment and monitoring."
        ),
    },
    {
        "company_key": "company/payorbit",
        "title": "Frontend Engineer",
        "location": "Remote",
        "remote": True,
        "job_type": "full_time",
        "min_experience": 1,
        "required_skills": ["TypeScript", "React", "Next.js", "Tailwind CSS", "REST APIs"],
        "description": (
            "You will build the merchant dashboard where PayOrbit customers track collections, "
            "settlements and disputes — the screen a shop owner checks every single morning. The stack "
            "is TypeScript, React and Next.js with Tailwind, talking to a FastAPI backend through a "
            "typed client. We care about fast first paint on cheap Android phones, tables that stay "
            "usable with ten thousand rows, and empty states that actually explain what to do next. "
            "You will own features from Figma handoff to production, write component tests where they "
            "pay for themselves, and push back on designs that will not survive real data. One year of "
            "professional frontend experience is enough if you can show shipped work; we review "
            "portfolios and small code samples over puzzles. This role is fully remote within India "
            "with two sync days a quarter in Ahmedabad, travel covered. You will be the third frontend "
            "engineer, so your conventions will become the team's conventions — bring opinions and the "
            "willingness to defend them kindly."
        ),
    },
    {
        "company_key": "company/payorbit",
        "title": "AI Engineer",
        "location": "Bengaluru",
        "remote": False,
        "job_type": "full_time",
        "min_experience": 3,
        "required_skills": [
            "Python",
            "LLMs",
            "RAG",
            "Embeddings",
            "pgvector",
            "FastAPI",
            "Prompt Engineering",
        ],
        "description": (
            "PayOrbit is adding an intelligence layer to its merchant products: automatic categorisation "
            "of transactions, fraud signals from payment patterns, and an assistant that answers "
            "merchant questions from settlement data. You will own these features end to end — from "
            "prompt and retrieval design through evaluation and production serving. The current stack "
            "is Python, FastAPI, pgvector on Postgres for embeddings, and hosted LLM APIs; you will "
            "help decide what we fine-tune, what we retrieve, and what we simply do not build. We "
            "expect three or more years of software engineering with at least one production ML or "
            "LLM system you can talk through honestly: what worked, what failed, how you measured it. "
            "You should be fluent in embedding-based retrieval, comfortable writing evaluation "
            "harnesses, and allergic to demos that fall apart on real data. The role is based in our "
            "Bengaluru office with the data team, and you will mentor one junior engineer from day one."
        ),
    },
    {
        "company_key": "company/brightpath",
        "title": "Data Analyst",
        "location": "Bengaluru",
        "remote": False,
        "job_type": "internship",
        "min_experience": 0,
        "required_skills": [
            "SQL",
            "Excel",
            "Power BI",
            "Data Analysis",
            "Statistics",
            "Communication",
        ],
        "description": (
            "Brightpath runs data platform projects for banks and retailers, and our analysts turn "
            "messy client data into dashboards executives actually read. As an analyst intern you will "
            "work inside a delivery team on one client engagement at a time: writing SQL against "
            "warehouse tables, cleaning extracts in Excel or Python, building Power BI reports, and "
            "sitting in on the meetings where those numbers drive decisions. We will teach you our "
            "delivery process, dimensional modelling basics and how to present findings without "
            "burying the answer on slide nine. You need solid SQL fundamentals, spreadsheet fluency, "
            "basic statistics, and the ability to explain a chart in plain language — coursework and "
            "personal projects count, prior employment does not matter. The internship is six months "
            "in our Bengaluru office with a stipend and a conversion path to a full-time analyst role "
            "for strong performers; most of our current analyst team converted this way."
        ),
    },
    {
        "company_key": "company/brightpath",
        "title": "Product Manager",
        "location": "Ahmedabad",
        "remote": False,
        "job_type": "full_time",
        "min_experience": 5,
        "required_skills": [
            "Product Management",
            "Stakeholder Management",
            "Agile",
            "Data Analysis",
            "Communication",
            "Project Management",
        ],
        "description": (
            "Brightpath is opening an Ahmedabad office anchored on two long-running BFSI product "
            "engagements, and this PM owns both. You will run discovery with client stakeholders who "
            "have strong opinions and limited time, translate regulatory and business constraints into "
            "a roadmap engineers can execute, and keep two delivery squads focused on outcomes rather "
            "than ticket throughput. Expect to write crisp one-pagers, prioritise ruthlessly, and say "
            "no with evidence: usage data, support tickets and margin numbers, not vibes. We want at "
            "least five years in product roles with real shipping scars — a feature you killed, a "
            "launch that missed, and what you changed afterwards. Familiarity with lending, payments "
            "or compliance-heavy domains helps because our clients will test it in the first meeting. "
            "You report to the head of delivery, travel to client sites roughly one week a month, and "
            "have genuine authority over scope — we do not sell what you have not agreed to."
        ),
    },
    {
        "company_key": "company/brightpath",
        "title": "DevOps Engineer",
        "location": "Remote",
        "remote": True,
        "job_type": "contract",
        "min_experience": 3,
        "required_skills": [
            "AWS",
            "Docker",
            "Kubernetes",
            "Terraform",
            "CI/CD",
            "Linux",
            "GitHub Actions",
        ],
        "description": (
            "Twelve-month remote contract, extensible, to industrialise infrastructure across "
            "Brightpath client projects. Today each delivery team hand-rolls its own AWS setup; your "
            "job is to replace that with paved roads: Terraform modules for the common stacks, "
            "GitHub Actions pipelines with sane caching and environments, container standards, and "
            "monitoring baselines with Prometheus and Grafana. You will migrate three existing client "
            "environments onto these modules without downtime windows the clients notice, document "
            "the escape hatches, and coach delivery engineers so the platform survives your contract "
            "ending. We expect three or more years of hands-on AWS, strong Terraform and Kubernetes, "
            "and the judgement to know when a managed service beats a cluster. You will work async "
            "with teams in Bengaluru and Ahmedabad, with a weekly platform review call. Rate is "
            "monthly, invoiced, benchmarked to senior contractor rates in India; equipment provided "
            "if needed."
        ),
    },
]


def main() -> None:
    engine = create_engine(sqlalchemy_url(settings.DIRECT_DATABASE_URL))
    with Session(engine) as s:
        with s.begin():
            # skills — ON CONFLICT(name) DO NOTHING
            rows = [{"name": n, "category": cat} for cat, names in SKILLS.items() for n in names]
            s.execute(pg_insert(Skill).values(rows).on_conflict_do_nothing(index_elements=["name"]))

            # demo recruiter profiles (fixed UUIDs; profiles.user_id has no auth FK)
            for r in RECRUITERS:
                if s.get(Profile, sid(r["key"])) is None:
                    s.add(
                        Profile(user_id=sid(r["key"]), role="recruiter", full_name=r["full_name"])
                    )

            for c in COMPANIES:
                if s.get(Company, sid(c["key"])) is None:
                    s.add(
                        Company(
                            id=sid(c["key"]),
                            name=c["name"],
                            website=c["website"],
                            size=c["size"],
                            about=c["about"],
                            owner_user_id=sid(c["owner_key"]),
                        )
                    )

            for r in RECRUITERS:
                if s.get(RecruiterProfile, sid(r["key"])) is None:
                    s.add(
                        RecruiterProfile(
                            user_id=sid(r["key"]),
                            company_id=sid(r["company_key"]),
                            full_name=r["full_name"],
                        )
                    )

            # jobs — natural key (title, company); insert-only, embedding stays NULL
            for j in JOBS:
                company_id = sid(j["company_key"])
                exists = s.scalar(
                    select(Job.id).where(Job.title == j["title"], Job.company_id == company_id)
                )
                if exists is None:
                    s.add(
                        Job(
                            company_id=company_id,
                            recruiter_id=sid(
                                next(
                                    r["key"]
                                    for r in RECRUITERS
                                    if r["company_key"] == j["company_key"]
                                )
                            ),
                            title=j["title"],
                            description=j["description"],
                            location=j["location"],
                            remote=j["remote"],
                            job_type=j["job_type"],
                            min_experience=j["min_experience"],
                            required_skills=j["required_skills"],
                            # embedding intentionally omitted -> NULL until Phase 7.3
                        )
                    )

        for model in (Skill, Profile, Company, RecruiterProfile, Job):
            n = s.scalar(select(func.count()).select_from(model))
            print(f"{model.__tablename__}: {n}")


if __name__ == "__main__":
    main()
