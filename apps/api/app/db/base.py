from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Imported at the bottom so Alembic autogenerate sees every model.
from app.db import models  # noqa: E402, F401
