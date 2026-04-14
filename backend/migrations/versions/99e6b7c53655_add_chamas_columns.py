"""add chamas columns

Revision ID: 99e6b7c53655
Revises: 
Create Date: 2026-04-14 13:38:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '99e6b7c53655'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add columns to chamas table
    op.add_column('chamas', sa.Column('target_goal_sats', sa.BigInteger(), nullable=True, server_default='0'))
    op.add_column('chamas', sa.Column('max_members', sa.Integer(), nullable=True, server_default='100'))
    op.add_column('chamas', sa.Column('member_count', sa.Integer(), nullable=True, server_default='1'))

def downgrade() -> None:
    # Remove columns from chamas table
    op.drop_column('chamas', 'member_count')
    op.drop_column('chamas', 'max_members')
    op.drop_column('chamas', 'target_goal_sats')
