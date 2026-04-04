"""Registry tables — registry_models, api_keys, feature_mappings

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-03
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "registry_models",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("context_window", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        schema="mia",
    )
    op.create_index(
        "ix_mia_registry_models_tenant_id", "registry_models", ["tenant_id"], schema="mia"
    )

    op.create_table(
        "api_keys",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", sa.String(), nullable=False),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("key_encrypted", sa.Text(), nullable=False),
        sa.Column("is_valid", sa.Boolean(), nullable=True),
        sa.Column("last_validated", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        schema="mia",
    )
    op.create_index(
        "ix_mia_api_keys_tenant_id", "api_keys", ["tenant_id"], schema="mia"
    )

    op.create_table(
        "feature_mappings",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", sa.String(), nullable=False),
        sa.Column("feature_id", sa.String(), nullable=False),
        sa.Column("feature_name", sa.String(), nullable=False),
        sa.Column("model_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        schema="mia",
    )
    op.create_index(
        "ix_mia_feature_mappings_tenant_id", "feature_mappings", ["tenant_id"], schema="mia"
    )


def downgrade() -> None:
    op.drop_index("ix_mia_feature_mappings_tenant_id", table_name="feature_mappings", schema="mia")
    op.drop_table("feature_mappings", schema="mia")
    op.drop_index("ix_mia_api_keys_tenant_id", table_name="api_keys", schema="mia")
    op.drop_table("api_keys", schema="mia")
    op.drop_index("ix_mia_registry_models_tenant_id", table_name="registry_models", schema="mia")
    op.drop_table("registry_models", schema="mia")
