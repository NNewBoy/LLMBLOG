# LLMBLOG — 个人笔记博客

一个基于 Glassmorphism 设计风格的双主题（亮/暗）个人笔记博客系统。前台用于内容浏览与评论互动，后台用于笔记/图片/标签/评论/设置管理。前后端分离，Markdown 写作，移动 + PC 自适应。

> 设计基线：`SPEC.md`（软件规格）+ `design-system/MASTER.md`（主设计系统）+ `docs/UI-UX-DESIGN-PLAN.md`（页面级 UI/UX 规划）。

---

## 功能特性

- **笔记管理**：Markdown 写作（Vditor 所见即所得）、软删、置顶、标签、时间线归档、上下篇导航、PV 统计
- **评论系统**：2 级嵌套、点赞、隐藏/删除、蜜罐反垃圾、3 次/分钟限流
- **图片管理**：上传自动生成 320px 缩略图（Pillow）、列表、删除
- **标签管理**：CRUD + 笔记关联
- **鉴权**：JWT（2h）、登录失败锁定（5 次失败 → 5 分钟）、前端 SHA256 预哈希 + 后端 bcrypt
- **主题**：亮 / 暗 / 跟随系统，localStorage 记忆，CSS 语义令牌驱动
- **响应式**：移动优先，断点 375 / 768 / 1024 / 1440；移动端顶栏抽屉化、侧栏隐藏
- **Glassmorphism**：`backdrop-filter` 毛玻璃 + `@supports` 实色降级
- **可访问性基线**：焦点环、键盘可达、aria-live Toast、reduced-motion 令牌

---

## 技术栈

### 前端（`frontend/`）

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3.4（Composition API + `<script setup>`） |
| 构建 | Vite 5 |
| 语言 | TypeScript 5 |
| UI 库 | Element Plus 2.7 |
| 编辑器 | Vditor 3.9（动态 import） |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| 请求 | Axios（统一响应解包 + 401 重定向） |
| 图表 | ECharts 5（已装，Dashboard 图表待接入） |
| 图标 | lucide-vue-next |

### 后端（`backend/`）

| 类别 | 技术 |
| --- | --- |
| 框架 | FastAPI 0.111 |
| ORM | SQLAlchemy 2.0 |
| 数据库 | SQLite（WAL 模式 + foreign_keys） |
| 校验 | Pydantic 2 / pydantic-settings |
| 鉴权 | python-jose（HS256 JWT）+ passlib/bcrypt |
| 图片 | Pillow |
| 运行 | Uvicorn |

---

## 目录结构

```
LLMBLOG/
├── SPEC.md                       # 软件规格（含附录 B 实现状态）
├── README.md                     # 本文件
├── design-system/
│   └── MASTER.md                 # 主设计系统（单一事实来源）
├── docs/
│   └── UI-UX-DESIGN-PLAN.md      # 页面级 UI/UX 实施规划
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI 入口（CORS / 静态挂载 / 路由 / 异常处理）
│   │   ├── core/                 # config / security / deps
│   │   ├── db/                   # database / init_db
│   │   ├── models/               # 7 个 ORM 模型
│   │   ├── schemas/              # Pydantic 入参/出参
│   │   └── api/                  # auth / notes / tags / comments / images / stats / settings
│   ├── requirements.txt
│   └── uploads/                  # 图片上传目录（运行时生成）
└── frontend/
    ├── src/
    │   ├── api/                  # 接口封装 + sha256Hex
    │   ├── components/           # AppNavbar / VditorEditor / ThemeToggle ...
    │   ├── layouts/              # FrontLayout / AdminLayout
    │   ├── router/               # 路由 + requiresAuth 守卫
    │   ├── stores/               # theme / auth（Pinia）
    │   ├── styles/               # variables / glass / element-overrides
    │   ├── utils/                # request（Axios 实例）
    │   └── views/
    │       ├── auth/             # Login
    │       ├── front/            # Home / Tags / Timeline / Search / NoteDetail
    │       └── admin/            # Dashboard / Notes / NoteEdit / Images / Tags / Comments / Settings
    ├── vite.config.ts            # 含 /api → :8000 代理
    └── package.json
```

---

## 快速开始

### 1. 后端

```powershell
# 进入后端目录
cd backend

# 创建 Python 3.12 虚拟环境（Windows）
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1

# 安装依赖
python -m pip install -r requirements.txt

# 启动开发服务器（首次启动自动建表并写入默认 settings）
python -m uvicorn app.main:app --reload --port 8000
```

- 接口文档：`http://127.0.0.1:8000/docs`
- 默认管理员账号：`admin` / `admin`（**请登录后在「系统设置」中尽快修改密码**）

> 备注：启动日志中的 `(trapped) error reading bcrypt version` 来自 passlib 1.7.4 与 bcrypt 的兼容性探测，已被 pin `bcrypt==4.1.3` 规避，不影响功能。

### 2. 前端

```powershell
cd frontend
npm install
npm run dev
```

- 访问：`http://localhost:5173`
- Vite 已配置代理：`/api` → `http://127.0.0.1:8000`

---

## 默认凭据

| 项 | 值 |
| --- | --- |
| 用户名 | `admin` |
| 初始密码 | `admin` |
| 登录入口 | `/login` |
| 修改路径 | 后台 → 系统设置 → 修改密码 |

密码存储链：前端 `sha256(password)` → 后端 `bcrypt(sha256_hex)`。`init_db` 已对齐该流程。

