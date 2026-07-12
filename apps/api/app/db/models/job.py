import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

import sqlalchemy as sa
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.models.enums import job_status, job_type


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        sa.Index(
            "ix_jobs_embedding_hnsw",
            "embedding",
            postgresql_using="hnsw",
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
        sa.Index("ix_jobs_required_skills_gin", "required_skills", postgresql_using="gin"),
        sa.Index("ix_jobs_location", "location"),
        sa.Index("ix_jobs_job_type", "job_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("companies.id"), nullable=False
    )
    recruiter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("recruiter_profiles.user_id"), nullable=False
    )
    title: Mapped[str] = mapped_column(sa.Text, nullable=False)
    description: Mapped[str | None] = mapped_column(sa.Text)
    location: Mapped[str | None] = mapped_column(sa.Text)
    remote: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.false())
    job_type: Mapped[str | None] = mapped_column(job_type)
    min_experience: Mapped[Decimal | None] = mapped_column(sa.Numeric(4, 1))
    required_skills: Mapped[list[str] | None] = mapped_column(ARRAY(sa.Text))
    parsed_json: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    embedding: Mapped[Any | None] = mapped_column(Vector(384))
    status: Mapped[str] = mapped_column(job_status, nullable=False, server_default="open")
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
    )
