from sqlalchemy.orm import Session

from app.models.visitor import Visitor, make_fingerprint
from app.core.deps import parse_terminal


def record_visit(db: Session, path: str, ip: str, ua: str, source: str = "note", target: str = ""):
    """记录一次访客访问。

    Args:
        db: 数据库会话
        path: 访问路径（笔记为 /note/{slug}，入口页为入口标识）
        ip: 客户端 IP
        ua: User-Agent
        source: 访问来源，note=笔记详情，entry=入口页点击
        target: 跳转目标网页（仅 source=entry 时使用）
    """
    v = Visitor(
        ip=ip,
        ua=ua[:500],
        fingerprint=make_fingerprint(ip, ua),
        path=path[:250],
        source=source[:32],
        target=target[:250],
        terminal=parse_terminal(ua),
    )
    db.add(v)
    db.commit()


def record_entry_click(db: Session, target: str, ip: str, ua: str):
    """记录入口页的一次点击跳转。

    Args:
        db: 数据库会话
        target: 跳转目标网页地址或标识（如 /、/admin、外部 URL）
        ip: 客户端 IP
        ua: User-Agent
    """
    record_visit(db, path="/entry", ip=ip, ua=ua, source="entry", target=target)
