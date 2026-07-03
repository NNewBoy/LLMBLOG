<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { listTags, listNotes } from '@/api'
import type { Tag, NoteSummary } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const tags = ref<Tag[]>([])
const loadingTags = ref(true)
const selectedIds = ref<Set<number>>(new Set())
const articles = ref<NoteSummary[]>([])
const loadingArticles = ref(false)
const router = useRouter()

onMounted(async () => {
  try {
    tags.value = await listTags()
  } finally {
    loadingTags.value = false
  }
})

function maxCount() {
  return Math.max(1, ...tags.value.map((t) => t.note_count || 0))
}
function fontSize(c: number) {
  return 14 + Math.round(((c || 0) / maxCount()) * 14)
}

function toggleTag(id: number) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedIds.value = next
  fetchArticles()
}

async function fetchArticles() {
  if (selectedIds.value.size === 0) {
    articles.value = []
    return
  }
  loadingArticles.value = true
  try {
    const ids = [...selectedIds.value].sort().join(',')
    const res = await listNotes({ tag_ids: ids, page_size: 30 })
    articles.value = res.items
  } finally {
    loadingArticles.value = false
  }
}

function clearSelection() {
  selectedIds.value = new Set()
  articles.value = []
}

const hasSelection = computed(() => selectedIds.value.size > 0)
const hasArticles = computed(() => !loadingArticles.value && articles.value.length > 0)
const isEmpty = computed(() => !loadingArticles.value && hasSelection.value && articles.value.length === 0)
</script>

<template>
  <GlassCard padding="32px">
    <h1 class="page-title">标签</h1>

    <!-- 标签云 -->
    <div v-if="tags.length" class="cloud">
      <button
        v-for="t in tags"
        :key="t.id"
        class="cloud-tag"
        :class="{ picked: selectedIds.has(t.id) }"
        :style="{ fontSize: fontSize(t.note_count || 0) + 'px' }"
        @click="toggleTag(t.id)"
      >
        {{ t.name }} <span class="count">{{ t.note_count }}</span>
      </button>
    </div>
    <EmptyState v-else-if="!loadingTags" text="还没有标签" />

    <!-- 已选标签提示 -->
    <div v-if="hasSelection" class="selection-bar">
      <span class="selected-hint">已选 {{ selectedIds.size }} 个标签</span>
      <button class="clear-btn" @click="clearSelection">清空</button>
    </div>

    <!-- 文章列表 -->
    <template v-if="hasSelection">
      <div v-if="loadingArticles" class="loading-text">加载中…</div>
      <div v-else-if="hasArticles" class="list">
        <div
          v-for="n in articles"
          :key="n.id"
          class="item"
          @click="router.push({ name: 'note-detail', params: { slug: n.slug } })"
        >
          <h2 class="t">{{ n.title }}</h2>
          <p class="s">{{ n.summary }}</p>
        </div>
      </div>
      <EmptyState v-else-if="isEmpty" text="选中标签下暂无笔记" />
    </template>
  </GlassCard>
</template>

<style scoped>
.page-title {
  margin: 0 0 var(--sp-5);
  font-size: var(--fs-lg);
}
.cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  align-items: center;
  margin-bottom: var(--sp-5);
}
.cloud-tag {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  border: 1px solid var(--border);
  background: var(--surface-hover);
  color: var(--text);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);
}
.cloud-tag:hover {
  background: var(--accent-soft);
  color: var(--accent);
}
.cloud-tag.picked {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}
.count {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}
.cloud-tag.picked .count {
  color: var(--accent);
}

.selection-bar {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
  padding-bottom: var(--sp-3);
  border-bottom: 1px solid var(--border);
}
.selected-hint {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}
.clear-btn {
  border: none;
  background: transparent;
  color: var(--accent);
  font-size: var(--fs-sm);
  cursor: pointer;
  padding: var(--sp-1) var(--sp-2);
  border-radius: var(--radius-sm);
}
.clear-btn:hover {
  background: var(--accent-soft);
}

.loading-text {
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  padding: var(--sp-5) 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
.item {
  padding: var(--sp-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out);
}
.item:hover {
  background: var(--surface-hover);
}
.t {
  margin: 0 0 var(--sp-1);
  font-size: var(--fs-md);
  color: var(--text);
}
.s {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
