"""create node_types table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-05
"""
from typing import Union
from alembic import op

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS mia.node_types (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id VARCHAR NOT NULL,
            name VARCHAR(200) NOT NULL,
            icon VARCHAR(50),
            description TEXT,
            category VARCHAR(20) NOT NULL,
            properties JSONB NOT NULL DEFAULT '[]',
            language VARCHAR(20) NOT NULL DEFAULT 'javascript',
            code TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT now(),
            updated_at TIMESTAMP NOT NULL DEFAULT now()
        )
    """)
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_mia_node_types_tenant_id ON mia.node_types (tenant_id)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_mia_node_types_category ON mia.node_types (category)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS mia.ix_mia_node_types_category")
    op.execute("DROP INDEX IF EXISTS mia.ix_mia_node_types_tenant_id")
    op.execute("DROP TABLE IF EXISTS mia.node_types")
