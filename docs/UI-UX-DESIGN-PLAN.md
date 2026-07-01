# UI/UX 设计与实施规划

> 基于 [SPEC.md](file:///e:/AICodeProgram/LLMBLOG/SPEC.md) 与 [design-system/MASTER.md](file:///e:/AICodeProgram/LLMBLOG/design-system/MASTER.md)，按 ui-ux-pro-max 技能规则给出页面级设计、交互、组件与实施顺序。  
> 规则编号引用 MASTER 的 §x 或技能 Quick Reference（如 `[touch-target-size]`）。

---

## 1. 全局结构

### 1.1 路由与布局
| 路径 | 布局 | 说明 |
| --- | --- | --- |
| `/` | FrontLayout | 首页笔记列表 |
| `/tags` | FrontLayout | 标签分类页 |
| `/timeline` | FrontLayout | 时间线页 |
| `/search?q=` | FrontLayout | 搜索结果 |
| `/note/:slug` | FrontLayout | 笔记详情 |
| `/admin/login` | BlankLayout | 后台登录 |
| `/admin` | AdminLayout | 概览（重定向到 /admin/dashboard） |
| `/admin/dashboard` | AdminLayout | 分析概览 |
| `/admin/notes` | AdminLayout | 笔记管理 |
| `/admin/notes/:id/edit` | AdminLayout | 笔记编辑 |
| `/admin/images` | AdminLayout | 图片管理 |
| `/admin/tags` | AdminLayout | 标签管理 |
| `/admin/comments` | AdminLayout | 评论管理 |
| `/admin/settings` | AdminLayout | 系统设置 |

- FrontLayout：顶部栏 + 主内容 + 右侧侧边栏（移动端隐藏）；详情页主内容右侧再嵌 TOC。
- AdminLayout：左侧侧边栏菜单 + 顶部栏（标题/用户/退出）+ 主内容。
- 路由切换淡入 220ms（`--dur-base`），`<router-view>` 用 `<Transition name="fade">`。
- 路由懒加载按视图分包（`lazy-loading`、`bundle-splitting`）。

### 1.2 顶部导航栏（前台）
- 固定顶部，`.glass` 样式，滚动 8px 后增强阴影。
- 左侧：Logo（SVG）+ 菜单（首页/标签/时间线，图标+文字，当前项 `--accent` + 底部 2px 指示条）`[nav-state-active]`。
- 右侧：搜索按钮、主题切换按钮（仅图标，aria-label）`[aria-labels]`。
- 移动端：Logo + 汉堡按钮；菜单进入 Drawer（从左滑入 220ms，遮罩 48% 黑）`[drawer-usage]`。
- 所有触控目标 ≥44px `[touch-target-size]`。

### 1.3 主题切换
- 图标按钮，点击切换 `data-theme`，过渡 300ms。
- 选择写入 localStorage；首次访问读 `prefers-color-scheme` `[color-dark-mode]`。
- Element Plus 通过覆盖其 CSS 变量适配深色。

---

## 2. 前台页面设计

### 2.1 首页 `/`

**信息层级**
1. 顶部栏
2. Hero 区（可选）：站点标题 + 描述（来自 settings）
3. 笔记列表（主区，左 2/3 桌面）
4. 右侧侧边栏（桌面，1/3）

**笔记卡片 `NoteCard`**
- `.glass` 卡片，padding 24px，圆角 16px。
- 内容：标题（`--fs-md` 600）、meta 行（时间/查看/评论，`--fs-sm` 次文字 + Lucide 图标）、摘要（2 行截断，`-webkit-line-clamp`）、标签 chip 行。
- 置顶笔记左上角「置顶」徽章（`--accent-soft` 底 + `--accent` 文字 + 图钉图标）`[color-not-only]`。
- hover：`translateY(-2px)` + `--shadow-strong`，220ms `[scale-feedback]`。
- 整卡可点击进入详情（`cursor:pointer`）；标签 chip 点击阻止冒泡跳转标签页。
- 列表入场：每卡错峰 40ms 淡入上移 `[stagger-sequence]`。

**分页 / 无限滚动**
- 桌面：分页器（Element Plus `el-pagination`，触控区扩展）。
- 移动：无限滚动 + 加载 Skeleton（每页 10）`[progressive-loading]`。
- 空状态：EmptyState 组件（插画 + 文案「还没有笔记」）`[empty-states]`。

**侧边栏 `Sidebar`**（移动端隐藏）
- 个人信息卡：头像 64px 圆形 + 名称 + 描述 + 统计（笔记数/访问数，数字用 tabular-nums `[number-tabular]`）。
- 标签云 widget：字号映射数量，点击跳标签页。
- 最新评论 widget：3 条，昵称 + 摘要 + 相对时间。

### 2.2 标签分类页 `/tags`

- 顶部标签云（`.glass` 容器）：字号 14–28px 映射数量；hover 放大 1.05；当前选中 `--accent` 底 pill。
- 标签搜索框（防抖 300ms）`[debounce-throttle]`。
- 下方选中标签的笔记标题列表：标题 + 时间 + 查看数；hover `--surface-hover`。
- 空标签：EmptyState「该标签下暂无笔记」。

### 2.3 时间线页 `/timeline`

- 按年份分组卡片，年份标题 `--fs-lg` 600 + 左侧 4px `--accent` 竖线。
- 年份内按月份倒序，月份小标题 `--fs-md` 500。
- 列表项：日期（tabular-nums）+ 标题 + 查看数；点击进详情。
- 顶部筛选条：标签下拉 + 关键字输入（防抖）。
- 移动端：竖线保留，间距收紧到 16px。

### 2.4 搜索 `/search`

- 移动端：点击顶部搜索按钮 → 全屏弹层（`position:fixed` + `min-h-dvh`），输入框自动聚焦 `[content-priority]`。
- 桌面：可内嵌页面或顶部下拉弹层。
- 输入防抖 300ms，结果区显示 Skeleton。
- 结果项：标题（命中高亮 `<mark>`）、摘要上下文（命中片段）、标签、查看数。
- 结果按相关度排序；空结果 EmptyState「未找到相关笔记」+ 建议词。
- 输入框 ≥44px 高，清除按钮 aria-label「清除」`[touch-friendly-input]`。

### 2.5 笔记详情 `/note/:slug`

**结构**（桌面三栏：顶部栏 / 正文 / 右侧 TOC+侧边栏；移动单栏）
1. 顶部阅读进度条（fixed top，2px `--accent`，宽度随滚动）`[transform-performance]`。
2. 笔记头部：标题（`--fs-xl` 700）、meta 行（创建/更新时间、查看、评论数、标签 chip）、博主头像+名称。
3. 正文容器 `max-width:760px`，`.glass` 卡片，padding 32px（移动 20px）。
4. 文末：标签 chip 行 + 上一篇/下一篇导航（左右两卡片）。
5. 评论区。
6. 右侧：TOC（sticky）+ 侧边栏；移动端 TOC 折叠为顶部「目录」按钮抽屉。

**正文渲染**
- Markdown → HTML，代码高亮（Prism/highlight.js），KaTeX 公式，图表，任务列表。
- 代码块：右上角「复制」按钮（≥44px，aria-label），点击后变「已复制」2s `[success-feedback]`。
- 图片：`loading="lazy"`，固定 `aspect-ratio` 防布局抖动 `[image-optimization]`、`[content-jumping]`；点击放大用 Element Plus `el-image` 预览。
- 标题（h2/h3）自动生成 TOC 锚点。

**目录 `TableOfContents`**（移动端隐藏）
- sticky 定位，`max-height:70vh` 可滚动。
- `IntersectionObserver` 监听标题，当前章节高亮 `--accent` + 左 2px 指示条。
- 点击平滑滚动 `scroll-behavior:smooth`，偏移顶部栏高度 80px。
- 无标题的笔记显示 EmptyState「本文无目录」。

**回到顶部 `BackToTop`**
- 右下角悬浮，滚动超过一屏出现（淡入 + 上移 220ms）。
- 圆形 48px，`.glass`，Lucide `arrow-up` 图标，aria-label「回到顶部」。

**评论区 `CommentSection`**
- 评论 composer：昵称输入（默认「匿名访客」）+ 内容（Markdown 子集 textarea）+ 蜜罐隐藏字段 + 提交按钮。
- textarea ≥44px 高，字符计数 helper text `[input-helper-text]`。
- 提交：按钮 loading + 禁用，乐观更新，失败回滚 + Toast 错误 `[error-recovery]`。
- 列表：二级嵌套（父评论 + 缩进子评论），分页每页 10。
- 评论项 `CommentItem`：头像（自动生成或 Gravatar）+ 昵称 + 身份徽章（博主 `--accent` pill「博主」）+ 相对时间 + 地址 + 终端 chip + 内容 + 操作（回复/点赞）。
- 点赞按钮：图标 + 计数，点击 100ms 内反馈 +1，动画 spring `[tap-feedback-speed]`。
- 排序切换：最新/最热，切换 220ms 淡入。
- 空评论：EmptyState「快来抢沙发」。
- 防刷：IP 60s 内 ≤3 条，超限 429 + Toast「评论太快啦，稍后再试」`[error-feedback]`。

---

## 3. 后台页面设计

### 3.1 登录 `/admin/login`

- 居中 `.glass` 卡片 400px 宽，Logo + 标题「后台登录」+ 密码输入 + 登录按钮。
- 密码框：`type=password` + 显示/隐藏切换（图标按钮 aria-label）`[password-toggle]`。
- 标签可见「密码」`[input-labels]`；helper text「请输入后台访问密码」。
- 提交：loading 态；失败就近错误「密码错误，还剩 N 次」`[error-clarity]`；5 次锁定 5 分钟，倒计时提示。
- 错误用 `role="alert"` + `--error` 色 + 图标 `[aria-live-errors]`。
- 自动填充 `autocomplete="current-password"` `[autofill-support]`。

### 3.2 AdminLayout

- 左侧侧边栏 240px：Logo + 菜单（概览/笔记/图片/标签/评论/设置，图标+文字，当前项 `--accent-soft` 底 + `--accent` 文字 + 左 3px 指示条）`[nav-state-active]`。
- 顶部栏：当前页面标题 + 右侧（博主头像 + 退出按钮）。
- 移动端：侧边栏折叠为抽屉（汉堡按钮）`[adaptive-navigation]`。
- 主内容区 padding 24px（移动 16px），最大宽度 1280px。

### 3.3 分析概览 `/admin/dashboard`

- 4 个 `StatCard`：笔记总数 / UV / PV / 评论总数。每卡：图标 + 数字（tabular-nums）+ 标签 + 环比小字。
- 访客量日线图（ECharts）：可切换 7/30/90 天；折线 + 面积渐变；tooltip 显示精确值；图例可点击切换 `[legend-interactive]`；空数据 EmptyState `[empty-data-state]`；加载用 Skeleton `[loading-chart]`。
- 热门笔记 Top 5：横向条形图或列表（标题 + PV bar）。
- 终端分布饼图：≤5 类，否则改条形图 `[no-pie-overuse]`；配图案/纹理补充区分 `[pattern-texture]`。
- 图表色用可访问调色板（避免红绿独占）`[color-guidance]`；数据标签 ≥4.5:1 `[contrast-data]`。
- 图表响应式：小屏折线减少刻度、饼图改条形 `[responsive-chart]`。

### 3.4 笔记管理 `/admin/notes`

- 顶部工具条：搜索框（标题，防抖）+ 标签筛选下拉 + 状态筛选（全部/已发布/草稿/隐藏）+ 「新建笔记」主按钮（右上，唯一主 CTA `[primary-action]`）。
- 表格 `DataTable`：列 = 标题 / 作者 / 标签（chip）/ 状态（徽章，图标+文字+色 `[color-not-only]`）/ 创建时间 / 更新时间 / 操作。
- 状态徽章：已发布=success/草稿=info/隐藏=次文字，均带图标。
- 操作列：编辑 / 隐藏切换 / 删除（危险，`--error` 文字 + 二次确认）`[destructive-emphasis]`、`[confirmation-dialogs]`。
- 表格支持排序（`aria-sort`）`[sortable-table]`；分页器。
- 行 hover `--surface-hover`。
- 列表 ≥50 行时虚拟滚动 `[virtualize-lists]`。
- 删除二次确认 Modal：「确认删除《标题》？此操作可回收」+ 取消/确认（危险按钮）。

### 3.5 笔记编辑 `/admin/notes/:id/edit`

- 顶部：返回按钮 + 标题「编辑笔记」+ 状态切换（草稿/发布/隐藏）+ 保存按钮 + 自动保存指示（「已保存 · 12:00」）。
- 主体：左侧表单（标题/作者/标签/摘要/slug/置顶/隐藏开关）+ 下方 Vditor 编辑器全宽。
- Vditor：IR 模式或分屏，工具栏按 SPEC 配置；图片上传走 `/api/v1/images`。
- 自动保存：每 30s + 失焦时，保存中指示「保存中…」，失败 Toast + 重试 `[form-autosave]`。
- 快捷键：Ctrl+S 保存（阻止默认）。
- 离开未保存：`beforeRouteLeave` 弹确认 `[sheet-dismiss-confirm]`。
- 标签多选用 `el-select multiple`，可新建。
- 表单 label 可见，必填项星号 `[required-indicators]`，失焦校验 `[inline-validation]`。
- 标题输入 helper text「将显示在笔记顶部」。

### 3.6 图片管理 `/admin/images`

- 顶部：上传按钮（主）+ 排序下拉（时间/大小/引用数）+ 筛选 + 搜索。
- 网格 `ImageGrid`：响应式列（移动 2 列 / 桌面 4–6 列），每格缩略图（aspect-ratio 1:1，`object-fit:cover`）+ 底部信息（文件名截断 + 引用数 chip + 大小）。
- hover：浮现操作条（复制引用 / 重命名 / 删除），触控常显简化按钮 `[hover-vs-tap]`。
- 上传：拖拽区 + 点击选择；上传中显示进度；校验格式（jpg/png/gif/webp）与 5MB；失败就近错误 `[error-placement]`。
- 删除：若被引用，Modal 警告「该图片被 N 篇笔记引用，仍要删除？」+ 取消/确认。
- 复制引用：点击后「已复制」2s 反馈 `[success-feedback]`。
- 图片懒加载 + 缩略图 `[lazy-load-below-fold]`。

### 3.7 标签管理 `/admin/tags`

- 表格：标签名 / 描述 / 颜色色块（带名称文字 `[color-not-only]`）/ 笔记数 / 操作（编辑/合并/删除）。
- 新建/编辑：Modal 表单（名称[必填]/描述/颜色选择器），重名校验 `[error-clarity]`。
- 合并：选择目标标签，Modal 确认「将 A 合并到 B，A 将被删除」。
- 删除：Modal 选择「仅删标签」或「删除标签及关联」，确认。

### 3.8 评论管理 `/admin/comments`

- 表格：笔记标题 / 昵称（博主带徽章）/ 内容摘要 / IP·地址 / 终端 / 点赞数 / 状态 / 时间 / 操作。
- 筛选：笔记下拉 + 状态（正常/隐藏）+ 时间范围 + 关键字。
- 操作：回复（弹 Modal 以博主身份回复）/ 隐藏·显示 / 删除（二次确认）。
- 批量选择 + 批量删除/隐藏，操作后 Toast 反馈。
- 敏感评论：状态列标黄 chip「待审」（可选）。

### 3.9 系统设置 `/admin/settings`

- 分组 Tab 或锚点导航：博主信息 / 站点信息 / 备案信息 / 安全（改密码）。
- 表单：可见 label，分组 fieldset `[field-grouping]`；头像/图标点击触发图片选择 Modal（复用图片管理）。
- 修改后「保存」主按钮；保存中 loading；成功 Toast「设置已保存」`[success-feedback]`。
- 导出配置：下载 JSON；导入：上传 JSON 校验后预览差异再确认 `[confirmation-dialogs]`。
- 备案信息在底部展示预览（图标 + 号 + 链接）。

---

## 4. 组件规格摘要

| 组件 | 关键规格 | 规则 |
| --- | --- | --- |
| `GlassCard` | `.glass` 基类，slot 内容，可选 hover 态 | §4 MASTER |
| `NoteCard` | 见 2.1 | `[scale-feedback]` |
| `TagChip` | pill 圆角，`--accent-soft` 底，可点击，≥44px 高 | `[touch-target-size]` |
| `Pagination` | 桌面分页 / 移动无限滚动，按钮 ≥44px | `[touch-target-size]` |
| `SearchOverlay` | 全屏弹层，自动聚焦，防抖 | `[content-priority]` |
| `TableOfContents` | sticky，IntersectionObserver 高亮 | `[scroll-behavior]` |
| `BackToTop` | 48px 圆形，淡入出现 | `[aria-labels]` |
| `ReadingProgress` | fixed 2px 顶条，transform 缩放 | `[transform-performance]` |
| `CommentItem` | 头像+徽章+meta+内容+操作 | `[color-not-only]` |
| `CommentComposer` | 昵称+textarea+蜜罐+提交，乐观更新 | `[error-recovery]` |
| `ThemeToggle` | 图标按钮，aria-label，过渡 | `[aria-labels]` |
| `StatCard` | 图标+数字(tabular)+标签+环比 | `[number-tabular]` |
| `DataTable` | 排序 aria-sort，hover，分页，虚拟滚动 | `[sortable-table]`、`[virtualize-lists]` |
| `ImageGrid` | 响应式网格，缩略图，懒加载 | `[lazy-load-below-fold]` |
| `VditorEditor` | IR/分屏，工具栏配置，图片上传，自动保存 | `[form-autosave]` |
| `EmptyState` | 插画+文案+动作 | `[empty-states]` |
| `Skeleton` | 加载占位，shimmer | `[progressive-loading]` |
| `Toast` | 3–5s，aria-live=polite，不抢焦点 | `[toast-accessibility]` |
| `ConfirmDialog` | 危险操作二次确认，取消/确认分离 | `[confirmation-dialogs]` |

---

## 5. 图表设计（ECharts）

- 类型选择：访客趋势→折线/面积；终端分布→饼图（≤5 类否则条形）；Top 笔记→横向条形 `[chart-type]`。
- 调色板：`['#6366f1','#22c55e','#f59e0b','#ef4444','#0ea5e9','#a855f7']`，避免红绿独占 `[color-guidance]`。
- 网格线低对比（`--border`）`[gridline-subtle]`；tooltip 显示精确值 `[tooltip-on-interact]`。
- 图例近图放置、可点击切换 `[legend-visible]`、`[legend-interactive]`。
- 小屏简化：减少刻度、饼图转条形 `[responsive-chart]`。
- 空数据/加载/错误三态 `[empty-data-state]`、`[loading-chart]`、`[error-state-chart]`。
- 尊重 reduced-motion：关闭入场动画 `[animation-optional]`。
- 提供文字摘要 `aria-label` 描述关键洞察 `[screen-reader-summary]`。

---

## 6. 响应式与移动端要点

| 断点 | 行为 |
| --- | --- |
| <768px | 顶部菜单抽屉化；侧边栏/TOC 隐藏（TOC 入抽屉）；单列；字号自适应；无限滚动；搜索全屏弹层；后台侧边栏抽屉 |
| 768–1024 | 双栏（主+侧边栏），TOC 在详情页显示 |
| >1024 | 详情页三栏（主+TOC+侧边栏），后台侧边栏常驻 |

- 所有固定栏预留 `env(safe-area-inset-*)` `[safe-area-awareness]`。
- 触控目标 ≥44px，间距 ≥8px `[touch-spacing]`。
- 禁横向滚动；图片/表格小屏可横向滚动但需提示 `[horizontal-scroll]`。
- 表单输入 ≥44px 高，触发正确键盘类型 `[input-type-keyboard]`。

---

## 7. 实施顺序（对齐 SPEC §10 里程碑）

> 状态图例：✅ 已完成 ｜ 🚧 部分完成 ｜ ⬜ 待开发（快照：2026-07-02）

| 阶段 | UI/UX 交付 | 状态 | 实现说明 |
| --- | --- | --- | --- |
| M1 基础 | 主题令牌、`.glass`、布局（FrontLayout/AdminLayout）、顶部栏、Drawer、ThemeToggle、Toast、Skeleton、EmptyState、路由守卫登录页 | ✅ | `variables.css` + `glass.css` + `element-overrides.css` 落地；AppNavbar/AdminLayout 含移动 Drawer；ThemeToggle 含跟随系统；ElMessage 充当 Toast；Skeleton/EmptyState 由 Element Plus 提供；路由守卫 `requiresAuth` + 401 重定向 |
| M2 前台 | NoteCard、首页、标签云页、时间线页、搜索弹层、详情页（TOC/BackToTop/ReadingProgress/代码复制/图片预览）、评论区 | ✅ | 首页/标签云/时间线/搜索弹层 ✅；NoteDetail 已接入 Vditor.preview 渲染 + TOC 滚动高亮 + 阅读进度条 + 回顶 FAB + 代码块复制 + 图片懒加载/灯箱 + 上下篇导航 + 评论区（CommentSection）；搜索页关键词高亮 |
| M3 后台 | AdminLayout、Dashboard（StatCard+图表）、笔记列表+编辑（Vditor+自动保存）、图片管理、标签管理、评论管理、系统设置 | ✅ | AdminLayout/笔记 CRUD/图片/标签/评论/设置 ✅；Dashboard 已接入 ECharts（访客趋势折线/终端分布饼/Top 笔记条形 + 三态 + 主题联动）；NoteEdit 已接 Vditor + 自动保存(localStorage 30s 节流) + Ctrl/S + 离开确认 |
| M4 打磨 | 动效错峰、虚拟滚动、可访问性扫描、深色对比验证、375px/横屏测试、reduced-motion、性能（懒加载/分包） | ✅ | 性能：Vite manualChunks 分包✅（主入口 1.2MB→9KB）；动效：reduced-motion 全量化✅；可访问性：skip-link✅ + aria-label✅ + 对比度 WCAG AA✅ + heading 层级修正✅（每页唯一 h1、无跨级）；375px 响应式✅（header flex-wrap / dialog max-width / 表格横滚 / 超窄屏 padding）；Lighthouse CI✅（lighthouserc.cjs + a11y 断言 0.85）。虚拟滚动经评估不引入（分页已覆盖） |
| M5 上线 | 打包、Nginx、备份、Docker | ✅ | Nginx 生产配置✅（deploy/nginx.conf）；SQLite 备份脚本✅（backup.sh + backup.ps1，WAL checkpoint + 压缩 + 保留策略）；Docker 容器化✅（多阶段构建 + docker-compose + .dockerignore）；环境变量示例✅ + README 部署章节✅ |

---

## 8. 验收清单（按页面）

> 每页交付前过 MASTER §11 + 本节专项。
> 快照：2026-07-02。✅ = 已通过 ｜ 🚧 = 部分 ｜ ⬜ = 未做

**首页**：[✅] 卡片错峰入场  [✅] 置顶徽章带图标  [✅] 分页/无限滚动 Skeleton  [✅] 空状态  
**详情**：[✅] 阅读进度条  [✅] 代码复制反馈  [✅] 图片懒加载+预览  [✅] TOC 高亮+平滑滚动  [✅] 回到顶部  [✅] 评论提交+防刷（蜜罐+限流）  
**后台编辑**：[✅] 自动保存指示  [✅] 离开确认  [✅] 快捷键（Ctrl/⌘+S）  [✅] 必填校验  [✅] 图片上传入库  
**图表**：[✅] 三态（空/载/错）[✅] 可访问色  [✅] reduced-motion  [✅] aria-label 摘要  
**全局**：[✅] 双主题对比验证  [✅] 375px 无横向滚动  [✅] 键盘可达  [✅] 焦点环可见

---

## 9. 实现状态与后续待办（2026-07-02）

### 9.1 已落地组件 / 页面

| 类别 | 文件 | 状态 |
| --- | --- | --- |
| 主题令牌 | `frontend/src/styles/variables.css` | ✅ |
| Glassmorphism 基类 | `frontend/src/styles/glass.css`（含 `@supports` 降级） | ✅ |
| Element Plus 主题桥接 | `frontend/src/styles/element-overrides.css` | ✅ |
| 顶栏（前台） | `frontend/src/components/AppNavbar.vue`（移动 Drawer + 全屏搜索） | ✅ |
| 布局 | `FrontLayout.vue` / `AdminLayout.vue` | ✅ |
| 主题切换 | `frontend/src/stores/theme.ts` + `ThemeToggle` | ✅ |
| 路由守卫 | `frontend/src/router/index.ts` | ✅ |
| 登录页 | `frontend/src/views/auth/Login.vue`（SHA256 预哈希） | ✅ |
| Vditor 编辑器 | `frontend/src/components/VditorEditor.vue`（动态 import + 自定义上传） | ✅ |
| 评论组件 | `frontend/src/components/CommentSection.vue`（2 级嵌套 + 蜜罐 + 点赞 + 回复 + 分页） | ✅ |
| ECharts 封装 | `frontend/src/components/BaseChart.vue`（init/resize/dispose + 主题联动） | ✅ |
| 笔记详情 | `views/front/NoteDetail.vue`（Markdown 渲染 + TOC + 进度 + 回顶 + 代码复制 + 灯箱 + 上下篇） | ✅ |
| 前台首页 / 标签云 / 时间线 / 搜索 | `views/front/*` | ✅ |
| 后台笔记列表 / 编辑 | `views/admin/Notes.vue` `NoteEdit.vue`（自动保存 + Ctrl+S + 离开确认） | ✅ |
| 后台图片 / 标签 / 评论 / 设置 | `views/admin/*` | ✅ |
| Dashboard 概览 + ECharts 图表 | `views/admin/Dashboard.vue` + `components/BaseChart.vue` | ✅ |

### 9.2 后续待办（按优先级）

> M1–M5 全部完成。以下记录 M4/M5 最终落地项。

1. **M4 打磨项（已完成）**
   - ✅ 375px 响应式：admin header flex-wrap、el-dialog max-width、表格横滚、375px padding 缩减
   - ✅ 双主题对比度：亮色 accent→indigo-600 通过 WCAG AA；Lighthouse CI 自动化（lighthouserc.cjs）
   - ✅ heading 层级审查：全站 page-title h2→h1、NoteCard/CommentSection h3→h2、Timeline/Dashboard/Settings 子标题顺延

> M4 早前已完成：Vite manualChunks 分包、reduced-motion 全量化、后端安全响应头、skip-link（双布局）。
> 虚拟滚动决策不引入：分页（默认 10/页）已覆盖长列表场景。

2. **M5 部署（已完成）**
   - ✅ `vite build` 产物 + Nginx SPA fallback 配置（`deploy/nginx.conf`）
   - ✅ Uvicorn 生产启动 + systemd 服务模板（README 部署章节）
   - ✅ SQLite WAL checkpoint + cron 备份脚本（`deploy/backup.sh` + `backup.ps1`）
   - ✅ Docker 容器化（`backend/Dockerfile` + `Dockerfile.nginx` + `docker-compose.yml`）
