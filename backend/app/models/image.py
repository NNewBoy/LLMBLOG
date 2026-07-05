from datetime import datetime
from sqlalchemy import Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.utils.timezone import now_naive


class Image(Base):
    __tablename__ = "images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    filename: Mapped[str] = mapped_column(String(128), unique=True)
    original_name: Mapped[str] = mapped_column(String(255), default="")
    path: Mapped[str] = mapped_column(String(255))
    thumb_path: Mapped[str] = mapped_column(String(255), default="")
    size: Mapped[int] = mapped_column(Integer, default=0)
    mime: Mapped[str] = mapped_column(String(64), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_naive, index=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "filename": self.filename,
            "original_name": self.original_name,
            "path": self.path,
            "thumb_path": self.thumb_path,
            "size": self.size,
            "mime": self.mime,
            "created_at": self.created_at,
            "url": f"/llmblog_uploads/{self.filename}",
            "thumb_url": f"/llmblog_uploads/thumb_{self.filename}" if self.thumb_path else None,
        }
