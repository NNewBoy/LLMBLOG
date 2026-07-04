# LLMBLOG — 个人笔记博客

一个基于 Glassmorphism 设计风格的双主题（亮/暗）个人笔记博客系统。前台用于内容浏览与评论互动，后台用于笔记/图片/标签/评论/设置管理。前后端分离，Markdown 写作，移动 + PC 自适应。

> 设计基线：`SPEC.md`（软件规格）+ `design-system/MASTER.md`（主设计系统）+ `docs/UI-UX-DESIGN-PLAN.md`（页面级 UI/UX 规划）。

---

## 功能特性

- **笔记管理**：Markdown 写作（ByteMD 编辑器 + markdown-it 高速预览）、软删、置顶、标签、时间线归档、上下篇导航、PV 统计、Markdown 导入/导出
- **评论系统**：2 级嵌套、点赞、隐藏/删除、蜜罐反垃圾、3 次/分钟限流
- **图片管理**：上传自动生成 320px 缩略图（Pillow）、列表、删除
- **标签管理**：CRUD + 笔记关联
- **鉴权**：JWT（2h）、登录失败锁定（5 次失败 → 5 分钟）、前端 SHA256 预哈希 + 后端 bcrypt
- **主题**：亮 / 暗 / 跟随系统，localStorage 记忆，CSS 语义令牌驱动
- **响应式**：移动优先，断点 375 / 768 / 1024 / 1440；移动端顶栏抽屉化、侧栏隐藏
- **Glassmorphism**：`backdrop-filter` 毛玻璃 + `@supports` 实色降级
- **可访问性基线**：焦点环、键盘可达、aria-live Toast、reduced-motion 令牌
- **入口页**：Glassmorphism 门户（`/entry`），展示 Blog 主页 / 后台入口 + 配置化跳转链接，支持亮/暗主题切换并自动传递参数，点击计入访客统计

---

## 技术栈

### 前端（`frontend/`）

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3.4（Composition API + `<script setup>`） |
| 构建 | Vite 5 |
| 语言 | TypeScript 5 |
| UI 库 | Element Plus 2.7（按需导入，unplugin-vue-components + unplugin-auto-import） |
| 编辑器 | ByteMD 1.x（Svelte 内核，轻量 ~30KB）+ markdown-it（详情页预览） |
| 渲染 | markdown-it + highlight.js + KaTeX + Mermaid（详情页） |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| 请求 | Axios（统一响应解包 + 401 重定向） |
| 图表 | ECharts 5（按需引入 core，Dashboard 已接入） |
| 图标 | lucide-vue-next |

### 后端（`backend/`）

| 类别 | 技术 |
| --- | --- |
| 框架 | FastAPI 0.111 |
| ORM | SQLAlchemy 2.0 |
| 数据库 | SQLite（WAL 模式 + foreign_keys） |
| 校验 | Pydantic 2 / pydantic-settings |
| 鉴权 | python-jose（HS256 JWT）+ passlib/bcrypt |
| 渲染 | markdown-it + highlight.js + KaTeX + Mermaid（详情页预览） |
| 图片 | Pillow |
| 运行 | Uvicorn |

---

## 目录结构

