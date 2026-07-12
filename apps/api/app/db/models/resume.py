import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

import sqlalchemy as sa
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.models.enums import resume_status


class Resume(Base):
    __tablename__ = "resumes"
    __table_args__ = (
        sa.Index(
            "ix_resumes_embedding_hnsw",
            "embedding",
            postgresql_using="hnsw",
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
        sa.Index("ix_resumes_skills_gin", "skills", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("profiles.user_id"), nullable=False
    )
    file_path: Mapped[str | None] = mapped_column(sa.Text)
    raw_text: Mapped[str | None] = mapped_column(sa.Text)
    parsed_json: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    ats_score: Mapped[Decimal | None] = mapped_column(sa.Numeric(5, 2))
    ats_breakdown: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    skills: Mapped[list[str] | None] = mapped_column(ARRAY(sa.Text))
    embedding: Mapped[Any | None] = mapped_column(Vector(384))
    status: Mapped[str] = mapped_column(resume_status, nullable=False, server_default="uploaded")
    error_message: Mapped[str | None] = mapped_column(sa.Text)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
    )
