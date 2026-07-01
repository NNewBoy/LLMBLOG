# 个人笔记博客软件规格说明书（SPEC）

> 版本：v1.0  
> 日期：2026-07-02  
> 状态：基线版本

---

## 1. 概述

### 1.1 项目目标

构建一个个人笔记博客系统，支持笔记的编辑、展示与评论。系统面向博主本人（后台管理）与访客（前台浏览评论）两类用户，兼容 PC 与移动端，采用 Glassmorphism 视觉风格，支持浅色/深色主题切换。

### 1.2 项目范围

| 范围 | 说明 |
| --- | --- |
| 前台展示 | 主页、标签页、时间线页、笔记详情页 |
| 后台管理 | 分析概览、笔记/图片/标签/评论管理、系统设置 |
| 评论系统 | 匿名评论、回复、点赞、终端/地址识别 |
| 访客统计 | 访问量、访客数、日线图 |
| 不在范围 | 多用户注册登录体系、付费内容、邮件订阅 |

### 1.3 术语表

| 术语 | 含义 |
| --- | --- |
| 博主 | 拥有后台密码、可管理内容的系统所有者 |
| 访客 | 前台浏览/评论的匿名用户 |
| 笔记 | 一篇 Markdown 博客文章 |
| TOC | Table of Contents，笔记目录 |
| Glassmorphism | 毛玻璃拟态 UI 风格 |
| UV/PV | 独立访客数 / 页面访问数 |

---

## 2. 总体设计

### 2.1 系统架构

```
┌─────────────────────────────────────────────────────┐
│  前端 (SPA)  Vue3 + Vite + TS + Element Plus + Vditor │
│  ┌──────────────┐         ┌────────────────────────┐ │
│  │  前台模块     │         │  后台模块（密码鉴权）    │ │
│  │ 主页/详情/评论│         │ 概览/笔记/图片/标签/评论│ │
│  └──────┬───────┘         └───────────┬────────────┘ │
└─────────┼─────────────────────────────┼──────────────┘
          │  HTTPS / REST + JSON         │
┌─────────▼─────────────────────────────▼──────────────┐
│  后端  Python + FastAPI                               │
│  路由层 → 服务层 → 数据访问层                          │
│  ┌────────┬────────┬────────┬────────┬──────────┐    │
│  │笔记API │评论API │图片API │标签API │统计/设置API│   │
│  └───┬────┴───┬────┴───┬────┴───┬────┴─────┬────┘    │
│      │        │        │        │          │         │
│   ┌──▼────────▼────────▼────────▼──────────▼──┐      │
│   │  SQLite (notes/comments/tags/images/...)   │      │
│   └────────────────────────────────────────────┘      │
│   ┌────────────────────────────────────────────┐      │
│   │  文件系统 uploads/（图片静态资源）           │      │
│   └────────────────────────────────────────────┘      │
└───────────────────────────────────────────────────────┘
```

### 2.2 技术栈

| 层 | 技术 | 版本建议 | 用途 |
| --- | --- | --- | --- |
| 前端框架 | Vue 3 | 3.4+ | 组合式 API |
| 构建工具 | Vite | 5+ | 开发/打包 |
| 语言 | TypeScript | 5+ | 类型安全 |
| UI 组件 | Element Plus | 2.6+ | 后台组件 |
| Markdown 编辑器 | Vditor | 3.9+ | 所见即所得编辑 |
| Markdown 渲染 | Vditor / markdown-it | - | 前台渲染 |
| 路由 | Vue Router | 4+ | SPA 路由 |
| 状态 | Pinia | 2+ | 主题/设置/用户态 |
| HTTP | Axios | 1+ | 请求封装 |
| 图表 | ECharts | 5+ | 访客日线图 |
| 后端框架 | FastAPI | 0.110+ | REST API |
| ASGI | Uvicorn | - | 部署服务 |
| ORM | SQLAlchemy | 2.0+ | 数据访问 |
| 数据库 | SQLite | 3.40+ | 持久化（可平滑迁移至 PostgreSQL） |
| 迁移 | Alembic | - | 表结构版本管理 |

### 2.3 前端目录结构（建议）

