from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.utils.timezone import now_naive


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    note_id: Mapped[int] = mapped_column(ForeignKey("notes.id", ondelete="CASCADE"), index=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True)
    nickname: Mapped[str] = mapped_column(String(64), default="匿名访客")
    content: Mapped[str] = mapped_column(Text)
    ip: Mapped[str] = mapped_column(String(64), default="")
    location: Mapped[str] = mapped_column(String(128), default="")
    user_agent: Mapped[str] = mapped_column(String(512), default="")
    terminal: Mapped[str] = mapped_column(String(64), default="")
    is_author: Mapped[int] = mapped_column(Integer, default=0)
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(16), default="normal", index=True)  # normal/hidden
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_naive, index=True)

    note: Mapped["Note"] = relationship("Note", back_populates="comments")
    replies: Mapped[list["Comment"]] = relationship(
        "Comment", backref="parent", remote_side="Comment.id", lazy="selectin"
    )

    def to_dict(self, include_replies: bool = True) -> dict:
        d = {
            "id": self.id,
            "note_id": self.note_id,
            "parent_id": self.parent_id,
            "nickname": self.nickname,
            "content": self.content,
            "location": self.location,
            "terminal": self.terminal,
            "is_author": bool(self.is_author),
            "like_count": self.like_count,
            "status": self.status,
            "created_at": self.created_at,
            "replies": [r.to_dict(include_replies=False) for r in (self.replies or [])] if include_replies else [],
        }
        return d
