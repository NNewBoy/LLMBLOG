from datetime import datetime
from pydantic import BaseModel


class TagBase(BaseModel):
    name: str
    description: str = ""
    color: str = ""


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    color: str | None = None


class TagOut(TagBase):
    id: int
    note_count: int = 0