```
LLMBLOG/
├── SPEC.md                       # 软件规格（含附录 B 实现状态）
├── README.md                     # 本文件
├── docker-compose.yml            # Docker Compose 编排（backend + nginx）
├── Dockerfile.nginx              # 前端多阶段构建 → Nginx 托管
├── .dockerignore
├── design-system/
│   └── MASTER.md                 # 主设计系统（单一事实来源）
├── docs/
│   └── UI-UX-DESIGN-PLAN.md      # 页面级 UI/UX 实施规划
├── deploy/
│   ├── nginx.conf                # 生产 Nginx 配置
│   ├── backup.sh                 # SQLite 备份（Linux/macOS）
│   └── backup.ps1                # SQLite 备份（Windows PowerShell）
├── backend/
│   ├── Dockerfile                # 后端镜像
│   ├── app/
│   │   ├── main.py               # FastAPI 入口（CORS / 静态挂载 / 路由 / 异常处理）
│   │   ├── core/                 # config / security / deps
│   │   ├── db/                   # database / init_db
│   │   ├── models/               # 7 个 ORM 模型
│   │   ├── schemas/              # Pydantic 入参/出参
│   │   ├── services/             # visitor（记录访客 + 入口点击）等业务逻辑
│   │   └── api/                  # auth / notes / tags / comments / images / stats / entry / settings
│   ├── requirements.txt
│   ├── reset_password.py          # 密码重置脚本
│   ├── .env.example              # 环境变量示例
│   └── uploads/                  # 图片上传目录（运行时生成）
└── frontend/
    ├── src/
    │   ├── api/                  # 接口封装 + sha256Hex
    │   ├── components/           # AppNavbar / AppDrawer / VditorEditor / ThemeToggle ...
    │   ├── layouts/              # FrontLayout / AdminLayout
    │   ├── router/               # 路由 + requiresAuth 守卫
    │   ├── stores/               # theme / auth（Pinia）
    │   ├── styles/               # variables / glass / element-overrides
    │   ├── utils/                # request（Axios）/ markdown（markdown-it 封装）
    │   └── views/
    │       ├── front/            # Entry / Home / Tags / Timeline / Search / NoteDetail
    │       └── admin/            # Dashboard / Notes / NoteEdit / Images / Tags / Comments / Settings
    ├── lighthouserc.cjs          # Lighthouse CI 配置
    ├── vite.config.ts            # Element Plus 按需导入 + /api → :8000 代理
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

> 备注：`passlib 1.7.4` 与 `bcrypt 4.x` 存在 `__about__` 属性兼容性问题，已通过 pin `bcrypt==3.2.2` 规避。如遇密码相关报错，运行 `python reset_password.py` 重置。

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

密码存储链：前端 `sha256(password)` → 后端 `bcrypt(sha256_hex)`。`init_db` 与 `settings.py` 已对齐该流程。

忘记密码时可在后端目录执行 `python reset_password.py` 重置（支持交互式或命令行传参）。

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
| `/stats/entry` | GET | 入口页点击统计（总量 + 各入口标题分布） | admin |
| `/entry/click` | POST | 记录入口页点击跳转 | 公开 |
| `/settings` | GET / PUT | 读取 / 更新（含 `entry_links` 配置） | GET 公开，PUT admin |

完整 OpenAPI：启动后端后访问 `http://127.0.0.1:8000/docs`。

---

## 构建与部署

### 方式一：Docker Compose（推荐）

```powershell
# 1. 准备后端环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env，修改 SECRET_KEY 和 CORS_ORIGINS

# 2. 一键启动（前端构建 + 后端 + Nginx）
docker compose up -d --build

# 3. 查看日志
docker compose logs -f
```

- 访问：`http://<服务器IP>`
- 前端镜像多阶段构建：Node 20 编译 → Nginx Alpine 托管
- 后端镜像：Python 3.12-slim + Uvicorn
- 数据卷：`db-data`（SQLite）+ `uploads`（图片，Nginx 只读挂载直出）
- Nginx 配置自动 `sed` 替换 `127.0.0.1:8000` → `backend:8000`

### 方式二：裸金属部署

#### 1. 前端打包

```powershell
cd frontend
npm run build       # 产物在 frontend/dist
```

将 `dist/` 内容拷贝到服务器 `/var/www/llmblog`。

#### 2. 后端生产启动

```powershell
cd backend
cp .env.example .env   # 编辑 .env，修改 SECRET_KEY 和 CORS_ORIGINS
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
```

建议用 systemd 管理进程：

```ini
# /etc/systemd/system/llmblog.service
[Unit]
Description=LLMBLOG Backend
After=network.target

[Service]
WorkingDirectory=/opt/llmblog/backend
ExecStart=/opt/llmblog/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

#### 3. Nginx 配置

参考 `deploy/nginx.conf`，拷贝到 `/etc/nginx/conf.d/llmblog.conf` 并按需修改：

- `root` — 前端 `dist/` 部署路径
- `location /api/` → `proxy_pass http://127.0.0.1:8000`
- `location /uploads/` → `alias` 指向后端 `uploads/` 目录
- 已含 gzip、安全响应头、SPA fallback、静态资源长缓存

#### 4. SQLite 定时备份

```bash
# Linux crontab（每日 03:00 备份，保留 7 天）
0 3 * * * /opt/llmblog/deploy/backup.sh /opt/llmblog/backend/app/data/app.db /opt/llmblog/backups 7
```

