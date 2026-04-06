"""create flow_runs table

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-04-06
"""
from typing import Union
from alembic import op

revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS mia.flow_runs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            flow_id UUID NOT NULL REFERENCES mia.flows(id) ON DELETE CASCADE,
            tenant_id VARCHAR NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'running',
            trigger VARCHAR(20) NOT NULL DEFAULT 'manual',
            started_at TIMESTAMP NOT NULL DEFAULT now(),
            finished_at TIMESTAMP,
            log JSONB NOT NULL DEFAULT '[]',
            final_output JSONB
        )
    """)
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_mia_flow_runs_flow_id ON mia.flow_runs (flow_id)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_mia_flow_runs_tenant_id ON mia.flow_runs (tenant_id)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_mia_flow_runs_status ON mia.flow_runs (status)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS mia.ix_mia_flow_runs_status")
    op.execute("DROP INDEX IF EXISTS mia.ix_mia_flow_runs_tenant_id")
    op.execute("DROP INDEX IF EXISTS mia.ix_mia_flow_runs_flow_id")
    op.execute("DROP TABLE IF EXISTS mia.flow_runs")
