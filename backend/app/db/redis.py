import redis.asyncio as redis
from fastapi import HTTPException, status
from app.core.config import settings

redis_pool = None

async def init_redis_pool():
    global redis_pool

    try:
        redis_pool = redis.ConnectionPool.from_url(
            f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
            decode_responses=True
        )

        r = redis.Redis(connection_pool=redis_pool)
        await r.ping()
    except Exception as e:
        redis_pool = None 


async def close_redis_pool():
    global redis_pool

    if redis_pool:
        await redis_pool.disconnect()


async def get_redis() -> redis.Redis:
    if redis_pool is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="REDIS_SERVICE_UNAVAILABLE"
        )
    
    r = redis.Redis(connection_pool=redis_pool)

    try:
        await r.ping()
        yield r
    except redis.exceptions.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT, 
            detail="REDIS_TIMEOUT"
        )
    except redis.exceptions.ConnectionError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="REDIS_CONNECTION_ERROR"
        )
    except redis.RedisError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="REDIS_INTERNAL_ERROR"
        )
    finally:
        pass