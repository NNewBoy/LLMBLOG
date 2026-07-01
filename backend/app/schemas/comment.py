from datetime import datetime
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    nickname: str = Field(default="匿名访客", max_length=64)
    content: str = Field(min_length=1, max_length=2000)
    parent_id: int | None = None
    website: str = ""  # 蜜罐字段，必须为空


class CommentOut(BaseModel):
    id: int
    note_id: int
    parent_id: int | None
    nickname: str
    content: str
    location: str
    terminal: str
    is_author: bool
    like_count: int
    status: str
    created_at: datetime
    replies: list["CommentOut"] = []


CommentOut.model_rebuild()
