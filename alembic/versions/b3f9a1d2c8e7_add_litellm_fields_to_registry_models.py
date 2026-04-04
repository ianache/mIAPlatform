"""Add litellm_prefix and model_id to registry_models

Revision ID: b3f9a1d2c8e7
Revises: 77b6ac538494
Create Date: 2026-04-04 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b3f9a1d2c8e7'
down_revision: Union[str, None] = '77b6ac538494'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'registry_models',
        sa.Column('litellm_prefix', sa.String(100), nullable=True),
        schema='mia',
    )
    op.add_column(
        'registry_models',
        sa.Column('model_id', sa.String(200), nullable=True),
        schema='mia',
    )


def downgrade() -> None:
    op.drop_column('registry_models', 'model_id', schema='mia')
    op.drop_column('registry_models', 'litellm_prefix', schema='mia')
