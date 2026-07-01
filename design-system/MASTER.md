# 个人笔记博客 — 主设计系统（MASTER）

> 本文件是全局设计单一事实来源（Source of Truth）。所有页面默认遵循本文件；如某页面需偏离，在 `design-system/pages/<page>.md` 中声明覆盖规则，覆盖优先于本文件。  
> 依据：ui-ux-pro-max 技能规则（10 类优先级 + Quick Reference + 专业 UI 通用规则 + 交付前检查清单）。

---

## 0. 设计决策摘要

| 维度 | 决策 | 依据规则 |
| --- | --- | --- |
| 产品类型 | 内容型（个人笔记博客）+ 工具型（后台管理） | `style-match` |
| 视觉风格 | Glassmorphism（毛玻璃拟态） | SPEC §7.1 |
| 主题 | 浅色 / 深色双主题，跟随系统 + 记忆 | `dark-mode-pairing`、`color-dark-mode` |
| 字体 | Inter + Noto Sans SC（UI/正文）、JetBrains Mono（代码）、Noto Serif SC（可选长文） | `font-pairing`、`line-height` |
| 色彩 | 语义令牌（primary/surface/text/...），紫蓝主色 | `color-semantic`、`color-accessible-pairs` |
| 间距 | 4/8dp 栅格 | `spacing-scale` |
| 圆角 | 卡片 16px / 输入 12px / 大容器 24px | `effects-match-style` |
| 动效 | 150–300ms，仅 transform/opacity，尊重 reduced-motion | `duration-timing`、`transform-performance`、`reduced-motion` |
| 响应式 | 移动优先，断点 375/768/1024/1440 | `mobile-first`、`breakpoint-consistency` |
| 触控 | 最小 44×44px，间距 ≥8px | `touch-target-size`、`touch-spacing` |
| 图标 | Lucide / Element Plus Icons（SVG，线性统一描边 1.5px） | `no-emoji-icons`、`icon-style-consistent` |

---

## 1. 色彩系统

### 1.1 设计原则
- 全部通过 **语义令牌** 引用，组件内禁止裸 hex（`color-semantic`）。
- 浅/深双主题成对设计，保持品牌与对比一致（`dark-mode-pairing`）。
- 深色模式使用 **去饱和/提亮** 的色调变体，而非简单反色（`color-dark-mode`）。
- 功能色（成功/警告/错误）必须 **图标+文字** 同时给出，不可仅靠颜色传达含义（`color-not-only`、`color-not-decorative-only`）。
- 对比度：正文 ≥4.5:1（AA），大字 ≥3:1；深色模式单独验证（`color-accessible-pairs`）。

### 1.2 语义令牌

#### 浅色主题（`data-theme="light"`）
| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--bg` | `#eef1f8` | 页面底色（配合渐变光斑） |
| `--bg-blob-1` | `#a5b4fc` | 背景光斑 1（淡靛） |
| `--bg-blob-2` | `#fbcfe8` | 背景光斑 2（淡粉） |
| `--bg-blob-3` | `#bbf7d0` | 背景光斑 3（淡薄荷） |
| `--surface` | `rgba(255,255,255,0.55)` | 玻璃卡片底 |
| `--surface-strong` | `rgba(255,255,255,0.72)` | 悬浮/活动卡片底 |
| `--surface-border` | `rgba(255,255,255,0.7)` | 玻璃描边 |
| `--surface-hover` | `rgba(255,255,255,0.65)` | hover 态 |
| `--text` | `#1a1f2e` | 主文字（对比 ~15:1） |
| `--text-secondary` | `#4a5568` | 次文字（对比 ~7:1） |
| `--text-disabled` | `#9ca3af` | 禁用文字 |
| `--accent` | `#6366f1` | 主色（靛蓝） |
| `--accent-hover` | `#4f46e5` | 主色 hover |
| `--accent-soft` | `rgba(99,102,241,0.12)` | 主色弱底 |
| `--accent-on` | `#ffffff` | 主色上的文字 |
| `--success` | `#16a34a` | 成功 |
| `--warning` | `#d97706` | 警告 |
| `--error` | `#dc2626` | 错误 |
| `--info` | `#0284c7` | 信息 |
| `--border` | `rgba(15,23,42,0.08)` | 普通描边 |
| `--shadow` | `0 8px 32px rgba(15,23,42,0.08)` | 卡片阴影 |
| `--shadow-strong` | `0 12px 40px rgba(15,23,42,0.14)` | 悬浮阴影 |
| `--blur` | `16px` | 背景模糊半径 |
| `--saturate` | `180%` | 背景饱和度 |

