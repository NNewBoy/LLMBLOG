from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.deps import client_ip
from app.core.response import ok
from app.services.visitor import record_entry_click

router = APIRouter(prefix="/entry", tags=["entry"])


class EntryClickIn(BaseModel):
    target: str  # 跳转目标：/、/admin 或外部 URL


@router.post("/click")
def click(body: EntryClickIn, request: Request, db: Session = Depends(get_db)):
    """记录入口页的一次点击跳转（公开接口，无需鉴权）。"""
    ua = request.headers.get("user-agent", "")
    record_entry_click(db, target=body.target, ip=client_ip(request), ua=ua)
    return ok()
