import time
from collections import defaultdict
from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.response import ok, fail
from app.core.deps import require_admin, client_ip, parse_terminal
from app.models.comment import Comment
from app.models.note import Note
from app.models.setting import Setting
from app.schemas.comment import CommentCreate

router = APIRouter(prefix="/comments", tags=["comments"])

# IP 限流：记录最近 60s 内的评论时间戳
_rate: dict[str, list[float]] = defaultdict(list)
MAX_PER_MIN = 5


@router.get("/by-note/{note_id}")
def list_by_note(
    note_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    sort: str = Query("latest"),
    db: Session = Depends(get_db),
):
    q = db.query(Comment).filter(
        Comment.note_id == note_id, Comment.status == "normal", Comment.parent_id.is_(None)
    )
    total = q.count()
    order = Comment.like_count.desc() if sort == "hot" else Comment.created_at.desc()
    roots = q.order_by(order).offset((page - 1) * page_size).limit(page_size).all()
    return ok({
        "items": [c.to_dict() for c in roots],
        "total": total, "page": page, "page_size": page_size,
    })


@router.post("/by-note/{note_id}")
def create_comment(
    note_id: int, body: CommentCreate, request: Request, db: Session = Depends(get_db)
):
    # 蜜罐字段非空 → 静默拒绝
    if body.website:
        return ok({"id": 0})
    note = db.query(Note).filter(Note.id == note_id, Note.deleted_at.is_(None)).first()
    if not note:
        return fail("笔记不存在", status=404)

    ip = client_ip(request)
    now = time.time()
    # 清理过期记录并检查 60s 窗口内评论数
    _rate[ip] = [t for t in _rate[ip] if now - t < 60]
    if len(_rate[ip]) >= MAX_PER_MIN:
        return fail("评论太快啦，稍后再试", code=429, status=429)
    _rate[ip].append(now)

    ua = request.headers.get("user-agent", "")
    is_author = _is_author(db, body.nickname)
    parent = None
    if body.parent_id:
        parent = db.query(Comment).filter(Comment.id == body.parent_id).first()
        if not parent:
            return fail("父评论不存在", status=400)

    c = Comment(
        note_id=note_id, parent_id=body.parent_id, nickname=body.nickname or "匿名访客",
        content=body.content, ip=ip, location="", user_agent=ua[:500],
        terminal=parse_terminal(ua), is_author=1 if is_author else 0,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return ok(c.to_dict(include_replies=False))


def _is_author(db: Session, nickname: str) -> bool:
    s = db.query(Setting).filter(Setting.id == 1).first()
    return bool(s and nickname and nickname == s.blogger_name)


@router.post("/{comment_id}/like")
def like_comment(comment_id: int, db: Session = Depends(get_db)):
    c = db.query(Comment).filter(Comment.id == comment_id).first()
    if not c:
        return fail("评论不存在", status=404)
    c.like_count += 1
    db.commit()
    return ok({"id": comment_id, "like_count": c.like_count})


@router.put("/{comment_id}/hide")
def toggle_hide(comment_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    c = db.query(Comment).filter(Comment.id == comment_id).first()
    if not c:
        return fail("评论不存在", status=404)
    c.status = "normal" if c.status == "hidden" else "hidden"
    db.commit()
    return ok({"id": comment_id, "status": c.status})


@router.get("/all")
def list_all(
    note_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    q = db.query(Comment)
    if note_id:
        q = q.filter(Comment.note_id == note_id)
    if status:
        q = q.filter(Comment.status == status)
    total = q.count()
    items = q.order_by(desc(Comment.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    out = []
    for c in items:
        d = c.to_dict(include_replies=False)
        d["note_title"] = c.note.title if c.note else ""
        out.append(d)
    return ok({"items": out, "total": total, "page": page, "page_size": page_size})


@router.delete("/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    c = db.query(Comment).filter(Comment.id == comment_id).first()
    if not c:
        return fail("评论不存在", status=404)
    db.delete(c)
    db.commit()
    return ok({"id": comment_id})