#### 深色主题（`data-theme="dark"`）
| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--bg` | `#0f1419` | 页面底色 |
| `--bg-blob-1` | `rgba(99,102,241,0.25)` | 光斑 1 |
| `--bg-blob-2` | `rgba(236,72,153,0.18)` | 光斑 2 |
| `--bg-blob-3` | `rgba(34,197,94,0.16)` | 光斑 3 |
| `--surface` | `rgba(30,32,44,0.45)` | 玻璃卡片底 |
| `--surface-strong` | `rgba(40,44,60,0.62)` | 悬浮卡片底 |
| `--surface-border` | `rgba(255,255,255,0.08)` | 玻璃描边 |
| `--surface-hover` | `rgba(50,54,72,0.55)` | hover 态 |
| `--text` | `#e6e9ef` | 主文字（对比 ~14:1） |
| `--text-secondary` | `#9ca3af` | 次文字（对比 ~4.6:1） |
| `--text-disabled` | `#4b5563` | 禁用文字 |
| `--accent` | `#818cf8` | 主色（提亮靛蓝，保证对比） |
| `--accent-hover` | `#a5b4fc` | 主色 hover |
| `--accent-soft` | `rgba(129,140,248,0.16)` | 主色弱底 |
| `--accent-on` | `#0f1419` | 主色上的文字 |
| `--success` | `#4ade80` | 成功 |
| `--warning` | `#fbbf24` | 警告 |
| `--error` | `#f87171` | 错误 |
| `--info` | `#38bdf8` | 信息 |
| `--border` | `rgba(255,255,255,0.1)` | 普通描边 |
| `--shadow` | `0 8px 32px rgba(0,0,0,0.4)` | 卡片阴影 |
| `--shadow-strong` | `0 12px 40px rgba(0,0,0,0.55)` | 悬浮阴影 |
| `--blur` | `16px` | 背景模糊半径 |
| `--saturate` | `160%` | 背景饱和度（深色略降） |

### 1.3 功能色使用约定
- 成功/警告/错误/信息必须 **图标 + 文字 + 颜色** 三者并用。
- 错误色用于：表单错误、删除按钮、危险操作（`destructive-emphasis`）。
- 危险操作按钮与主操作在空间上分离。

---

## 2. 字体系统

### 2.1 字体栈
```css
--font-ui: "Inter", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
--font-body: "Noto Sans SC", "Inter", system-ui, sans-serif;        /* 正文默认 */
--font-serif: "Noto Serif SC", Georgia, serif;                      /* 可选长文阅读 */
--font-mono: "JetBrains Mono", "Fira Code", Consolas, monospace;
```
- 字号基础 16px（移动端避免 iOS 自动放大，`readable-font-size`）。
- 行高：正文 1.75，UI 文字 1.5（`line-height`）。
- 行宽：移动 35–60 字符，桌面 65–75 字符（`line-length`、`line-length-control`）。
- 字重层级：标题 600–700 / 正文 400 / 标签 500（`weight-hierarchy`）。

