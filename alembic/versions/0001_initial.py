"""Initial schema — agents table

Revision ID: 0001
Revises:
Create Date: 2026-04-03
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "agents",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("model", sa.String(), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=True),
        sa.Column("system_prompt", sa.Text(), nullable=True),
        sa.Column("capabilities", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        schema="mia",
    )
    op.create_index("ix_mia_agents_tenant_id", "agents", ["tenant_id"], schema="mia")


def downgrade() -> None:
    op.drop_index("ix_mia_agents_tenant_id", table_name="agents", schema="mia")
    op.drop_table("agents", schema="mia")
