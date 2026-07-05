<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, MessageCircle, ArrowLeft, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getNote } from '@/api'
import type { NoteDetail } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import Skeleton from '@/components/Skeleton.vue'
import CommentSection from '@/components/CommentSection.vue'
import { useThemeStore } from '@/stores/theme'
import { renderMarkdown } from '@/utils/markdown'
import { loadHighlightTheme } from '@/utils/markdown-theme'
import 'katex/dist/katex.css'

interface TocItem {
  id: string
  text: string
  level: number
}

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const note = ref<NoteDetail | null>(null)
const loading = ref(true)

const contentEl = ref<HTMLDivElement>()
const tocEl = ref<HTMLElement>()
const toc = ref<TocItem[]>([])
const activeTocId = ref('')
const showTop = ref(false)
const progress = ref(0)
const rendering = ref(false)

const lightboxSrc = ref('')
const lightboxAlt = ref('')

let cleanupFns: Array<() => void> = []
let scrollWrap: HTMLElement | null = null

/** 向上查找 el-scrollbar 的滚动容器 */
function getScrollWrap(): HTMLElement | null {
  if (!contentEl.value) return null
  let el: HTMLElement | null = contentEl.value
  while (el) {
    if (el.classList?.contains('el-scrollbar__wrap')) return el
    el = el.parentElement
  }
  return null
}

async function load() {
  loading.value = true
  toc.value = []
  activeTocId.value = ''
  try {
    note.value = await getNote(route.params.slug as string)
    if (!note.value) return
    // 必须先关闭 loading，v-else-if="note" 分支才会挂载 contentEl，
    // 否则 renderContent() 因拿不到 contentEl 直接 return，正文与目录都不渲染
    loading.value = false
    await nextTick()
    await renderContent()
  } catch (e) {
    console.error('[NoteDetail] load failed:', e)
    note.value = null
  } finally {
    loading.value = false
  }
}

async function renderContent() {
  if (!note.value || !contentEl.value) return
  rendering.value = true
  const el = contentEl.value
  // 加载 highlight.js 主题 CSS
  loadHighlightTheme(themeStore.theme === 'dark' ? 'dark' : 'light')
  // 用 markdown-it 渲染（同步，极快）
  el.innerHTML = renderMarkdown(note.value.content)
  buildToc(el)
  enhanceImages(el)
  renderMermaid(el)
  bindScroll()
  rendering.value = false
}

/** 异步渲染 Mermaid 图表 */
async function renderMermaid(root: HTMLElement) {
  const mermaidEls = root.querySelectorAll('.mermaid')
  if (!mermaidEls.length) return
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({ startOnLoad: false, theme: themeStore.theme === 'dark' ? 'dark' : 'default' })
  mermaidEls.forEach((el, i) => {
    const code = el.textContent || ''
    const id = `mermaid-${i}`
    try {
      mermaid.render(id, code).then(({ svg }: { svg: string }) => {
        el.innerHTML = svg
      })
    } catch {
      el.innerHTML = `<pre>Mermaid 渲染失败</pre>`
    }
  })
}

function buildToc(root: HTMLElement) {
  const heads = root.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const items: TocItem[] = []
  heads.forEach((h, i) => {
    if (!h.id) {
      h.id = (h.textContent || '').trim() || `toc-${i}`
    }
    items.push({
      id: h.id,
      text: (h.textContent || '').trim(),
      level: Number(h.tagName.slice(1)),
    })
  })
  toc.value = items
  if (items.length) activeTocId.value = items[0].id
}

function enhanceImages(root: HTMLElement) {
  const imgs = root.querySelectorAll('img')
  imgs.forEach((img) => {
    img.setAttribute('loading', 'lazy')
    img.setAttribute('tabindex', '0')
    img.classList.add('article-img')
    img.addEventListener('click', () => {
      lightboxSrc.value = img.src
      lightboxAlt.value = img.alt
    })
    img.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        lightboxSrc.value = img.src
        lightboxAlt.value = img.alt
      }
    })
  })
}

function bindScroll() {
  unbindScroll()
  scrollWrap = getScrollWrap()
  if (!scrollWrap) return
  const onScroll = () => {
    if (!scrollWrap) return
    const scrollTop = scrollWrap.scrollTop
    const max = scrollWrap.scrollHeight - scrollWrap.clientHeight
    progress.value = max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0
    showTop.value = scrollTop > 400
    updateActiveToc()
  }
  scrollWrap.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  cleanupFns.push(() => scrollWrap?.removeEventListener('scroll', onScroll))
}

