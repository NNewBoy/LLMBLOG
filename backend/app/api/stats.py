from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.response import ok
from app.core.deps import require_admin
from app.models.note import Note
from app.models.comment import Comment
from app.models.visitor import Visitor

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/overview")
def overview(db: Session = Depends(get_db), _: str = Depends(require_admin)):
    note_count = db.query(func.count(Note.id)).filter(Note.deleted_at.is_(None)).scalar() or 0
    pv = db.query(func.count(Visitor.id)).scalar() or 0
    uv = db.query(func.count(func.distinct(Visitor.fingerprint))).scalar() or 0
    comment_count = db.query(func.count(Comment.id)).scalar() or 0
    return ok({
        "note_count": note_count, "pv": pv, "uv": uv, "comment_count": comment_count,
    })


@router.get("/visitors")
def visitors(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    since = datetime.utcnow() - timedelta(days=days)
    rows = db.query(
        func.date(Visitor.created_at).label("d"),
        func.count().label("pv"),
        func.count(func.distinct(Visitor.fingerprint)).label("uv"),
    ).filter(Visitor.created_at >= since).group_by("d").all()
    return ok([{"date": str(r.d), "pv": int(r.pv), "uv": int(r.uv)} for r in rows])


@router.get("/top-notes")
def top_notes(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    notes = db.query(Note).filter(Note.deleted_at.is_(None)).order_by(Note.view_count.desc()).limit(limit).all()
    return ok([{"id": n.id, "title": n.title, "slug": n.slug, "view_count": n.view_count} for n in notes])


@router.get("/terminals")
def terminals(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(Visitor.terminal, func.count().label("c"))
        .filter(Visitor.created_at >= since)
        .group_by(Visitor.terminal)
        .order_by(func.count().desc())
        .all()
    )
    return ok([{"name": (r.terminal or "未知"), "value": int(r.c)} for r in rows])
