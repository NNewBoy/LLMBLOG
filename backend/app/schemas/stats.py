from pydantic import BaseModel


class Overview(BaseModel):
    note_count: int
    uv: int
    pv: int
    comment_count: int


class DayPoint(BaseModel):
    date: str
    uv: int
    pv: int
