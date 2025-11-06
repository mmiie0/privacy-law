from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from fastapi import HTTPException, status
from app.core.config import settings

engine = None
AsyncSessionFactory = None

Base = declarative_base()

async def init_rdb_engine():
    global engine, AsyncSessionFactory

    try:
        engine = create_async_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            echo=False 
        )
        
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
            
        AsyncSessionFactory = async_sessionmaker(
            engine, 
            autoflush=False, 
            expire_on_commit=False
        )
    except Exception as e:
        engine = None
        AsyncSessionFactory = None


async def close_rdb_engine():
    global engine
    if engine:
        await engine.dispose()


async def get_rdb() -> AsyncSession:
    if AsyncSessionFactory is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="RDB_SERVICE_UNAVAILABLE"
        )
        
    session: AsyncSession = AsyncSessionFactory()

    try:
        yield session 
    except SQLAlchemyError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="RDB_INTERNAL_ERROR"
        )
    except Exception as e:
        await session.rollback()
        raise e 
    finally:
        await session.close() 