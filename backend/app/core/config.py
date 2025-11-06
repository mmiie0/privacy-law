from pydantic_settings import BaseSettings
from pydantic import computed_field

class Settings(BaseSettings):
    # Redis 설정
    REDIS_HOST: str = None
    REDIS_PORT: int = None

    # SMTP 설정
    SMTP_HOST: str = None
    SMTP_PORT: int = None
    SMTP_USER: str = None
    SMTP_PASSWORD: str = None

    # MySQL 설정
    RDB_USER: str = None
    RDB_PASSWORD: str = None
    RDB_HOST: str = None
    RDB_PORT: int = None
    RDB_NAME: str = None
    
    @property
    @computed_field
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+aiomysql://{self.RDB_USER}:{self.RDB_PASSWORD}@"
            f"{self.RDB_HOST}:{self.RDB_PORT}/{self.RDB_NAME}"
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

settings = Settings()