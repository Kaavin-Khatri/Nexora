import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Skill(Base):
    """Normalized taxonomy for autocomplete/moderation. The fast-path skill
    matching uses the denormalized text[] columns on resumes/jobs."""

    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True)  # serial
    name: Mapped[str] = mapped_column(sa.Text, nullable=False, unique=True)
    category: Mapped[str | None] = mapped_column(sa.Text)
    flagged: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.false())
