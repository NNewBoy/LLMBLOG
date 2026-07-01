from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Setting(Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    blogger_name: Mapped[str] = mapped_column(String(64), default="博主")
    blogger_desc: Mapped[str] = mapped_column(String(255), default="一个记录与分享的角落")
    blogger_avatar: Mapped[str] = mapped_column(String(255), default="")
    social_links: Mapped[str] = mapped_column(Text, default="{}")
    site_favicon: Mapped[str] = mapped_column(String(255), default="")
    site_name: Mapped[str] = mapped_column(String(64), default="个人笔记博客")
    site_desc: Mapped[str] = mapped_column(String(255), default="")
    site_keywords: Mapped[str] = mapped_column(String(255), default="")
    icp_no: Mapped[str] = mapped_column(String(64), default="")
    icp_url: Mapped[str] = mapped_column(String(255), default="")
    police_no: Mapped[str] = mapped_column(String(64), default="")
    police_url: Mapped[str] = mapped_column(String(255), default="")
    police_logo: Mapped[str] = mapped_column(String(255), default="")
    admin_password_hash: Mapped[str] = mapped_column(String(255), default="")

    def to_public_dict(self) -> dict:
        import json
        return {
            "blogger_name": self.blogger_name,
            "blogger_desc": self.blogger_desc,
            "blogger_avatar": self.blogger_avatar,
            "social_links": json.loads(self.social_links or "{}"),
            "site_favicon": self.site_favicon,
            "site_name": self.site_name,
            "site_desc": self.site_desc,
            "icp_no": self.icp_no,
            "icp_url": self.icp_url,
            "police_no": self.police_no,
            "police_url": self.police_url,
            "police_logo": self.police_logo,
        }

    def to_admin_dict(self) -> dict:
        d = self.to_public_dict()
        return d