---

## API 概览

所有接口前缀：`/api/v1`，统一响应包络：

```json
{ "code": 0, "message": "ok", "data": { ... } }
```

| 路由组 | 方法 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| `/auth/login` | POST | 登录（含失败计数锁定） | 公开 |
| `/notes` | GET | 列表（分页 / 标签 / 关键词） | 公开 |
| `/notes/timeline` | GET | 时间线归档 | 公开 |
| `/notes/{slug}` | GET | 详情（PV+1 / 上下篇） | 公开 |
| `/notes` | POST | 创建 | admin |
| `/notes/{id}` | PUT | 更新 | admin |
| `/notes/{id}` | DELETE | 软删 | admin |
| `/notes/{id}/pin` | PATCH | 置顶切换 | admin |
| `/tags` | GET / POST / PUT / DELETE | 标签 CRUD | GET 公开，写 admin |
| `/comments` | GET / POST | 列表 / 创建（蜜罐 + 限流） | 公开 |
| `/comments/{id}/like` | POST | 点赞 | 公开 |
| `/comments/{id}/hide` | PATCH | 隐藏切换 | admin |
| `/comments/all` | GET | 全量列表（后台） | admin |
| `/comments/{id}` | DELETE | 删除 | admin |
| `/images` | GET / POST | 列表 / 上传（缩略图） | GET 公开，POST admin |
| `/images/{id}` | DELETE | 删除（同步删文件） | admin |
| `/stats` | GET | Dashboard 概览 | admin |
| `/settings` | GET / PUT | 读取 / 更新 | GET 公开，PUT admin |

完整 OpenAPI：启动后端后访问 `http://127.0.0.1:8000/docs`。

---

## 构建与部署

### 前端打包

```powershell
cd frontend
npm run build       # 产物在 frontend/dist
```

### 后端生产启动

```powershell
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Nginx 参考拓扑

- 前端 `dist/` 部署为静态站点，SPA history 模式需 `try_files $uri $uri/ /index.html`
- `/api` 反向代理到 Uvicorn
- `/uploads` 可由 Nginx 直出静态文件
- SQLite 定时备份：cron 拷贝 `.db` + `PRAGMA wal_checkpoint(TRUNCATE)`

### 环境变量（可选，覆盖默认值）

| 变量 | 用途 |
| --- | --- |
| `SECRET_KEY` | JWT 签名密钥 |
| `DB_PATH` | SQLite 文件路径 |
| `UPLOAD_DIR` | 图片上传目录 |
| `CORS_ORIGINS` | CORS 允许来源（逗号分隔） |

---

## 实现状态（2026-07-02 快照）

> 图例：✅ 已完成 ｜ 🚧 部分完成 ｜ ⬜ 待开发

### 后端 — ✅ 全量完成

7 个数据模型、JWT 鉴权、auth/notes/tags/comments/images/stats/settings 全部路由可用，统一响应包络 + 全局异常处理 + OpenAPI 文档。

### 前端

| 里程碑 | 状态 | 说明 |
| --- | --- | --- |
| M1 基础架构 | ✅ | 脚手架、主题系统、布局、路由守卫、登录、通用组件 |
| M2 内容前台 | ✅ | 首页 / 标签云 / 时间线 / 搜索（含关键词高亮）；NoteDetail 已接入 Markdown 渲染（Vditor.preview）/ TOC 滚动高亮 / 阅读进度条 / 回顶 / 代码块复制 / 图片懒加载+灯箱 / 上下篇导航 / 评论区（2 级嵌套 + 蜜罐 + 点赞 + 回复） |
| M3 后台管理 | ✅ | 笔记 CRUD / 图片 / 标签 / 评论 / 设置；Dashboard 已接入 ECharts（访客趋势折线 / 终端分布饼 / Top 笔记条形 + 空/载/错三态 + 主题联动 + 7/30/90 天切换）；NoteEdit 已接入自动保存（localStorage 30s 节流）+ Ctrl/⌘+S + 离开确认 |
| M4 优化打磨 | ⬜ | Vditor 分包、虚拟滚动、reduced-motion 全量化、可访问性回归 |
| M5 部署上线 | ⬜ | 打包脚本、Nginx 配置、备份脚本 |

详细落地情况见 `SPEC.md` 附录 B 与 `docs/UI-UX-DESIGN-PLAN.md` §9。

---

## 文档索引

| 文档 | 内容 |
| --- | --- |
| [SPEC.md](SPEC.md) | 软件规格：需求 / 数据模型 / API / 里程碑 + 附录 B 实现状态 |
| [design-system/MASTER.md](design-system/MASTER.md) | 主设计系统：令牌 / 组件 / 可访问性 + §12 落地状态 |
| [docs/UI-UX-DESIGN-PLAN.md](docs/UI-UX-DESIGN-PLAN.md) | 页面级 UI/UX 规划：组件 / 图表 / 响应式 + §9 实现状态 |

---

## 开发约定

- 前端：组件用 `<script setup lang="ts">`，样式优先使用 `variables.css` 语义令牌，禁止裸 hex
- 后端：路由统一挂在 `/api/v1`，所有出参走 `ResponseModel` 包装，异常走全局处理器
- 提交前：`npm run build`（含 vue-tsc 类型检查）通过 + 后端 `/docs` 冒烟
- 不向仓库提交 `.env`、`app.db`、`uploads/`、`node_modules/`、`.venv/`
