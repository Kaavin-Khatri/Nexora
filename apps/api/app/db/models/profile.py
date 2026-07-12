import uuid
from decimal import Decimal

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.models.enums import job_type, user_role


class Profile(Base):
    """One row per Supabase auth user.

    user_id MIRRORS auth.users.id — Postgres cannot enforce an FK across the
    auth schema boundary, so the app layer guarantees the pairing (rows are
    only created from a verified Supabase JWT).
    """

    __tablename__ = "profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    role: Mapped[str] = mapped_column(user_role, nullable=False)
    full_name: Mapped[str] = mapped_column(sa.Text, nullable=False)
    headline: Mapped[str | None] = mapped_column(sa.Text)
    location: Mapped[str | None] = mapped_column(sa.Text)
    years_experience: Mapped[Decimal | None] = mapped_column(sa.Numeric(4, 1))
    desired_job_type: Mapped[str | None] = mapped_column(job_type)
    open_to_remote: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, server_default=sa.false()
    )
