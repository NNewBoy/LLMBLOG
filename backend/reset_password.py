#!/usr/bin/env python3
"""LLMBLOG 后台密码重置脚本。

用法：
    cd backend
    python reset_password.py              # 交互式输入新密码
    python reset_password.py newpass123   # 命令行直接传入

重置后无需重启服务（下次登录即用新密码）。
"""
import sys
import getpass
import hashlib

from app.db.database import SessionLocal
from app.models.setting import Setting
from app.core.security import hash_password


def main():
    # 获取新密码
    if len(sys.argv) > 1:
        new_password = sys.argv[1]
    else:
        new_password = getpass.getpass("请输入新密码: ")
        confirm = getpass.getpass("确认新密码: ")
        if new_password != confirm:
            print("两次输入不一致，已取消。")
            sys.exit(1)

    if not new_password or len(new_password) < 3:
        print("密码长度不能少于 3 位。")
        sys.exit(1)

    # 与前端登录流程一致：先 SHA256 预哈希，再 bcrypt
    pre_hashed = hashlib.sha256(new_password.encode("utf-8")).hexdigest()
    hashed = hash_password(pre_hashed)

    db = SessionLocal()
    try:
        s = db.query(Setting).filter(Setting.id == 1).first()
        if not s:
            s = Setting(id=1, admin_password_hash=hashed)
            db.add(s)
        else:
            s.admin_password_hash = hashed
        db.commit()
        print(f"\n✓ 密码已重置成功！新密码: {'*' * len(new_password)}")
        print("请使用新密码登录后台。")
    finally:
        db.close()


if __name__ == "__main__":
    main()
