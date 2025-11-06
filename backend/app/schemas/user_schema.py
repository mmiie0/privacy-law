from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# 공통으로 쓰는 기본 정보
class User(BaseModel):
    email: EmailStr
    nickname: str
