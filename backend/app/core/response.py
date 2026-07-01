from typing import Any, Optional
from fastapi.responses import JSONResponse


def ok(data: Any = None, message: str = "ok") -> dict:
    return {"code": 0, "message": message, "data": data}


def fail(message: str = "error", code: int = 1, status: int = 400, data: Any = None) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"code": code, "message": message, "data": data},
    )


class BizError(Exception):
    def __init__(self, message: str, code: int = 1, status: int = 400):
        self.message = message
        self.code = code
        self.status = status
