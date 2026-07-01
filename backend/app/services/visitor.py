from datetime import datetime
from sqlalchemy.orm import Session

from app.models.visitor import Visitor, make_fingerprint
from app.core.deps import parse_terminal


def record_visit(db: Session, path: str, ip: str, ua: str):
    v = Visitor(
        ip=ip,
        ua=ua[:500],
        fingerprint=make_fingerprint(ip, ua),
        path=path[:250],
        terminal=parse_terminal(ua),
    )
    db.add(v)
    db.commit()
