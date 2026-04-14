import asyncio
import sqlalchemy
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://impact_user:impact_pass_2026@localhost:5434/impact_chain"

async def fix():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Checking/Adding target_goal_sats to chamas...")
        await conn.execute(text("ALTER TABLE chamas ADD COLUMN IF NOT EXISTS target_goal_sats BIGINT DEFAULT 0"))
        
        print("Checking/Adding max_members to chamas...")
        await conn.execute(text("ALTER TABLE chamas ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 100"))
        
        print("Checking/Adding member_count to chamas...")
        await conn.execute(text("ALTER TABLE chamas ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 1"))
        
        print("Checking/Adding lightning_address to users...")
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS lightning_address VARCHAR"))
        
        print("DB Patching complete.")
    await engine.dispose()

if __name__ == "__main__":
    try:
        asyncio.run(fix())
    except Exception as e:
        print(f"Error patching DB: {e}")
