"""create avatars table

Revision ID: f6a0b3c4d5e6
Revises: e5f9a2b3c4d5
Create Date: 2026-04-04
"""
from typing import Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'f6a0b3c4d5e6'
down_revision: Union[str, None] = 'e5f9a2b3c4d5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'avatars',
        sa.Column(
            'id',
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text('gen_random_uuid()'),
        ),
        sa.Column('tenant_id', sa.String(), nullable=False),
        sa.Column('entity_type', sa.String(20), nullable=False),   # 'user' | 'agent'
        sa.Column('entity_id', sa.String(255), nullable=True),     # user_sub or agent UUID
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('content_type', sa.String(100), nullable=False),
        sa.Column('file_data', sa.LargeBinary(), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        schema='mia',
    )
    op.create_index(
        'ix_mia_avatars_entity',
        'avatars',
        ['entity_type', 'entity_id'],
        schema='mia',
    )


def downgrade() -> None:
    op.drop_index('ix_mia_avatars_entity', table_name='avatars', schema='mia')
    op.drop_table('avatars', schema='mia')
