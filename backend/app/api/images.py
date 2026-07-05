import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Query
from fastapi.responses import JSONResponse
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.response import ok, fail
from app.core.deps import require_admin
from app.core.config import settings
from app.models.image import Image

router = APIRouter(prefix="/images", tags=["images"])

ALLOWED = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024


@router.get("")
def list_images(
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    q = db.query(Image)
    total = q.count()
    items = q.order_by(desc(Image.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    return ok({"items": [i.to_dict() for i in items], "total": total, "page": page, "page_size": page_size})


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    if file.content_type not in ALLOWED:
        return fail("不支持的图片格式", status=400)
    data = await file.read()
    if len(data) > MAX_SIZE:
        return fail("图片不能超过 5MB", status=400)

    ext = (file.filename or "x.png").rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    save_path = settings.upload_path / filename
    save_path.write_bytes(data)

    thumb = ""
    try:
        from PIL import Image as PILImage
        with PILImage.open(save_path) as im:
            im.thumbnail((320, 320))
            thumb_name = f"thumb_{filename}"
            thumb_path = settings.upload_path / thumb_name
            fmt = "JPEG" if ext in ("jpg", "jpeg") else im.format or "PNG"
            im.save(thumb_path, format=fmt)
            thumb = str(thumb_path)
    except Exception:
        thumb = ""

    img = Image(
        filename=filename, original_name=file.filename or filename,
        path=str(save_path), thumb_path=thumb, size=len(data), mime=file.content_type or "",
    )
    db.add(img)
    db.commit()
    db.refresh(img)
    return ok(img.to_dict())


@router.delete("/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    img = db.query(Image).filter(Image.id == image_id).first()
    if not img:
        return fail("图片不存在", status=404)
    # 删除文件
    for p in (img.path, img.thumb_path):
        try:
            if p:
                from pathlib import Path
                Path(p).unlink(missing_ok=True)
        except Exception:
            pass
    db.delete(img)
    db.commit()
    return ok({"id": image_id})
