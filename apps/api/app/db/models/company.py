import uuid

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(sa.Text, nullable=False)
    website: Mapped[str | None] = mapped_column(sa.Text)
    size: Mapped[str | None] = mapped_column(sa.Text)
    about: Mapped[str | None] = mapped_column(sa.Text)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("profiles.user_id"), nullable=False
    )


class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("profiles.user_id"), primary_key=True
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), sa.ForeignKey("companies.id"), nullable=False
    )
    full_name: Mapped[str] = mapped_column(sa.Text, nullable=False)
