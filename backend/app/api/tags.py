from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.response import ok, fail
from app.core.deps import require_admin
from app.models.tag import Tag, NoteTag
from app.models.note import Note
from app.schemas.tag import TagCreate, TagUpdate

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("")
def list_tags(db: Session = Depends(get_db)):
    counts = (
        db.query(NoteTag.tag_id, func.count(NoteTag.note_id))
        .group_by(NoteTag.tag_id).all()
    )
    cnt = {tid: c for tid, c in counts}
    tags = db.query(Tag).order_by(Tag.name).all()
    return ok([t.to_dict(note_count=cnt.get(t.id, 0)) for t in tags])


@router.post("")
def create_tag(body: TagCreate, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    if db.query(Tag).filter(Tag.name == body.name).first():
        return fail("标签名已存在", status=400)
    t = Tag(name=body.name, description=body.description, color=body.color)
    db.add(t)
    db.commit()
    db.refresh(t)
    return ok(t.to_dict(0))


@router.put("/{tag_id}")
def update_tag(tag_id: int, body: TagUpdate, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    t = db.query(Tag).filter(Tag.id == tag_id).first()
    if not t:
        return fail("标签不存在", status=404)
    if body.name is not None and body.name != t.name:
        if db.query(Tag).filter(Tag.name == body.name).first():
            return fail("标签名已存在", status=400)
        t.name = body.name
    if body.description is not None:
        t.description = body.description
    if body.color is not None:
        t.color = body.color
    db.commit()
    return ok(t.to_dict())


@router.delete("/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    t = db.query(Tag).filter(Tag.id == tag_id).first()
    if not t:
        return fail("标签不存在", status=404)
    db.delete(t)  # note_tags 关联通过 ondelete cascade 清理
    db.commit()
    return ok({"id": tag_id})
