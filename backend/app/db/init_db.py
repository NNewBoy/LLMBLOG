from sqlalchemy.orm import Session

from app.db.database import Base, engine
from app.models import *  # noqa: F401,F403  确保模型注册
from app.models.setting import Setting
from app.core.security import hash_password
from app.core.config import settings


def init_db():
    Base.metadata.create_all(bind=engine)


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