### 2.2 字阶（8dp 节奏）
| 令牌 | 桌面 | 移动 | 用途 |
| --- | --- | --- | --- |
| `--fs-xs` | 12px | 12px | 辅助/标签 |
| `--fs-sm` | 14px | 14px | 次要文字 |
| `--fs-base` | 16px | 16px | 正文 |
| `--fs-md` | 18px | 17px | 小标题/强调 |
| `--fs-lg` | 24px | 20px | 区块标题 |
| `--fs-xl` | 32px | 26px | 页面标题 |
| `--fs-2xl` | 48px | 34px | Hero 标题 |

### 2.3 代码字体
- 行内代码：`--font-mono`，背景 `--accent-soft`，padding 2px 6px，圆角 6px。
- 代码块：圆角 12px，顶部工具条含语言标签与「复制」按钮（≥44px 触控区）。

---

## 3. 间距与栅格

### 3.1 间距令牌（4/8dp）
`--sp-1:4px` `--sp-2:8px` `--sp-3:12px` `--sp-4:16px` `--sp-5:24px` `--sp-6:32px` `--sp-7:48px` `--sp-8:64px`

### 3.2 圆角令牌
`--radius-sm:8px` `--radius-md:12px` `--radius-lg:16px` `--radius-xl:24px` `--radius-pill:9999px`

### 3.3 布局栅格
- 内容最大宽度：前台正文 `max-width: 760px`（保证行宽）；列表区 `max-width: 1100px`；后台 `max-width: 1280px`。
- 侧边栏宽度：桌面 280px。
- 断点：`sm:375` `md:768` `lg:1024` `xl:1440`。
- z-index 层级：`0 基线 / 10 悬浮卡片 / 20 顶部栏 / 40 抽屉 / 60 TOC悬浮 / 80 Modal / 1000 Toast`（`z-index-management`）。

---

## 4. Glassmorphism 效果规范

### 4.1 玻璃卡片基类
```css
.glass {
  background: var(--surface);
  backdrop-filter: blur(var(--blur)) saturate(var(--saturate));
  -webkit-backdrop-filter: blur(var(--blur)) saturate(var(--saturate));
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}
.glass:hover { background: var(--surface-hover); box-shadow: var(--shadow-strong); }
```

### 4.2 降级
- 不支持 `backdrop-filter` 的浏览器：退化为 `background: var(--surface-strong)` + 实色描边（`blur-purpose`：模糊失效仍可读）。
- 背景光斑用固定定位的径向渐变 `div`，`pointer-events:none`，避免影响交互。

### 4.3 使用约束（`blur-purpose`）
- 模糊用于 **背景内容隔离**（顶部栏、Modal、卡片悬浮于彩色背景之上），不作为纯装饰堆叠。
- 单屏玻璃层不超过 2 层叠加，避免性能与可读性下降。

---

