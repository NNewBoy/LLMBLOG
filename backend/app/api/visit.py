import json
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.deps import client_ip
from app.core.response import ok, fail
from app.models.setting import Setting
from app.services.visitor import record_visit

router = APIRouter(prefix="/visit", tags=["visit"])


class VisitRecordIn(BaseModel):
    title: str  # 入口页 entry_links 中的标题，用于定位跳转目标


@router.post("/record")
def record(body: VisitRecordIn, request: Request, db: Session = Depends(get_db)):
    """记录外部平台的一次访问（公开接口，无需鉴权）。

    根据 entry_links 中的 title 查找对应的跳转目标 url，
    记录为入口来源访客（source=entry，path=/entry）。
    """
    title = body.title.strip()
    if not title:
        return fail("title 不能为空")

    # 从 settings 中查找 entry_links 匹配的 title
    setting = db.query(Setting).first()
    if not setting:
        return fail("系统未初始化")

    links = json.loads(setting.entry_links or "[]")
    target = ""
    for link in links:
        if link.get("title", "").strip() == title:
            target = link.get("url", "")
            break

    if not target:
        return fail(f"未找到 title 为「{title}」的入口链接")

    ua = request.headers.get("user-agent", "")
    record_visit(db, path="/entry", ip=client_ip(request), ua=ua, source="entry", target=target)
    return ok()
