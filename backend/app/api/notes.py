import re
from datetime import datetime
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import desc, asc, or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.response import ok, fail
from app.core.deps import require_admin, client_ip
from app.models.note import Note
from app.models.tag import Tag
from app.models.visitor import make_fingerprint
from app.services.visitor import record_visit
from app.schemas.note import NoteCreate, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


def _slugify(title: str) -> str:
    s = re.sub(r"[^\w\u4e00-\u9fa5-]+", "-", title.strip()).strip("-")
    return s or "note"


def _unique_slug(db: Session, slug: str, exclude_id: int | None = None) -> str:
    base = slug or "note"
    n, candidate = 0, base
    while True:
        q = db.query(Note).filter(Note.slug == candidate)
        if exclude_id:
            q = q.filter(Note.id != exclude_id)
        if not q.first():
            return candidate
        n += 1
        candidate = f"{base}-{n}"


def _sync_tags(db: Session, note: Note, tag_ids: list[int]):
    note.tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all() if tag_ids else []


@router.get("")
def list_notes(
    keyword: str | None = Query(default=None),
    tag_id: int | None = Query(default=None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    q = db.query(Note).filter(Note.deleted_at.is_(None), Note.status == "published")
    if keyword:
        like = f"%{keyword}%"
        q = q.filter(or_(Note.title.like(like), Note.summary.like(like), Note.content.like(like)))
    if tag_id:
        q = q.filter(Note.tags.any(Tag.id == tag_id))
    total = q.count()
    items = (
        q.order_by(desc(Note.is_pinned), desc(Note.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return ok({"items": [n.to_summary_dict() for n in items], "total": total, "page": page, "page_size": page_size})


@router.get("/timeline")
def timeline(db: Session = Depends(get_db)):
    notes = (
        db.query(Note)
        .filter(Note.deleted_at.is_(None), Note.status == "published")
        .order_by(desc(Note.created_at))
        .all()
    )
    grouped: dict[str, dict] = {}
    for n in notes:
        y = str(n.created_at.year)
        m = f"{n.created_at.month:02d}"
        grouped.setdefault(y, {}).setdefault(m, []).append({
            "id": n.id, "slug": n.slug, "title": n.title,
            "created_at": n.created_at, "view_count": n.view_count,
        })
    return ok(grouped)


@router.get("/{slug_or_id}")
def get_note(slug_or_id: str, request: Request, db: Session = Depends(get_db)):
    n = db.query(Note).filter(
        or_(Note.slug == slug_or_id, Note.id == _try_int(slug_or_id)),
        Note.deleted_at.is_(None),
    ).first()
    if not n or n.status == "hidden":
        return fail("笔记不存在", status=404)
    # PV +1，UV 记录
    n.view_count += 1
    db.commit()
    record_visit(db, f"/note/{n.slug}", client_ip(request), request.headers.get("user-agent", ""))

    base = db.query(Note).filter(Note.deleted_at.is_(None), Note.status == "published")
    prev = base.filter(Note.created_at < n.created_at).order_by(desc(Note.created_at)).first()
    nxt = base.filter(Note.created_at > n.created_at).order_by(asc(Note.created_at)).first()
    data = {
        "id": n.id, "slug": n.slug, "title": n.title, "author": n.author,
        "summary": n.summary, "content": n.content, "status": n.status,
        "is_pinned": bool(n.is_pinned), "view_count": n.view_count,
        "comment_count": len(n.comments or []),
        "created_at": n.created_at, "updated_at": n.updated_at,
        "tags": [t.to_dict() for t in n.tags],
        "prev": {"slug": prev.slug, "title": prev.title} if prev else None,
        "next": {"slug": nxt.slug, "title": nxt.title} if nxt else None,
    }
    return ok(data)


def _try_int(s: str) -> int:
    try:
        return int(s)
    except (ValueError, TypeError):
        return -1


@router.post("")
def create_note(body: NoteCreate, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    n = Note(
        title=body.title, author=body.author, summary=body.summary, content=body.content,
        status=body.status, is_pinned=1 if body.is_pinned else 0,
        slug="tmp-" + datetime.utcnow().strftime("%H%M%S%f"),
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    # 默认 slug 用 id；自定义则规范化去重
    n.slug = _unique_slug(db, body.slug or str(n.id), exclude_id=n.id)
    if body.tag_ids:
        _sync_tags(db, n, body.tag_ids)
    db.commit()
    db.refresh(n)
    return ok(n.to_summary_dict())


@router.put("/{note_id}")
def update_note(note_id: int, body: NoteUpdate, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    n = db.query(Note).filter(Note.id == note_id, Note.deleted_at.is_(None)).first()
    if not n:
        return fail("笔记不存在", status=404)
    for f in ("title", "author", "summary", "content", "status"):
        v = getattr(body, f)
        if v is not None:
            setattr(n, f, v)
    if body.is_pinned is not None:
        n.is_pinned = 1 if body.is_pinned else 0
    if body.slug is not None and body.slug != n.slug:
        n.slug = _unique_slug(db, body.slug, exclude_id=n.id)
    if body.tag_ids is not None:
        _sync_tags(db, n, body.tag_ids)
    db.commit()
    return ok(n.to_summary_dict())


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    n = db.query(Note).filter(Note.id == note_id, Note.deleted_at.is_(None)).first()
    if not n:
        return fail("笔记不存在", status=404)
    n.deleted_at = datetime.utcnow()
    db.commit()
    return ok({"id": note_id})


@router.put("/{note_id}/pin")
def toggle_pin(note_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    n = db.query(Note).filter(Note.id == note_id, Note.deleted_at.is_(None)).first()
    if not n:
        return fail("笔记不存在", status=404)
    n.is_pinned = 0 if n.is_pinned else 1
    db.commit()
    return ok({"id": note_id, "is_pinned": bool(n.is_pinned)})
