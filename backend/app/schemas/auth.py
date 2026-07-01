from pydantic import BaseModel


class LoginIn(BaseModel):
    password: str  # 前端 SHA256 预哈希后的十六进制串


class TokenOut(BaseModel):
    token: str
    token_type: str = "bearer"