```
src/
├── api/              # 接口封装（notes/comments/tags/...）
├── assets/           # 静态资源
├── components/       # 通用组件（GlassCard/TOC/Pagination/...）
├── composables/      # useTheme / useVisitor / useToc
├── layouts/          # FrontLayout / AdminLayout
├── router/           # 路由 + 守卫
├── stores/           # theme / settings / auth
├── styles/           # 主题变量、Glassmorphism 样式
├── views/
│   ├── front/        # Home/Tags/Timeline/NoteDetail/Search
│   └── admin/          Dashboard/Notes/NoteEdit/Images/Tags/Comments/Settings/Login
├── types/            # TS 类型定义
└── utils/            # request / format / highlight
```

### 2.4 后端目录结构（建议）

```
app/
├── api/              # 路由（notes/comments/tags/images/stats/settings/auth）
├── core/             # 配置、安全、依赖注入
├── models/           # ORM 模型
├── schemas/          # Pydantic 校验模型
├── services/         # 业务逻辑
├── db/               # 数据库连接、初始化、迁移
├── uploads/          # 图片静态资源
└── main.py           # 入口
```

---

## 3. 功能需求

### 3.1 前台 — 主页模块

#### 3.1.1 顶部菜单栏

- **左侧菜单**：首页、标签、时间线。移动端折叠为抽屉（Drawer），点击汉堡按钮展开。
- **右侧工具**：搜索按钮、主题切换按钮。
- **样式**：固定顶部，Glassmorphism 半透明 + 背景模糊（`backdrop-filter: blur()`），滚动时增强阴影。

#### 3.1.2 首页笔记列表

- 列表项字段：标题、创建时间、查看次数、评论数、内容摘要（前 N 字）、标签列表。
- 交互：点击跳转笔记详情；点击标签跳转标签分类页。
- **优化**：
  - 支持分页或无限滚动（每页 10 条，可配置）。
  - 列表卡片使用 Glassmorphism 卡片样式，hover 上浮 + 高光。
  - 摘要由正文自动截取（去除 Markdown 语法），长度可配置。
  - 置顶笔记优先展示（新增 `is_pinned` 字段）。
  - 隐藏笔记不展示。

#### 3.1.3 标签分类页

- 顶部标签云（字号映射笔记数量），下方选中标签的笔记标题列表。
- 列表项：标题、创建时间、查看次数；点击跳转详情。
- **优化**：标签云支持首字母/拼音排序，支持搜索标签。

#### 3.1.4 时间线页

- 按年份分组，年份下按月份倒序展示笔记标题列表。
- 列表项：标题、日期、查看次数；点击跳转详情。
- **优化**：支持按标签/关键字筛选时间线内容。

#### 3.1.5 搜索功能

- 全局搜索笔记（标题 + 正文 + 标签）。
- **优化**：
  - 关键字高亮命中片段。
  - 搜索结果按相关度排序，展示摘要上下文。
  - 搜索输入支持防抖（300ms）。
  - 移动端以全屏弹层呈现搜索框。

#### 3.1.6 主题切换

- 浅色 / 深色两套主题，通过 CSS 变量驱动。
- 切换按钮带过渡动画，记忆用户选择（localStorage），首次访问跟随系统 `prefers-color-scheme`。
- 两套主题均保持 Glassmorphism 风格，深色主题降低模糊层不透明度、提升对比度。

#### 3.1.7 右侧侧边栏（移动端隐藏）

- 个人信息：博主头像、名称、描述、统计（笔记数/访问数）。
- **优化**：
  - 最新评论 widget。
  - 标签云 widget（快捷入口）。
  - 友链/社交链接（可选，由系统设置控制显隐）。

### 3.2 前台 — 笔记详情页

#### 3.2.1 笔记内容展示

- 顶部信息：标题、创建时间、更新时间、查看次数、评论数、标签。
- 正文：Markdown 渲染，代码高亮，支持公式（KaTeX）、图表、任务列表、表情。
- **优化**：
  - 代码块右上角「复制」按钮。
  - 图片懒加载 + 点击放大（图片预览）。
  - 顶部阅读进度条。
  - 文末「上一篇 / 下一篇」导航。
  - 访问详情页时后端 PV +1，UV 按 IP+UA 去重。
  - 隐藏笔记返回 404 页面。

#### 3.2.2 目录导航（右侧，移动端隐藏）

- 根据 Markdown 标题（h1-h3）自动生成 TOC。
- 滚动时高亮当前章节（IntersectionObserver）。
- 点击 TOC 项平滑滚动到对应位置。