```powershell
# Windows 计划任务（每日 03:00）
.\deploy\backup.ps1 -DbPath app/data/app.db -BackupDir backups -RetainDays 7
```

备份脚本会先执行 `PRAGMA wal_checkpoint(TRUNCATE)` 合并 WAL，再安全拷贝 + 压缩，按天数自动清理旧备份。

### 环境变量

完整示例见 `backend/.env.example`：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `SECRET_KEY` | `dev-secret-change-me` | JWT 签名密钥（生产必须修改） |
| `ADMIN_PASSWORD_HASH` | 空 | 管理员密码哈希（留空则首次启动用 admin 初始化） |
| `DB_PATH` | `app/data/app.db` | SQLite 文件路径 |
| `UPLOAD_DIR` | `uploads` | 图片上传目录 |
| `CORS_ORIGINS` | `http://localhost:5173,...` | CORS 允许来源（逗号分隔，生产设为实际域名） |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `120` | JWT 过期时间（分钟） |

### Lighthouse CI（可选）

```powershell
cd frontend
npm install          # 安装 @lhci/cli
npm run build
npm run lhci         # 自动启动 preview 服务器 + 跑 Lighthouse + 断言
```

配置见 `frontend/lighthouserc.cjs`，报告输出到 `.lighthouseci/`。

---

## 实现状态（2026-07-03 快照）

> 图例：✅ 已完成 ｜ 🚧 部分完成 ｜ ⬜ 待开发

### 后端 — ✅ 全量完成

7 个数据模型、JWT 鉴权、auth/notes/tags/comments/images/stats/settings 全部路由可用，统一响应包络 + 全局异常处理 + OpenAPI 文档。

### 前端

| 里程碑 | 状态 | 说明 |
| --- | --- | --- |
| M1 基础架构 | ✅ | 脚手架、主题系统、布局、路由守卫、登录、通用组件 |
| M2 内容前台 | ✅ | 首页 / 标签云 / 时间线 / 搜索（含关键词高亮）；NoteDetail 已接入 Markdown 渲染（markdown-it + highlight.js + KaTeX 数学公式 + Mermaid 图表 + Task Lists）/ TOC 滚动高亮 / 阅读进度条 / 回顶 / 代码块复制 / 图片懒加载+灯箱 / 上下篇导航 / 评论区（2 级嵌套 + 蜜罐 + 点赞 + 回复） |
| M3 后台管理 | ✅ | 笔记 CRUD（含 Markdown 导入/导出）/ 图片 / 标签 / 评论 / 设置；Dashboard 已接入 ECharts（访客趋势折线 / 终端分布饼 / Top 笔记条形 / 入口访客统计条形 + 空/载/错三态 + 主题联动 + 7/30/90 天切换）；NoteEdit 已接入 ByteMD 编辑器（gfm/highlight/medium-zoom/math-ssr/mermaid 插件 + CodeMirror 主题切换）+ 自动保存（localStorage 30s 节流）+ Ctrl/⌘+S + 离开确认（ElMessageBox） |
| M4 优化打磨 | ✅ | 性能：Element Plus 按需导入（unplugin）+ 路由级懒加载；安全：后端安全响应头中间件（CSP/X-Frame-Options/COOP/Permissions-Policy）；动效：reduced-motion 全量化；可访问性：skip-link + aria-label + 亮色 accent 调至 indigo-600 通过 WCAG AA + heading 层级修正（每页唯一 h1，无跨级）；375px 响应式（header flex-wrap / dialog max-width / 表格横滚 / 超窄屏 padding 缩减）；Lighthouse CI 自动化（lighthouserc.cjs + npm run lhci）；布局：移动端抽屉统一为 AppDrawer 组件（前台/后台复用）+ el-scrollbar 接管页面滚动（body 固定 100vh、路由切换自动回顶）+ 统一菜单栏样式（navbar-h 64→58px） |
| M5 部署上线 | ✅ | Nginx 生产配置（SPA fallback / /api 反代 / /uploads 直出 / gzip / 安全头 / 静态长缓存）；SQLite 备份脚本（PowerShell + Bash，WAL checkpoint + 压缩 + 保留策略）；Docker 容器化（多阶段前端构建 + 后端 + docker-compose + .dockerignore）；环境变量示例 + README 部署章节（Docker / 裸金属 / systemd / cron 备份） |

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
