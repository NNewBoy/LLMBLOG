from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import Base, engine
from app.models import *  # noqa: F401,F403  确保模型注册
from app.models.setting import Setting
from app.core.security import hash_password
from app.core.config import settings


def init_db():
    Base.metadata.create_all(bind=engine)


def _ensure_column(db: Session, table: str, column: str, coltype: str, default: str | None = None):
    """SQLite 轻量迁移：若列不存在则添加（create_all 不会为已存在的表追加列）。"""
    cols = [r[1] for r in db.execute(text(f"PRAGMA table_info({table})"))]
    if column not in cols:
        dflt = f" DEFAULT '{default}'" if default is not None else ""
        db.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {coltype}{dflt}"))
        db.commit()


def migrate(db: Session):
    """增量迁移：为旧库补齐新增字段。"""
    # visitors 表
    _ensure_column(db, "visitors", "source", "VARCHAR(32)", "note")
    _ensure_column(db, "visitors", "target", "VARCHAR(255)", "")
    # settings 表
    _ensure_column(db, "settings", "blogger_name", "VARCHAR(64)", "博主")
    _ensure_column(db, "settings", "blogger_desc", "VARCHAR(255)", "一个记录与分享的角落")
    _ensure_column(db, "settings", "blogger_avatar", "VARCHAR(255)", "")
    _ensure_column(db, "settings", "social_links", "TEXT", "{}")
    _ensure_column(db, "settings", "site_favicon", "VARCHAR(255)", "")
    _ensure_column(db, "settings", "site_name", "VARCHAR(64)", "个人笔记博客")
    _ensure_column(db, "settings", "site_desc", "VARCHAR(255)", "")
    _ensure_column(db, "settings", "site_keywords", "VARCHAR(255)", "")
    _ensure_column(db, "settings", "icp_no", "VARCHAR(64)", "")
    _ensure_column(db, "settings", "icp_url", "VARCHAR(255)", "")
    _ensure_column(db, "settings", "police_no", "VARCHAR(64)", "")
    _ensure_column(db, "settings", "police_url", "VARCHAR(255)", "")
    _ensure_column(db, "settings", "police_logo", "VARCHAR(255)", "")
    _ensure_column(db, "settings", "entry_links", "TEXT", "[]")


def ensure_default_settings(db: Session):
    s = db.query(Setting).filter(Setting.id == 1).first()
    if not s:
        pwd_hash = settings.ADMIN_PASSWORD_HASH
        if not pwd_hash:
            # 默认密码 admin（前端先做 SHA256 预哈希再传输），此处存 bcrypt(sha256("admin"))
            import hashlib
            pre = hashlib.sha256("admin".encode("utf-8")).hexdigest()
            pwd_hash = hash_password(pre)
            print("\n[INIT] 默认后台密码: admin （请尽快在系统设置中修改）\n")
        s = Setting(id=1, admin_password_hash=pwd_hash)
        db.add(s)
        db.commit()
    return s