#### 3.2.3 评论系统

- 无需登录，访客填写昵称（可选，默认「匿名访客」）即可评论。
- 支持回复评论（二级嵌套，避免无限层级），支持点赞评论。
- 评论展示字段：昵称、头像（自动生成或 Gravatar）、时间、地址（省市级，由 IP 解析）、终端类型（浏览器/系统）、身份标识（博主/其他）。
- **优化**：
  - 评论分页（每页 10 条），支持按热度/时间排序。
  - 评论提交防刷：IP 限流（如 60s 内最多 3 条）+ 蜜罐字段 + 敏感词过滤。
  - 博主评论带特殊标识（徽章 + 高亮）。
  - 评论支持 Markdown 子集（粗体/斜体/链接/代码）。
  - 提交后即时乐观更新，失败回滚并提示。

#### 3.2.4 回到顶部

- 右侧底部悬浮按钮，滚动超过一屏后出现。
- 点击平滑滚动回顶部。

### 3.3 后台模块

#### 3.3.1 认证

- 进入后台需输入密码；密码校验成功后下发短期 Token（JWT，2h 有效期），存于内存 + sessionStorage。
- 所有后台写操作 API 需携带 Token，后端中间件校验。
- **优化**：
  - 密码在前端哈希后再传输（防明文），后端再校验加盐哈希。
  - 登录失败次数限制（5 次失败锁定 5 分钟）。
  - Token 即将过期时静默续签。
  - 路由守卫拦截未授权访问，重定向登录页。

#### 3.3.2 分析概览

- 指标卡片：笔记总数、总访客数（UV）、总访问数（PV）、评论总数。
- 访客量日线图（近 30 天，可切换 7/30/90 天）。
- **优化**：
  - 热门笔记 Top 5（按 PV）。
  - 访问来源/终端分布饼图。

#### 3.3.3 笔记管理

- 列表页：标题、作者、标签、创建时间、更新时间、状态（隐藏/显示/草稿）、操作（编辑/删除/隐藏切换）。
- 支持按标题/标签/状态筛选与搜索，分页。
- **笔记信息字段**：标题、作者、标签（多选）、创建时间、更新时间、是否隐藏、是否置顶、摘要、正文。
- **编辑功能**：Vditor 所见即所得，支持分屏边编辑边预览。工具栏：标题、粗体、斜体、引用、链接、图片、行内代码、代码块、无序列表、有序列表、高亮块、删除线、任务列表、公式、图表、表情、撤销、重做。
- **优化**：
  - 草稿/发布两态，支持定时发布（可选）。
  - 自动保存（每 30s + 失焦时），保存状态指示。
  - 图片上传时自动入库并返回引用地址。
  - 编辑器快捷键（Ctrl+S 保存、Ctrl+B 加粗等）。
  - 删除二次确认，软删除（可回收）。
  - 笔记 Slug 自定义（默认用 ID），用于友好 URL。

#### 3.3.4 图片管理

- 网格展示所有图片缩略图，显示引用次数（被哪些笔记使用）。
- 支持上传、删除、重命名、复制引用地址。
- 图片保存在后端 `uploads/` 目录，元信息入库。
- **优化**：
  - 上传时自动生成缩略图（节省列表页流量）。
  - 限制单文件大小（如 5MB）与格式（jpg/png/gif/webp）。
  - 删除前校验是否被引用，被引用时给出警告。
  - 按上传时间/大小/引用数排序与筛选。

#### 3.3.5 标签管理

- 列表展示标签及关联笔记数。
- 增删改：名称、描述、颜色（可选）。
- **优化**：
  - 删除标签时可选「仅删除标签」或「删除标签及关联关系」。
  - 重名/拼音冲突校验。
  - 批量合并标签。

#### 3.3.6 评论管理

- 列表展示全部评论：笔记标题、昵称、内容、时间、IP/地址、终端、点赞数、状态。
- 支持删除、回复（以博主身份）、隐藏/显示。
- **优化**：按笔记/状态/时间筛选，批量删除，敏感评论标记。

#### 3.3.7 系统设置

