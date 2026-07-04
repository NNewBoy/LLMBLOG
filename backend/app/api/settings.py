import json
import hashlib
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.response import ok, fail
from app.core.deps import require_admin
from app.core.security import hash_password
from app.models.setting import Setting
from app.schemas.setting import SettingUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def get_public_settings(db: Session = Depends(get_db)):
    s = db.query(Setting).filter(Setting.id == 1).first()
    if not s:
        return ok({})
    return ok(s.to_public_dict())


@router.get("/admin")
def get_admin_settings(db: Session = Depends(get_db), _: str = Depends(require_admin)):
    s = db.query(Setting).filter(Setting.id == 1).first()
    if not s:
        return ok({})
    return ok(s.to_admin_dict())


@router.put("")
def update_settings(body: SettingUpdate, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    s = db.query(Setting).filter(Setting.id == 1).first()
    if not s:
        s = Setting(id=1)
        db.add(s)
    for f in ("blogger_name", "blogger_desc", "blogger_avatar", "site_favicon",
              "site_name", "site_desc", "site_keywords", "icp_no", "icp_url",
              "police_no", "police_url", "police_logo"):
        v = getattr(body, f)
        if v is not None:
            setattr(s, f, v)
    if body.social_links is not None:
        s.social_links = json.dumps(body.social_links, ensure_ascii=False)
    if body.entry_links is not None:
        s.entry_links = json.dumps(body.entry_links, ensure_ascii=False)
    if body.new_password:
        # 前端登录时对密码做 SHA256 预哈希，这里需保持一致
        pre_hashed = hashlib.sha256(body.new_password.encode()).hexdigest()
        s.admin_password_hash = hash_password(pre_hashed)
    db.commit()
    db.refresh(s)
    return ok(s.to_admin_dict())
