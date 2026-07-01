from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    author: Mapped[str] = mapped_column(String(64), default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    content: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(16), default="published", index=True)  # draft/published/hidden
    is_pinned: Mapped[int] = mapped_column(Integer, default=0)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    tags: Mapped[list["Tag"]] = relationship(
        "Tag", secondary="note_tags", lazy="selectin", back_populates="notes"
    )
    comments: Mapped[list["Comment"]] = relationship(
        "Comment", back_populates="note", lazy="selectin"
    )

    def to_summary_dict(self) -> dict:
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "author": self.author,
            "summary": self.summary or _auto_summary(self.content),
            "status": self.status,
            "is_pinned": bool(self.is_pinned),
            "view_count": self.view_count,
            "comment_count": len(self.comments) if self.comments is not None else 0,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "tags": [t.to_dict() for t in self.tags],
        }


def _auto_summary(content: str, n: int = 120) -> str:
    import re
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", content or "")
    text = re.sub(r"[#*`>\-\[\]()!]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:n] + ("…" if len(text) > n else "")