- 博主信息：名称、描述、头像、社交链接。
- 站点信息：网站图标、网站名称、网站描述、关键词。
- 备案信息：IPC 备案号、IPC 备案网址、公安备案号、公安备案网址、公安备案 Logo 地址。
- **优化**：
  - 设置项分组 + 表单校验。
  - 头像/图标走图片管理上传。
  - 修改后即时生效（前端缓存 + 后端推送）。
  - 支持导出/导入配置（JSON 备份）。

---

## 4. 数据模型

### 4.1 ER 概览

```
notes ──< note_tags >── tags
  │
  └──< comments
images
visitors
settings (单行配置表)
```

### 4.2 表结构

#### notes
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER PK | 自增主键 |
| slug | TEXT UNIQUE | URL 友好标识 |
| title | TEXT | 标题 |
| author | TEXT | 作者 |
| summary | TEXT | 摘要（可空则自动生成） |
| content | TEXT | Markdown 正文 |
| status | TEXT | draft / published / hidden |
| is_pinned | INTEGER | 0/1 是否置顶 |
| view_count | INTEGER | 查看次数 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| deleted_at | DATETIME | 软删除时间（可空） |

#### tags
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER PK | |
| name | TEXT UNIQUE | 标签名 |
| description | TEXT | 描述 |
| color | TEXT | 颜色（可空） |
| created_at | DATETIME | |

#### note_tags
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| note_id | INTEGER FK | |
| tag_id | INTEGER FK | |
| | PK(note_id, tag_id) | 联合主键 |

#### comments
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER PK | |
| note_id | INTEGER FK | |
| parent_id | INTEGER FK | 父评论 ID（可空，二级嵌套） |
| nickname | TEXT | 昵称 |
| content | TEXT | 评论内容（Markdown 子集） |
| ip | TEXT | 访客 IP |
| location | TEXT | 地址（省市） |
| user_agent | TEXT | UA |
| terminal | TEXT | 终端类型 |
| is_author | INTEGER | 0/1 是否博主 |
| like_count | INTEGER | 点赞数 |
| status | TEXT | normal / hidden |
| created_at | DATETIME | |

#### images
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER PK | |
| filename | TEXT | 存储文件名 |
| original_name | TEXT | 原始名 |
| path | TEXT | 相对路径 |
| thumb_path | TEXT | 缩略图路径 |
| size | INTEGER | 字节数 |
| mime | TEXT | 类型 |
| created_at | DATETIME | |

#### visitors
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER PK | |
| ip | TEXT | |
| ua | TEXT | |
| fingerprint | TEXT | IP+UA 哈希，用于 UV 去重 |
| path | TEXT | 访问路径 |
| terminal | TEXT | 终端 |
| created_at | DATETIME | |

#### settings（单行表，id=1）
存储博主信息、站点信息、备案信息、后台密码哈希等 JSON 化或扁平字段。

---

## 5. API 设计（REST）

> 前缀 `/api/v1`。后台写接口需 `Authorization: Bearer <token>`。

### 5.1 笔记
| 方法 | 路径 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| GET | `/notes` | 列表（分页/筛选/排序） | 否 |
| GET | `/notes/{slug\|id}` | 详情（PV+1） | 否 |
| POST | `/notes` | 创建 | 是 |
| PUT | `/notes/{id}` | 更新 | 是 |
| DELETE | `/notes/{id}` | 软删除 | 是 |
| GET | `/notes/timeline` | 时间线聚合 | 否 |

### 5.2 标签
| GET | `/tags` | 标签及笔记数 | 否 |
| POST/PUT/DELETE | `/tags/{id}` | 增改删 | 是 |

### 5.3 评论
| 方法 | 路径 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| GET | `/notes/{id}/comments` | 评论列表（分页） | 否 |
| POST | `/notes/{id}/comments` | 发表评论 | 否（限流） |
| POST | `/comments/{id}/like` | 点赞 | 否（限流） |
| PUT/DELETE | `/comments/{id}` | 编辑/删除 | 是 |

### 5.4 图片
| 方法 | 路径 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| GET | `/images` | 图片列表 | 是 |
| POST | `/images` | 上传 | 是 |
| PUT/DELETE | `/images/{id}` | 改/删 | 是 |

