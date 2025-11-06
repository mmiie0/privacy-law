from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.redis import init_redis_pool, close_redis_pool
from app.db.rdb import init_rdb_engine, close_rdb_engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 앱 실행
    await init_redis_pool()
    await init_rdb_engine()
    
    yield
    
    # 앱 종료
    await close_redis_pool()
    await close_rdb_engine()