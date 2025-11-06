from pydantic_settings import BaseSettings
from pydantic import computed_field

class Settings(BaseSettings):
    # Redis 설정
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # SMTP 설정
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "your_gmail@gmail.com"
    SMTP_PASSWORD: str = "your_app_password"

    # MySQL 설정
    RDB_USER: str = "admin"
    RDB_PASSWORD: str = "your_rds_password"
    RDB_HOST: str = "your-aws-rds-endpoint.ap-northeast-2.rds.amazonaws.com"
    RDB_PORT: int = 3306
    RDB_NAME: str = "your_db_name"
    
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