### 5.5 统计 / 设置 / 认证
| 方法 | 路径 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| GET | `/stats/overview` | 概览指标 | 是 |
| GET | `/stats/visitors?days=30` | 访客日线 | 是 |
| GET | `/settings` | 公开设置（站点/博主/备案） | 否 |
| PUT | `/settings` | 更新设置 | 是 |
| POST | `/auth/login` | 登录获取 Token | 否 |

统一响应体：
```json
{ "code": 0, "message": "ok", "data": {} }
```
错误码：0 成功；401 未授权；403 禁止；404 不存在；429 限流；500 服务器错误。

---

## 6. 非功能性需求

### 6.1 兼容性
- PC：Chrome / Edge / Firefox / Safari 最近两个大版本。
- 移动端：iOS Safari 15+、Android Chrome 90+。
- 响应式断点：`<768px` 移动端、`768–1200px` 平板、`>1200px` 桌面。
- 移动端：菜单抽屉化、侧边栏与 TOC 隐藏、字号/间距自适应。

### 6.2 性能
- 首屏 LCP < 2.5s（中等内容量）。
- 路由懒加载，按视图分包。
- 图片懒加载 + 缩略图 + WebP 优先。
- 后端对公开接口（笔记列表、详情）做内存缓存（如 `cachetools` TTL 60s），写入时失效。
- SQLite 开启 WAL 模式，索引覆盖外键与常用查询字段。

### 6.3 安全
- 后台密码加盐哈希（bcrypt/argon2）存储，前端预哈希。
- SQL 注入：全部走 ORM 参数化，禁止字符串拼接。
- XSS：评论 Markdown 渲染做白名单过滤（移除 script/事件属性）。
- CSRF：Token 走 Header 而非 Cookie，规避 CSRF。
- 文件上传：校验魔数而非仅扩展名，独立目录、禁执行权限。
- 限流：评论/点赞/登录接口 IP 限流。
- HTTPS 部署，安全 Headers（CSP/HSTS/X-Frame-Options）。

### 6.4 可维护性
- 前后端类型对齐（OpenAPI 自动生成前端 TS 类型）。
- Alembic 管理迁移。
- 统一日志（访问日志 + 错误日志）。
- 关键操作审计（后台增删改记录）。

---

## 7. UI/UX 设计规范

### 7.1 Glassmorphism 风格
- 卡片：半透明背景（浅色 `rgba(255,255,255,.55)`，深色 `rgba(30,30,40,.45)`）+ `backdrop-filter: blur(16px) saturate(180%)` + 1px 内/外描边 + 柔和阴影。
- 背景：渐变光斑（blob）+ 噪点，浅深两套配色。
- 圆角统一 16px，间距采用 8px 栅格。

### 7.2 主题系统
- 以 CSS 变量定义：`--bg`、`--surface`、`--text`、`--text-secondary`、`--accent`、`--border`、`--blur` 等。
- `<html data-theme="light|dark">` 切换，过渡 300ms。
- Element Plus 通过覆盖 CSS 变量适配主题。

### 7.3 交互细节
- 按钮/卡片 hover/active 微动效（transform + shadow）。
- 路由切换淡入过渡。
- 加载态统一 Skeleton，避免白屏。
- 表单错误就近提示，不阻断。
- 可访问性：键盘可达、焦点可见、对比度 AA。

---

## 8. 在原需求基础上的优化汇总

| # | 优化点 | 价值 |
| --- | --- | --- |
| 1 | 笔记置顶、草稿、软删除、Slug | 内容管理更灵活 |
| 2 | 列表分页/无限滚动、摘要自动生成 | 性能与可读性 |
| 3 | 搜索结果高亮 + 相关度排序 | 检索体验 |
| 4 | 代码块复制、图片预览、阅读进度条、上下篇导航 | 阅读体验 |
| 5 | 评论二级嵌套、分页、排序、防刷、敏感词 | 评论系统健壮性 |
| 6 | 博主评论徽章、终端/地址识别 | 评论辨识度 |
| 7 | 图片缩略图、引用校验、格式/大小限制 | 图片管理安全与性能 |
| 8 | 标签云、批量合并、删除策略 | 标签维护效率 |
| 9 | 后台密码加盐哈希 + 登录限流 + JWT 续签 | 安全性 |
| 10 | 概览增 Top 笔记/终端分布 | 数据洞察 |
| 11 | 配置导入导出、自动保存、快捷键 | 编辑效率 |
| 12 | 公开接口缓存、WAL、索引、懒加载 | 性能 |
| 13 | XSS 白名单、上传魔数校验、安全 Headers | 安全 |
| 14 | 主题跟随系统 + 记忆 | 体验 |
| 15 | OpenAPI 生成前端类型、Alembic 迁移 | 工程化 |

