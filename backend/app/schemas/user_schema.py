from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# 공통으로 쓰는 기본 정보
class User(BaseModel):
    email: EmailStr
    nickname: str


# # 회원가입 요청용
# class UserCreate(UserBase):
#     password: str  # 평문 비밀번호 (요청에서만 받음)


# # 로그인 요청용
# class UserLogin(BaseModel):
#     email: EmailStr
#     password: str


# # 클라이언트에게 돌려줄 유저 정보 (비밀번호 X)
# class UserResponse(UserBase):
#     id: str
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         from_attributes = True  # ORM 객체/몽고 모델에서 바로 변환할 때 사용


# # 내부에서만 쓸 수 있는, DB에 저장된 형태(혹은 읽어온 형태)
# class UserInDB(UserBase):
#     id: str
#     hashed_password: str
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         from_attributes = True
