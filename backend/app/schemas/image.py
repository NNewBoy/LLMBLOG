from datetime import datetime
from pydantic import BaseModel


class ImageOut(BaseModel):
    id: int
    filename: str
    original_name: str
    path: str
    thumb_path: str
    size: int
    mime: str
    created_at: datetime
    url: str
    thumb_url: str | None
