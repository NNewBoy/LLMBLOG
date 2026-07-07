from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.response import fail
from app.db.database import SessionLocal
from app.db.init_db import init_db, migrate, ensure_default_settings
from app.api import auth, notes, tags, comments, images, stats, settings as settings_api, entry, visit


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        # migrate(db)
        ensure_default_settings(db)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """附加安全响应头。CSP 允许 /docs 所需的 inline script/style 与上传图片。"""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), interest-cohort=()"
        response.headers["X-XSS-Protection"] = "0"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data: https:; "
            "style-src 'self' 'unsafe-inline'; "
            "script-src 'self' 'unsafe-inline'; "
            "connect-src 'self'; "
            "font-src 'self' data:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态资源：上传的图片
app.mount("/llmblog_uploads", StaticFiles(directory=str(settings.upload_path)), name="uploads")

# 路由
api_prefix = settings.API_V1_PREFIX
app.include_router(auth.router, prefix=api_prefix)
app.include_router(notes.router, prefix=api_prefix)
app.include_router(tags.router, prefix=api_prefix)
app.include_router(comments.router, prefix=api_prefix)
app.include_router(images.router, prefix=api_prefix)
app.include_router(stats.router, prefix=api_prefix)
app.include_router(settings_api.router, prefix=api_prefix)
app.include_router(entry.router, prefix=api_prefix)
app.include_router(visit.router, prefix=api_prefix)


@app.exception_handler(RequestValidationError)
async def _validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"code": 422, "message": "参数校验失败", "data": exc.errors()},
    )


@app.exception_handler(Exception)
async def _global_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"code": 500, "message": "服务器内部错误", "data": None},
    )


@app.get("/")
def root():
    return {"code": 0, "message": "LLMBLOG API is running", "data": None}