function unbindScroll() {
  cleanupFns.forEach((fn) => fn())
  cleanupFns = []
}

function updateActiveToc() {
  if (!toc.value.length || !contentEl.value) return
  const heads = contentEl.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let current = toc.value[0].id
  const offset = 120
  heads.forEach((h) => {
    const rect = (h as HTMLElement).getBoundingClientRect()
    if (rect.top <= offset) {
      current = h.id
    }
  })
  activeTocId.value = current
  // 同步 TOC 滚动到可视（手动计算，避免 scrollIntoView 触发主滚动容器）
  if (tocEl.value) {
    const active = tocEl.value.querySelector('.toc-item.on') as HTMLElement | null
    if (active) {
      const cRect = tocEl.value.getBoundingClientRect()
      const aRect = active.getBoundingClientRect()
      if (aRect.top < cRect.top) {
        tocEl.value.scrollTop -= cRect.top - aRect.top
      } else if (aRect.bottom > cRect.bottom) {
        tocEl.value.scrollTop += aRect.bottom - cRect.bottom
      }
    }
  }
}

function scrollToHeading(id: string) {
  const target = document.getElementById(id)
  if (!target || !scrollWrap) return
  const top = target.getBoundingClientRect().top - scrollWrap.getBoundingClientRect().top + scrollWrap.scrollTop - 80
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  scrollWrap.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
}

