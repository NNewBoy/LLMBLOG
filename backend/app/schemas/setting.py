from pydantic import BaseModel


class SettingUpdate(BaseModel):
    blogger_name: str | None = None
    blogger_desc: str | None = None
    blogger_avatar: str | None = None
    social_links: dict | None = None
    site_favicon: str | None = None
    site_name: str | None = None
    site_desc: str | None = None
    site_keywords: str | None = None
    icp_no: str | None = None
    icp_url: str | None = None
    police_no: str | None = None
    police_url: str | None = None
    police_logo: str | None = None
    new_password: str | None = None  # 修改密码（前端预哈希）