---

## 9. 部署与运维

- 后端：Uvicorn + Gunicorn（worker 模式）反向代理 Nginx，静态资源（uploads/、前端 dist/）由 Nginx 直出。
- 前端：`vite build` 产物部署到 Nginx 静态目录，SPA history 模式配置 fallback。
- 数据库：SQLite 文件定时备份（cron 拷贝 + WAL checkpoint）；数据量增大可迁移 PostgreSQL（ORM 层无侵入）。
- 环境变量：`SECRET_KEY`、`ADMIN_PASSWORD_HASH`、`DB_PATH`、`UPLOAD_DIR`、`CORS_ORIGINS` 等。
- 日志：按天滚动，保留 N 天。

---

## 10. 里程碑

| 阶段 | 交付物 |
| --- | --- |
| M1 基础架构 | 前后端骨架、主题系统、布局、路由、鉴权 |
| M2 内容前台 | 首页/标签/时间线/详情/搜索/TOC/评论 |
| M3 后台管理 | 笔记/图片/标签/评论/设置/概览 |
| M4 优化打磨 | 性能、安全、响应式、动效、可访问性 |
| M5 部署上线 | 打包、Nginx 配置、备份、监控 |

---

## 附录 A：Vditor 集成要点

- 文档：https://ld246.com/article/1549638745630
- 编辑模式：所见即所得（`mode: 'ir'`）或分屏（`mode: 'wysiwyg'` + 预览）。
- 工具栏配置显隐所需按钮（标题/粗体/斜体/引用/链接/图片/代码/代码块/列表/高亮/删除线/任务/公式/图表/表情/撤销/重做）。
- 图片上传：`upload.url` 指向后端 `/api/v1/images`，返回 `{"code":0,"data":{"errFiles":[],"succMap":{"name":"url"}}}`。
- 前台渲染可复用 Vditor 的 `preview` 方法或 markdown-it，保证与编辑器渲染一致。

---

## 附录 B：实现状态跟踪（2026-07-02 快照）

> 状态图例：✅ 已完成 ｜ 🚧 部分完成 ｜ ⬜ 待开发
> 本附录记录 SPEC 落地情况，标注关键偏差与说明，作为后续迭代的基线。

### B.1 功能需求落地（对应 §3）

| 模块 | 需求点 | 状态 | 说明 / 偏差 |
| --- | --- | --- | --- |
| 笔记管理 | 创建 / 编辑 / 删除（软删） | ✅ | 删除走 `is_deleted=1` 软删 |
| 笔记管理 | 列表（分页+标签过滤+置顶） | ✅ | 置顶 `is_pinned` 排序生效 |
| 笔记管理 | 时间线归档 | ✅ | `/api/v1/notes/timeline` |
| 笔记管理 | 详情（PV+1 / 上下篇） | ✅ | 后端返回 `prev/next`，前台 NoteDetail 已渲染上下篇导航卡片 |
| 笔记管理 | slug 默认用 ID | ✅ | **偏差**：原计划 slug 化标题，中文标题不友好，已按 SPEC §3.1「默认用 ID」实现 |
| 笔记管理 | Markdown 渲染 / TOC / 阅读进度 / 回顶 / 代码复制 / 图片预览 | ✅ | NoteDetail 接入 Vditor.preview 渲染；TOC 滚动高亮+平滑滚动；阅读进度条；回顶 FAB；代码块复制按钮；图片懒加载+灯箱预览；上下篇导航 |
| 标签管理 | 标签 CRUD | ✅ | 后端 + 后台均可用 |
| 评论 | 提交 / 点赞 / 隐藏 / 删除 | ✅ | 后端全量；前台 CommentSection 组件接入 NoteDetail（2 级嵌套 + 蜜罐 + 点赞 + 回复 + 分页加载） |
| 评论 | 蜜罐反垃圾（`website` 字段） | ✅ | **偏差**：SPEC 未明示，新增蜜罐 + 3次/分钟 限流 |
| 图片管理 | 上传（Pillow 320px 缩略图） / 列表 / 删除 | ✅ | |
| 设置 | 站点标题 / 副标题 / 关于 / 密码修改 | ✅ | 单行 settings 表 |
| 鉴权 | 登录 / 登出 / 路由守卫 | ✅ | JWT 2h；前端 SHA256 预哈希后 bcrypt |
| 鉴权 | 登录失败锁定（5 次→5 分钟） | ✅ | **偏差**：SPEC 未明示，按 SPEC §8 工程化建议补充 |
| 主题 | 亮 / 暗 / 跟随系统 + 记忆 | ✅ | `data-theme` 属性 + localStorage + `prefers-color-scheme` |

