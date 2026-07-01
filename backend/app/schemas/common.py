from typing import Any, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class Page(BaseModel):
    items: list[Any]
    total: int
    page: int
    page_size: int


class R(BaseModel):
    code: int = 0
    message: str = "ok"
    data: Any = None
