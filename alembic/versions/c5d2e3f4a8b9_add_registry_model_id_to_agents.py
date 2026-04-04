"""Add registry_model_id FK to agents

Revision ID: c5d2e3f4a8b9
Revises: b3f9a1d2c8e7
Create Date: 2026-04-04 01:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'c5d2e3f4a8b9'
down_revision: Union[str, None] = 'b3f9a1d2c8e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'agents',
        sa.Column('registry_model_id', postgresql.UUID(as_uuid=True), nullable=True),
        schema='mia',
    )
    op.create_foreign_key(
        'fk_agents_registry_model_id',
        'agents', 'registry_models',
        ['registry_model_id'], ['id'],
        source_schema='mia', referent_schema='mia',
        ondelete='SET NULL',
    )
    op.create_index('ix_agents_registry_model_id', 'agents', ['registry_model_id'], schema='mia')


def downgrade() -> None:
    op.drop_index('ix_agents_registry_model_id', table_name='agents', schema='mia')
    op.drop_constraint('fk_agents_registry_model_id', 'agents', schema='mia', type_='foreignkey')
    op.drop_column('agents', 'registry_model_id', schema='mia')
