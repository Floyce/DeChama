import asyncio
from app.database import engine
from sqlalchemy import text

async def check_columns():
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';"))
        cols = [r[0] for r in res.fetchall()]
        print("Users cols:", cols)
        
        res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'chamas';"))
        cols = [r[0] for r in res.fetchall()]
        print("Chamas cols:", cols)

if __name__ == "__main__":
    asyncio.run(check_columns())
