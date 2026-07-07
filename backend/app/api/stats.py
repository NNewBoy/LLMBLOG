from datetime import timedelta
import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.response import ok
from app.core.deps import require_admin
from app.models.note import Note
from app.models.comment import Comment
from app.models.visitor import Visitor
from app.models.setting import Setting
from app.utils.timezone import now_naive

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
    since = now_naive() - timedelta(days=days)
    rows = db.query(
        func.date(Visitor.created_at).label("d"),
        func.count().label("pv"),
        func.count(func.distinct(Visitor.fingerprint)).label("uv"),
    ).filter(Visitor.created_at >= since).group_by("d").all()
    return ok([{"date": str(r.d), "pv": int(r.pv), "uv": int(r.uv)} for r in rows])


@router.get("/top-notes")
def top_notes(
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    since = now_naive() - timedelta(days=days)
    # 按笔记访问路径统计窗口内访问数与访客数（path 形如 /note/{slug}）
    rows = (
        db.query(
            Visitor.path,
            func.count().label("c"),
            func.count(func.distinct(Visitor.fingerprint)).label("uv"),
        )
        .filter(
            Visitor.source == "note",
            Visitor.created_at >= since,
            Visitor.path.like("/note/%"),
        )
        .group_by(Visitor.path)
        .order_by(func.count().desc())
        .limit(limit)
        .all()
    )
    slug_stats: dict[str, dict[str, int]] = {}
    for r in rows:
        slug = (r.path or "").replace("/note/", "", 1)
        if slug:
            slug_stats[slug] = {"count": int(r.c), "uv": int(r.uv)}
    result = []
    if slug_stats:
        notes = (
            db.query(Note)
            .filter(Note.slug.in_(list(slug_stats)), Note.deleted_at.is_(None))
            .all()
        )
        note_map = {n.slug: n for n in notes}
        # 保持按窗口内访问数倒序
        for slug, stats in slug_stats.items():
            n = note_map.get(slug)
            if n:
                result.append({
                    "id": n.id, "title": n.title, "slug": n.slug,
                    "view_count": stats["count"], "uv": stats["uv"],
                })
    return ok(result)


@router.get("/terminals")
def terminals(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    since = now_naive() - timedelta(days=days)
    rows = (
        db.query(Visitor.terminal, func.count().label("c"))
        .filter(Visitor.created_at >= since)
        .group_by(Visitor.terminal)
        .order_by(func.count().desc())
        .all()
    )
    return ok([{"name": (r.terminal or "未知"), "value": int(r.c)} for r in rows])


@router.get("/entry")
def entry_stats(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    """入口页点击统计：总点击数/总访客数与各入口标题的点击数/访客数。"""
    since = now_naive() - timedelta(days=days)
    base = db.query(Visitor).filter(Visitor.source == "entry", Visitor.created_at >= since)
    total = base.count()
    total_uv = db.query(func.count(func.distinct(Visitor.fingerprint))).filter(
        Visitor.source == "entry", Visitor.created_at >= since
    ).scalar() or 0
    rows = (
        db.query(
            Visitor.target,
            func.count().label("c"),
            func.count(func.distinct(Visitor.fingerprint)).label("uv"),
        )
        .filter(Visitor.source == "entry", Visitor.created_at >= since)
        .group_by(Visitor.target)
        .order_by(func.count().desc())
        .all()
    )

    # 构建 target → title 映射
    title_map: dict[str, str] = {"/": "Blog 主页", "/admin": "Blog 后台", '/entry': '入口页'}
    setting = db.query(Setting).first()
    if setting:
        for link in json.loads(setting.entry_links or "[]"):
            url = link.get("url", "")
            if url:
                title_map[url] = link.get("title", url)

    return ok({
        "total": total,
        "total_uv": int(total_uv),
        "targets": [
            {
                "title": title_map.get(r.target or "", r.target or "(未知)"),
                "count": int(r.c),
                "uv": int(r.uv),
            }
            for r in rows
        ],
    })
