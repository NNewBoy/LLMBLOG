from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import decode_access_token
from app.core.config import settings


def get_token(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未授权")
    return authorization[len("Bearer "):]


def require_admin(token: str = Depends(get_token)) -> str:
    sub = decode_access_token(token)
    if not sub:
        raise HTTPException(status_code=401, detail="Token 无效或已过期")
    return sub


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else ""


def parse_terminal(ua: str) -> str:
    ua = (ua or "").lower()
    os = "未知"
    if "windows" in ua:
        os = "Windows"
    elif "mac os" in ua or "macintosh" in ua:
        os = "macOS"
    elif "android" in ua:
        os = "Android"
    elif "iphone" in ua or "ipad" in ua:
        os = "iOS"
    elif "linux" in ua:
        os = "Linux"
    browser = "未知"
    if "edg" in ua:
        browser = "Edge"
    elif "chrome" in ua:
        browser = "Chrome"
    elif "firefox" in ua:
        browser = "Firefox"
    elif "safari" in ua:
        browser = "Safari"
    return f"{os} · {browser}"
