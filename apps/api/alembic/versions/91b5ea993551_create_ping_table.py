"""create ping table

Revision ID: 91b5ea993551
Revises:
Create Date: 2026-07-12 11:58:48.551402

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "91b5ea993551"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Prove the migration path — table dropped in the next migration."""
    op.create_table("ping", sa.Column("id", sa.Integer, primary_key=True))


def downgrade() -> None:
    op.drop_table("ping")
