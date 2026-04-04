"""Add labels to projects

Revision ID: 3cf4520073e1
Revises: 625d986d4691
Create Date: 2026-04-03 19:27:14.351299
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '3cf4520073e1'
down_revision: Union[str, None] = '625d986d4691'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add labels column to projects table
    op.add_column('projects', sa.Column('labels', sa.JSON(), nullable=True), schema='mia')


def downgrade() -> None:
    # Drop labels column
    op.drop_column('projects', 'labels', schema='mia')
