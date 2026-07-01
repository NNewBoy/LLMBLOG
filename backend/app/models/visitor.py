from datetime import datetime
import hashlib
from sqlalchemy import Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Visitor(Base):
    __tablename__ = "visitors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ip: Mapped[str] = mapped_column(String(64), default="", index=True)
    ua: Mapped[str] = mapped_column(String(512), default="")
    fingerprint: Mapped[str] = mapped_column(String(64), default="", index=True)
    path: Mapped[str] = mapped_column(String(255), default="")
    terminal: Mapped[str] = mapped_column(String(64), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


def make_fingerprint(ip: str, ua: str) -> str:
    return hashlib.sha1(f"{ip}|{ua}".encode("utf-8")).hexdigest()
