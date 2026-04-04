"""add subproject_id to agent_artifacts

Revision ID: e5f9a2b3c4d5
Revises: d4e8f1a2b3c9
Create Date: 2026-04-04 13:00:00.000000

"""
from typing import Union
from alembic import op
import sqlalchemy as sa


revision: str = 'e5f9a2b3c4d5'
down_revision: Union[str, None] = 'd4e8f1a2b3c9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add subproject_id FK to subprojects
    op.add_column('agent_artifacts',
                  sa.Column('subproject_id', sa.UUID(), nullable=True),
                  schema='mia')
    op.create_foreign_key(
        'fk_agent_artifacts_subproject_id',
        'agent_artifacts', 'subprojects',
        ['subproject_id'], ['id'],
        source_schema='mia', referent_schema='mia',
        ondelete='SET NULL'
    )
    op.create_index(
        'ix_mia_agent_artifacts_subproject_id',
        'agent_artifacts', ['subproject_id'],
        schema='mia'
    )


def downgrade() -> None:
    op.drop_index('ix_mia_agent_artifacts_subproject_id',
                  table_name='agent_artifacts', schema='mia')
    op.drop_constraint('fk_agent_artifacts_subproject_id',
                       'agent_artifacts', schema='mia', type_='foreignkey')
    op.drop_column('agent_artifacts', 'subproject_id', schema='mia')