## 5. 动效系统

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--dur-fast` | 150ms | 按钮态切换 |
| `--dur-base` | 220ms | 卡片 hover、抽屉 |
| `--dur-slow` | 320ms | 路由过渡、Modal |
| `--ease-out` | `cubic-bezier(0.16,1,0.3,1)` | 进入 |
| `--ease-in` | `cubic-bezier(0.7,0,0.84,0)` | 退出 |
| `--ease-spring` | `cubic-bezier(0.34,1.56,0.64,1)` | 弹性反馈 |

规则：
- 时长 150–300ms，复杂过渡 ≤400ms，禁 >500ms（`duration-timing`）。
- 仅动画 `transform`/`opacity`，禁止 width/height/top/left（`transform-performance`、`layout-shift-avoid`）。
- 进入 ease-out、退出 ease-in，退出比进入快约 60–70%（`exit-faster-than-enter`）。
- 列表入场 30–50ms 错峰（`stagger-sequence`）。
- `@media (prefers-reduced-motion: reduce)` 下关闭非必要动效（`reduced-motion`）。
- 动画可被中断（`interruptible`、`no-blocking-animation`）。

---

## 6. 交互态规范

| 状态 | 视觉表现 |
| --- | --- |
| 默认 | `--surface` + `--shadow` |
| hover | `--surface-hover` + `--shadow-strong` + `translateY(-2px)` |
| active/pressed | `scale(0.98)` + 阴影收敛（`scale-feedback`、`press-feedback`） |
| focus-visible | 2px `--accent` 外环 + 2px 透明间隔（`focus-states`，不可移除） |
| disabled | opacity 0.45 + `cursor:not-allowed` + 不响应（`disabled-states`） |
| loading | 按钮内置 spinner + 禁用（`loading-buttons`） |

- 触控目标 ≥44×44px，视觉小时用 `padding`/`hit area` 扩展（`touch-target-size`）。
- 触控目标间距 ≥8px（`touch-spacing`）。
- 可点击元素 `cursor:pointer`（`cursor-pointer`）。

---

## 7. 响应式策略

- 移动优先：先写移动样式，再用 `min-width` 媒体查询向上扩展（`mobile-first`）。
- 视口：`width=device-width, initial-scale=1`，**不禁止缩放**（`viewport-meta`）。
- 移动端 `<768px`：顶部菜单折叠为抽屉；右侧侧边栏、TOC 隐藏；字号自适应；单列布局（`content-priority`）。
- 优先使用 `min-h-dvh` 替代 `100vh`（`viewport-units`）。
- 禁止横向滚动（`horizontal-scroll`）。
- 安全区：固定顶部栏/底部栏预留安全区 padding（`safe-area-awareness`）。

---

## 8. 图标系统

- 统一使用 **Lucide**（线性，描边 1.5px）作为主图标集；Element Plus 自带图标用于组件内部（`icon-style-consistent`）。
- 禁止用 emoji 作为结构性图标（`no-emoji-icons`）。
- 图标尺寸令牌：`--icon-sm:16px` `--icon-md:20px` `--icon-lg:24px`。
- 仅图标按钮必须 `aria-label`（`aria-labels`）。
- 导航项 **图标 + 文字** 并存（`nav-label-icon`）。

---

## 9. 组件库基线

> 通用组件清单（具体规格见 `docs/UI-UX-DESIGN-PLAN.md`）：
`GlassCard`、`AppNavbar`、`AppDrawer`、`NoteCard`、`TagCloud`、`Timeline`、`SearchOverlay`、`TableOfContents`、`BackToTop`、`ReadingProgress`、`CommentItem`、`CommentComposer`、`ThemeToggle`、`AdminSidebar`、`StatCard`、`DataTable`、`ImageGrid`、`VditorEditor`、`EmptyState`、`Skeleton`、`Toast`、`ConfirmDialog`。

组件需满足：
- 加载态用 Skeleton，>300ms 操作给反馈（`loading-states`、`progressive-loading`）。
- 空状态给文案 + 引导动作（`empty-states`）。
- 危险操作二次确认（`confirmation-dialogs`）。
- Toast 3–5s 自动消失，`aria-live="polite"`（`toast-dismiss`、`toast-accessibility`）。

---

## 10. 可访问性基线（CRITICAL）

- 对比度 AA（正文 4.5:1，大字 3:1），深色单独验证。
- 焦点环可见，键盘可达，Tab 顺序与视觉顺序一致（`focus-states`、`keyboard-nav`）。
- 标题层级 h1→h6 顺序递进不跳级（`heading-hierarchy`）。
- 图片有 alt；图标按钮有 aria-label（`alt-text`、`aria-labels`）。
- 提供跳过导航直达主内容的 skip-link（`skip-links`）。
- 表单：可见 label、错误就近、`aria-live`/`role="alert"`（`form-labels`、`aria-live-errors`）。
- 尊重 `prefers-reduced-motion` 与系统字号缩放（`reduced-motion`、`dynamic-type`）。

---

## 11. 交付前检查清单（强制）

> 每个页面交付前必须通过以下检查（依据技能 Pre-Delivery Checklist，适配 Web）。

### 视觉质量
- [ ] 无 emoji 用作图标；图标来自统一族、统一描边
- [ ] 全程语义令牌，无裸 hex
- [ ] 玻璃层叠加不超过 2 层，降级可读

### 交互
- [ ] 触控目标 ≥44px，间距 ≥8px
- [ ] 微交互 150–300ms，进入/退出 ease 方向正确
- [ ] 禁用态清晰且不可交互
- [ ] 焦点环可见，键盘顺序正确

### 明暗主题
- [ ] 主文字 ≥4.5:1、次文字 ≥3:1（双主题分别验证）
- [ ] 描边/分隔线/交互态在双主题均可辨
- [ ] Modal/抽屉遮罩 40–60% 黑，前景清晰

### 布局
- [ ] 375px 小屏 + 横屏验证，无横向滚动
- [ ] 安全区预留，固定栏不遮内容
- [ ] 4/8dp 间距节奏一致
- [ ] 长文行宽受控（65–75 字符）

### 可访问性
- [ ] 图片有 alt，图标按钮有 aria-label
- [ ] 表单有 label/错误/aria-live
- [ ] 颜色非唯一指示
- [ ] reduced-motion 与系统大字号不破版

---

## 12. 实现状态落地（2026-07-02 快照）

> 本节记录设计令牌与组件在代码中的落地情况，作为设计与实现的对齐基线。
> 状态图例：✅ 已落地 ｜ 🚧 部分 ｜ ⬜ 待开发

### 12.1 设计令牌落地

| 令牌组 | 文件 | 状态 | 说明 |
| --- | --- | --- | --- |
| 色彩语义令牌（§1） | `frontend/src/styles/variables.css` | ✅ | 全套 `--accent / --surface / --text-* / --border / --shadow*` 已定义，浅/深双主题通过 `[data-theme]` 切换 |
| 字体令牌（§2） | `variables.css` | ✅ | Inter / Noto Sans SC / JetBrains Mono 已配置 |
| 间距栅格（§3） | `variables.css` | ✅ | 4/8dp 令牌 `--space-1..--space-16` 全量定义 |
| 圆角令牌（§3） | `variables.css` | ✅ | `--radius-sm/md/lg/full` |
| 玻璃效果（§4） | `frontend/src/styles/glass.css` | ✅ | `.glass` 与 `.glass-interactive` 含 `backdrop-filter: blur()+saturate()`，`@supports` 降级为实色 + 描边 |
| 动效令牌（§5） | `variables.css` | ✅ | `--dur-fast/base/slow` + `--ease-out/in/spring` |
| reduced-motion | `variables.css` + 全局 | ✅ | 令牌已定义；`variables.css` 末尾全局 `@media (prefers-reduced-motion: reduce)` 将所有动画/过渡降至 0.01ms，单一拦截点覆盖全部组件 |
| 阴影令牌 | `variables.css` | ✅ | `--shadow / --shadow-strong / --shadow-glow` |
| z-index 层级 | `variables.css` | ✅ | `--z-navbar/drawer/modal/toast` 分层 |
| Element Plus 桥接 | `element-overrides.css` | ✅ | 将 `--el-color-primary` 等映射到主题令牌，保证组件库跟随主题 |

### 12.2 组件落地（对应 §9 基线）

| 组件 | 文件 | 状态 | 说明 |
| --- | --- | --- | --- |
| GlassCard | `.glass` 通用类 | ✅ | 各页面直接使用类名 |
| AppNavbar | `components/AppNavbar.vue` | ✅ | 含移动 Drawer + 全屏搜索弹层 |
| AppDrawer | Element Plus `el-drawer` | ✅ | 复用组件库 |
| NoteCard | `views/front/Home.vue` 内联 | ✅ | 卡片错峰入场 + 置顶徽章 |
| TagCloud | `views/front/Tags.vue` | ✅ | |
| Timeline | `views/front/Timeline.vue` | ✅ | |
| SearchOverlay | `AppNavbar.vue` 内嵌 | ✅ | 移动端全屏 |
| TableOfContents | `views/front/NoteDetail.vue` 内嵌（sticky 侧栏 + 滚动高亮 + 平滑滚动） | ✅ | 移动端 <1024px 隐藏 |
| BackToTop | `views/front/NoteDetail.vue` 内嵌（FAB + Intersection） | ✅ | 滚动 >400px 显示 |
| ReadingProgress | `views/front/NoteDetail.vue` 内嵌（顶部进度条） | ✅ | 基于 scroll 百分比 |
| CommentItem / CommentComposer | `components/CommentSection.vue`（2 级嵌套 + 蜜罐 + 点赞 + 回复） | ✅ | 接入 NoteDetail |
| ThemeToggle | `components/ThemeToggle.vue` | ✅ | 亮/暗/跟随系统三态 |
| AdminSidebar | `layouts/AdminLayout.vue` 内嵌 | ✅ | 240px + 移动 Drawer |
| StatCard | `views/admin/Dashboard.vue` 内嵌 | ✅ | |
| DataTable | Element Plus `el-table` | ✅ | |
| ImageGrid | `views/admin/Images.vue` | ✅ | |
| VditorEditor | `components/VditorEditor.vue` | ✅ | 动态 import + 自定义上传 handler |
| EmptyState | Element Plus `el-empty` | ✅ | |
| Skeleton | Element Plus `el-skeleton` | ✅ | |
| Toast | Element Plus `ElMessage` | ✅ | |
| ConfirmDialog | Element Plus `ElMessageBox` | ✅ | |

### 12.3 交付前检查清单（§11）执行情况

| 类别 | 状态 | 说明 |
| --- | --- | --- |
| 视觉质量 | ✅ | 全程语义令牌 ✅；玻璃层叠加 ≤2 ✅；图标统一 Lucide ✅ |
| 交互 | ✅ | 触控目标 / 焦点环到位；微交互时长符合令牌；reduced-motion 全量化（`variables.css` 全局媒体查询） |
| 明暗主题 | ✅ | 令牌双主题成对 ✅；亮色 accent 调至 indigo-600（白字 6.3:1）通过 WCAG AA；暗色主题原值达标 |
| 布局 | ✅ | 移动优先已落实；375px 响应式已修复（header flex-wrap / el-dialog max-width / 表格横滚 / 375px padding 缩减） |
| 可访问性 | ✅ | 表单 label / aria-live 由 Element Plus 提供；skip-link 已加（双布局）；icon-only 按钮 aria-label 齐全；heading 层级已逐页修正（每页唯一 h1、无跨级跳层）；亮色 accent 调至 indigo-600 通过 WCAG AA；Lighthouse CI a11y 断言 minScore 0.85 |

### 12.4 后续设计债务

1. Dashboard ECharts 主题已通过 `MutationObserver` 监听 `data-theme` 切换并刷新配色，调色板基于 `variables.css` 令牌派生。✅
2. reduced-motion 已全量化：`variables.css` 末尾全局 `@media (prefers-reduced-motion: reduce)` 将所有动画/过渡降至 0.01ms，单一拦截点覆盖全部组件。✅
3. 主题对比度：亮色 `--accent` 调至 indigo-600 `#4f46e5`，白字对比 6.3:1 通过 WCAG AA；暗色主题原值达标。✅
4. skip-link 已加至 FrontLayout / AdminLayout；heading 层级逐页核查待办。
5. 375px / 横屏 / 键盘可达性手动回归测试待办。
6. 对比度自动化验证（接入 axe-core / Lighthouse CI）待办。
7. Vite manualChunks 已分包（vditor/echarts/element-plus 独立 chunk）；虚拟滚动决策不引入（分页覆盖长列表）。✅
