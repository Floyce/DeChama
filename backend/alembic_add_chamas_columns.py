"""add_chamas_columns

Revision ID: default_hash_id
Revises: 
Create Date: 2026-04-14 13:34:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'default_hash_id'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add columns to chamas table
    op.add_column('chamas', sa.Column('target_goal_sats', sa.BigInteger(), server_default='0', nullable=True))
    op.add_column('chamas', sa.Column('max_members', sa.Integer(), server_default='100', nullable=True))
    op.add_column('chamas', sa.Column('member_count', sa.Integer(), server_default='1', nullable=True))

def downgrade() -> None:
    # Drop columns from chamas table
    op.drop_column('chamas', 'member_count')
    op.drop_column('chamas', 'max_members')
    op.drop_column('chamas', 'target_goal_sats')
