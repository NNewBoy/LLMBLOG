"""统一时区工具 - 使用东八区 (UTC+8) 时间"""

from datetime import datetime, timezone, timedelta

# 东八区时区
TZ = timezone(timedelta(hours=8))


def now() -> datetime:
    """返回当前东八区时间（带时区信息）"""
    return datetime.now(TZ)


def now_naive() -> datetime:
    """返回当前东八区时间（无时区信息，用于 SQLAlchemy 默认值）"""
    return datetime.now(TZ).replace(tzinfo=None)
