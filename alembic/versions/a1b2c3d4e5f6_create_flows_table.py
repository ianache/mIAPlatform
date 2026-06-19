"""create flows table

Revision ID: a1b2c3d4e5f6
Revises: f6a0b3c4d5e6
Create Date: 2026-04-05
"""
from typing import Union
from alembic import op

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'f6a0b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS mia.flows (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id VARCHAR NOT NULL,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            graph JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
            created_at TIMESTAMP NOT NULL DEFAULT now(),
            updated_at TIMESTAMP NOT NULL DEFAULT now()
        )
    """)
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_mia_flows_tenant_id ON mia.flows (tenant_id)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS mia.ix_mia_flows_tenant_id")
    op.execute("DROP TABLE IF EXISTS mia.flows")