### B.2 数据模型落地（对应 §4）

| 模型 | 状态 | 说明 |
| --- | --- | --- |
| notes | ✅ | 含 `to_summary_dict()`，软删字段 `is_deleted` |
| tags | ✅ | |
| note_tags | ✅ | 多对多关联表 |
| comments | ✅ | `to_dict(include_replies)` 支持 2 级嵌套 |
| images | ✅ | |
| visitors | ✅ | `parse_terminal` 解析 OS·Browser |
| settings | ✅ | 单行表，`ensure_default_settings()` 初始化 |

### B.3 API 设计落地（对应 §5）

| 路由组 | 状态 | 说明 |
| --- | --- | --- |
| `/api/v1/auth` | ✅ | login + 失败计数 |
| `/api/v1/notes` | ✅ | list / detail / create / update / delete / toggle_pin / timeline |
| `/api/v1/tags` | ✅ | CRUD |
| `/api/v1/comments` | ✅ | list_by_note / create / like / toggle_hide / list_all / delete |
| `/api/v1/images` | ✅ | list / upload / delete |
| `/api/v1/stats` | ✅ | overview / visitors / top-notes / terminals（终端分布，M3 新增） |
| `/api/v1/settings` | ✅ | 读取 + 更新 |
| 统一响应 `{code,message,data}` | ✅ | 全局异常处理器封装 |
| OpenAPI 自动文档 | ✅ | `/docs` `/openapi.json` |

### B.4 里程碑进度（对应 §10）

| 阶段 | 状态 | 说明 |
| --- | --- | --- |
| M1 基础架构 | ✅ | 前后端骨架、主题、布局、路由、鉴权全部落地 |
| M2 内容前台 | ✅ | 首页/标签/时间线/搜索可用；NoteDetail 已接入 Markdown 渲染 / TOC / 阅读进度 / 回顶 / 代码复制 / 图片灯箱 / 上下篇 / 评论区；搜索关键词高亮 |
| M3 后台管理 | ✅ | 笔记/图片/标签/评论/设置可用；Dashboard 已接入 ECharts（访客趋势/终端分布/Top 笔记）；NoteEdit 已接入自动保存/Ctrl+S/离开确认 |
| M4 优化打磨 | ⬜ | 性能（Vditor 分包、虚拟滚动）、安全加固、动效打磨、可访问性回归 |
| M5 部署上线 | ⬜ | 打包脚本、Nginx 配置、备份脚本未产出 |

### B.5 关键技术决策记录

1. **密码哈希链**：前端 `sha256Hex(password)` 预哈希 → 后端 `bcrypt(prehash)` 存储。`init_db` 已对齐该流程（默认密码 `admin`）。
2. **bcrypt 版本钉死**：`passlib 1.7.4` + `bcrypt 5.x` 存在 `__about__` 属性缺失，已 pin `bcrypt==4.1.3`。启动日志的 trapped error 不影响功能。
3. **slug 策略**：默认 `str(note.id)`，避免中文标题 slug 化失败。后续可在编辑器中暴露自定义 slug 输入。
4. **Vditor 上传处理器**：`handler(files: File[]): Promise<null>` 显式返回类型，规避 Element Plus / Vditor 类型不匹配。
5. **Vditor 动态导入**：`VditorEditor.vue` 用 `import('vditor')` 懒加载，减小首屏体积（M4 仍需进一步分包）。
6. **SQLite WAL**：`database.py` 启动时执行 `PRAGMA journal_mode=WAL; foreign_keys=ON;`，提升并发读写。
7. **CORS / 静态资源**：`main.py` 挂载 `/uploads` 静态目录，CORS 允许列表通过 `CORS_ORIGINS` 配置。
