from datetime import datetime
from pydantic import BaseModel, Field


class TagBrief(BaseModel):
    id: int
    name: str
    color: str = ""


class NoteBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    author: str = ""
    summary: str = ""
    content: str = ""
    status: str = "published"
    is_pinned: bool = False
    tag_ids: list[int] = []
    slug: str = ""


class NoteCreate(NoteBase):
    created_at: datetime | None = None


class NoteUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    summary: str | None = None
    content: str | None = None
    status: str | None = None
    is_pinned: bool | None = None
    tag_ids: list[int] | None = None
    slug: str | None = None
    created_at: datetime | None = None


class NoteSummary(BaseModel):
    id: int
    slug: str
    title: str
    author: str
    summary: str
    status: str
    is_pinned: bool
    view_count: int
    comment_count: int
    created_at: datetime
    updated_at: datetime
    tags: list[TagBrief] = []


class NoteDetail(BaseModel):
    id: int
    slug: str
    title: str
    author: str
    summary: str
    content: str
    status: str
    is_pinned: bool
    view_count: int
    comment_count: int
    created_at: datetime
    updated_at: datetime
    tags: list[TagBrief] = []
    prev: dict | None = None
    next: dict | None = None