function backToTop() {
  if (!scrollWrap) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  scrollWrap.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

function closeLightbox() {
  lightboxSrc.value = ''
  lightboxAlt.value = ''
}

onMounted(load)
watch(() => route.params.slug, load)
watch(() => themeStore.theme, () => {
  if (note.value && contentEl.value) renderContent()
})
onBeforeUnmount(unbindScroll)
</script>

<template>
  <div class="detail">
    <!-- 阅读进度条 -->
    <div class="progress-bar" :style="{ width: progress + '%' }" aria-hidden="true" />

    <GlassCard v-if="loading" padding="24px">
      <Skeleton :lines="8" />
    </GlassCard>

    <template v-else-if="note">
      <div class="detail-grid">
        <!-- 正文 -->
        <GlassCard padding="24px" class="article">
          <button class="back" @click="router.back()">
            <ArrowLeft :size="16" /> 返回
          </button>
          <h1 class="title">{{ note.title }}</h1>
          <div class="meta">
            <span>{{ note.author }}</span>
            <span class="tabular">{{ new Date(note.created_at).toLocaleDateString('zh-CN') }}</span>
            <span><Eye :size="14" /> <span class="tabular">{{ note.view_count }}</span></span>
            <span><MessageCircle :size="14" /> <span class="tabular">{{ note.comment_count }}</span></span>
          </div>
          <div v-if="note.tags && note.tags.length" class="tags">
            <span v-for="t in note.tags" :key="t.id" class="tag">{{ t.name }}</span>
          </div>
          <div ref="contentEl" class="markdown-body" />

          <!-- 上下篇 -->
          <nav v-if="note.prev || note.next" class="prevnext" aria-label="上下篇导航">
            <button
              v-if="note.prev"
              class="pn prev"
              @click="router.push({ name: 'note-detail', params: { slug: note.prev!.slug } })"
            >
              <ChevronLeft :size="16" />
              <span class="pn-label">上一篇</span>
              <span class="pn-title">{{ note.prev.title }}</span>
            </button>
            <span v-else class="pn placeholder" />
            <button
              v-if="note.next"
              class="pn next"
              @click="router.push({ name: 'note-detail', params: { slug: note.next!.slug } })"
            >
              <span class="pn-label">下一篇</span>
              <span class="pn-title">{{ note.next.title }}</span>
              <ChevronRight :size="16" />
            </button>
            <span v-else class="pn placeholder" />
          </nav>
        </GlassCard>

        <!-- TOC 侧栏 -->
        <aside v-if="toc.length" ref="tocEl" class="toc" aria-label="目录">
          <div class="toc-head">目录</div>
          <a
            v-for="item in toc"
            :key="item.id"
            class="toc-item"
            :class="{ on: activeTocId === item.id }"
            :style="{ paddingLeft: 8 + (item.level - 1) * 12 + 'px' }"
            href="javascript:void(0)"
            @click="scrollToHeading(item.id)"
          >
            {{ item.text }}
          </a>
        </aside>
      </div>

      <!-- 评论区 -->
      <CommentSection :note-id="note.id" />
    </template>

    <GlassCard v-else padding="48px" class="empty">
      <p>笔记不存在或已隐藏。</p>
      <button class="back" @click="router.push('/')">返回首页</button>
    </GlassCard>

    <!-- 回到顶部 -->
    <Transition name="fab">
      <button v-if="showTop" class="back-top" aria-label="回到顶部" @click="backToTop">
        <ArrowUp :size="20" />
      </button>
    </Transition>

    <!-- 图片灯箱 -->
    <Transition name="fade">
      <div v-if="lightboxSrc" class="lightbox" role="dialog" aria-modal="true" @click="closeLightbox">
        <img :src="lightboxSrc" :alt="lightboxAlt" class="lightbox-img" @click.stop />
        <button class="lightbox-close" aria-label="关闭" @click="closeLightbox">×</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.detail {
  position: relative;
}
.progress-bar {
  position: fixed;
  top: calc(var(--navbar-h) + var(--sp-4));
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-hover));
  z-index: 90;
  transition: width 80ms linear;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: var(--sp-5);
  align-items: start;
}
.article {
  position: relative;
  min-width: 0;
}
.article .markdown-body {
  padding: var(--sp-4);
}
.back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-4);
  padding: var(--sp-2);
}
.back:hover {
  color: var(--accent);
}
.title {
  text-align: center;
  margin: 0 0 var(--sp-3);
  font-size: var(--fs-xl);
  font-weight: 700;
  line-height: 1.3;
}
.meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--sp-3);
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-3);
}
.meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-bottom: var(--sp-5);
}
.tag {
  padding: 2px var(--sp-3);
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: var(--fs-xs);
}
/* 上下篇 */
.prevnext {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
  margin-top: var(--sp-7);
  padding-top: var(--sp-5);
  border-top: 1px solid var(--border);
}
.pn {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--sp-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--dur-fast), background var(--dur-fast);
  min-width: 0;
}
.pn.next {
  text-align: right;
  align-items: flex-end;
}
.pn:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.pn.placeholder {
  visibility: hidden;
}
.pn-label {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}
.pn-title {
  font-size: var(--fs-sm);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* TOC */
.toc {
  position: sticky;
  top: var(--distance-nav-h);
  align-self: start;
  max-height: calc(100vh - var(--distance-nav-h) - var(--sp-4));
  overflow-y: auto;
  padding: var(--sp-3);
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-md);
  backdrop-filter: blur(var(--blur)) saturate(var(--saturate));
}
.toc-head {
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--sp-2);
  padding: 0 4px;
}
.toc-item {
  display: block;
  padding: 4px 8px;
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  text-decoration: none;
  border-left: 2px solid transparent;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--dur-fast), border-color var(--dur-fast), background var(--dur-fast);
}
.toc-item:hover {
  color: var(--accent);
}
.toc-item.on {
  color: var(--accent);
  border-left-color: var(--accent);
  background: var(--accent-soft);
  font-weight: 500;
}

/* 回到顶部 */
.back-top {
  position: fixed;
  right: var(--sp-5);
  bottom: var(--sp-6);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: var(--accent-on);
  cursor: pointer;
  box-shadow: var(--shadow-strong);
  z-index: 80;
  transition: background var(--dur-fast), transform var(--dur-fast);
}
.back-top:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

/* 灯箱 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-6);
  cursor: zoom-out;
}
.lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: var(--radius-sm);
  cursor: default;
}
.lightbox-close {
  position: absolute;
  top: var(--sp-4);
  right: var(--sp-5);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}
.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.empty {
  text-align: center;
  color: var(--text-secondary);
}
.empty .back {
  margin-top: var(--sp-3);
  justify-content: center;
}

/* Markdown 正文排版见全局 styles/markdown-body.css */

/* 过渡 */
.fab-enter-active,
.fab-leave-active {
  transition: opacity var(--dur-fast), transform var(--dur-fast);
}
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur-base);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式：移动端隐藏 TOC，上下篇单列 */
@media (max-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .toc {
    display: none;
  }
}
@media (max-width: 748px) {
  .progress-bar {
    top: calc(var(--navbar-h) + var(--sp-3));
  }
  .article {
    padding: var(--sp-3) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .progress-bar {
    transition: none;
  }
  .back-top {
    transition: none;
  }
}
</style>
