"""add session_id and summary to agent_artifacts

Revision ID: d4e8f1a2b3c9
Revises: 77b6ac538494
Create Date: 2026-04-04 00:00:00.000000

"""
from typing import Union
from alembic import op
import sqlalchemy as sa


revision: str = 'd4e8f1a2b3c9'
down_revision: Union[str, None] = 'c5d2e3f4a8b9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make execution_id nullable
    op.alter_column('agent_artifacts', 'execution_id',
                    existing_type=sa.UUID(),
                    nullable=True,
                    schema='mia')

    # Add session_id FK to chat_sessions
    op.add_column('agent_artifacts',
                  sa.Column('session_id', sa.UUID(), nullable=True),
                  schema='mia')
    op.create_foreign_key(
        'fk_agent_artifacts_session_id',
        'agent_artifacts', 'chat_sessions',
        ['session_id'], ['id'],
        source_schema='mia', referent_schema='mia',
        ondelete='SET NULL'
    )
    op.create_index(
        'ix_mia_agent_artifacts_session_id',
        'agent_artifacts', ['session_id'],
        schema='mia'
    )

    # Add summary column
    op.add_column('agent_artifacts',
                  sa.Column('summary', sa.Text(), nullable=True),
                  schema='mia')


def downgrade() -> None:
    op.drop_column('agent_artifacts', 'summary', schema='mia')

    op.drop_index('ix_mia_agent_artifacts_session_id',
                  table_name='agent_artifacts', schema='mia')
    op.drop_constraint('fk_agent_artifacts_session_id',
                       'agent_artifacts', schema='mia', type_='foreignkey')
    op.drop_column('agent_artifacts', 'session_id', schema='mia')

    op.alter_column('agent_artifacts', 'execution_id',
                    existing_type=sa.UUID(),
                    nullable=False,
                    schema='mia')
