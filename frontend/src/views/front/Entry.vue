<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, LayoutDashboard, ExternalLink, ArrowRight, Globe } from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useSettingsStore } from '@/stores/settings'
import { useThemeStore } from '@/stores/theme'
import { recordEntryClick } from '@/api'
import type { EntryLink } from '@/types'

const router = useRouter()
const settings = useSettingsStore()
const theme = useThemeStore()

onMounted(() => settings.load())

interface EntryItem {
  key: string
  title: string
  desc: string
  icon: any
  target: string
  internal: boolean
}

const entries = computed<EntryItem[]>(() => {
  const builtIn: EntryItem[] = [
    { key: 'blog', title: 'Blog 主页', desc: '阅读笔记、标签与时间线', icon: BookOpen, target: '/', internal: true },
    { key: 'admin', title: 'Blog 后台', desc: '管理笔记、图片与站点设置', icon: LayoutDashboard, target: '/admin', internal: true },
  ]
  const configured: EntryItem[] = (settings.settings.entry_links || []).map((l: EntryLink, i: number) => ({
    key: `ext-${i}`,
    title: l.title || l.url,
    desc: l.url,
    icon: ExternalLink,
    target: l.url,
    internal: false,
  }))
  return [...builtIn, ...configured]
})

/** 给外部跳转链接拼接当前主题参数 */
function withThemeParam(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}theme=${theme.theme}`
}

function go(item: EntryItem) {
  // 记录入口点击（异步、失败不阻塞跳转）
  recordEntryClick(item.target).catch(() => {})
  if (item.internal) {
    router.push(item.target)
  } else {
    window.location.href = withThemeParam(item.target)
  }
}

function onKeydown(e: KeyboardEvent, item: EntryItem) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    go(item)
  }
}
</script>

<template>
  <div class="entry-page">
    <!-- 顶栏 -->
    <div class="entry-topbar-wrapper">
      <header class="entry-topbar glass">
        <div class="brand">
          <Globe :size="22" />
          <span>{{ settings.settings.site_name || '个人笔记博客' }}</span>
        </div>
        <ThemeToggle />
      </header>
    </div>

    <!-- 主体 -->
    <el-scrollbar class="entry-scroll">
      <main id="main-content" class="entry-main">
      <section class="hero">
        <h1 class="hero-title">{{ settings.settings.site_name || '个人笔记博客' }}</h1>
        <p class="hero-desc">{{ settings.settings.site_desc || settings.settings.blogger_desc || '一个记录与分享的角落' }}</p>
      </section>

      <section class="entry-grid" aria-label="入口列表">
        <article
          v-for="item in entries"
          :key="item.key"
          class="entry-card glass glass-interactive"
          tabindex="0"
          role="link"
          :aria-label="`进入 ${item.title}`"
          @click="go(item)"
          @keydown="onKeydown($event, item)"
        >
          <div class="card-icon">
            <component :is="item.icon" :size="28" />
          </div>
          <div class="card-body">
            <h2 class="card-title">{{ item.title }}</h2>
            <p class="card-desc">{{ item.desc }}</p>
          </div>
          <ArrowRight class="card-arrow" :size="20" />
        </article>
      </section>
    </main>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.entry-page {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* 顶栏 */
.entry-topbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-navbar);
  padding: var(--sp-4) var(--sp-5);
  background: transparent;
}
.entry-topbar {
  height: var(--navbar-h);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  padding: 0 var(--sp-5);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
  font-weight: 700;
  font-size: var(--fs-md);
  color: var(--text);
}
.brand svg { color: var(--accent); }

/* 主体 */
.entry-scroll {
  flex: 1;
  min-height: 0;
}
.entry-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-7);
  padding: var(--distance-nav-h) var(--sp-5) var(--sp-6);
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
}

/* Hero */
.hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
.hero-title {
  margin: 0;
  font-size: clamp(var(--fs-xl), 6vw, var(--fs-2xl));
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(120deg, var(--accent), var(--bg-blob-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-desc {
  margin: 0;
  font-size: var(--fs-md);
  color: var(--text-secondary);
  max-width: 560px;
}

/* 入口卡片网格 */
.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--sp-4);
  width: 100%;
}
.entry-card {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-5);
  cursor: pointer;
  border-radius: var(--radius-lg);
  min-width: 0;
}
.entry-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.card-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: var(--accent-soft);
  color: var(--accent);
}
.card-body {
  flex: 1;
  min-width: 0;
}
.card-title {
  margin: 0 0 var(--sp-1);
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--text);
}
.card-desc {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-arrow {
  flex-shrink: 0;
  color: var(--text-secondary);
  transition: transform var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}
.entry-card:hover .card-arrow,
.entry-card:focus-visible .card-arrow {
  transform: translateX(4px);
  color: var(--accent);
}

/* 备案 */
.entry-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}
.entry-footer a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
}
.entry-footer a:hover {
  color: var(--accent);
}
.footer-sep {
  color: var(--text-disabled);
  flex-shrink: 0;
}
.footer-police-icon {
  flex-shrink: 0;
}
.footer-police-img {
  width: 16px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
}

/* 移动端 */
@media (max-width: 768px) {
  .entry-topbar-wrapper { padding: var(--sp-3) var(--sp-4); }
  .entry-main { padding: var(--distance-nav-h-mobile) var(--sp-4) var(--sp-5); gap: var(--sp-6); }
  .entry-grid { grid-template-columns: 1fr; }
  .card-desc { white-space: normal; }
}
</style>
