import time
from collections import defaultdict
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import verify_password, create_access_token, hash_password
from app.core.response import ok, fail
from app.core.deps import client_ip
from app.models.setting import Setting
from app.schemas.auth import LoginIn, TokenOut

router = APIRouter(prefix="/auth", tags=["auth"])

# 登录失败限流：IP -> (失败次数, 锁定到时间戳)
_fail: dict[str, list] = defaultdict(lambda: [0, 0])


@router.post("/login")
def login(body: LoginIn, request: Request, db: Session = Depends(get_db)):
    ip = client_ip(request)
    state = _fail[ip]
    if state[1] and time.time() < state[1]:
        wait = int(state[1] - time.time())
        return fail(f"登录失败次数过多，请 {wait} 秒后再试", code=429, status=429)

    s = db.query(Setting).filter(Setting.id == 1).first()
    stored = s.admin_password_hash if s else ""
    # body.password 为前端 SHA256 预哈希；存的是 bcrypt(预哈希)
    if not stored or not verify_password(body.password, stored):
        state[0] += 1
        if state[0] >= 5:
            state[1] = time.time() + 300
            state[0] = 0
            return fail("密码错误次数过多，已锁定 5 分钟", code=429, status=429)
        remain = 5 - state[0]
        return fail(f"密码错误，还剩 {remain} 次机会", status=401)
    _fail[ip] = [0, 0]
    token = create_access_token("admin")
    return ok({"token": token, "token_type": "bearer"})
