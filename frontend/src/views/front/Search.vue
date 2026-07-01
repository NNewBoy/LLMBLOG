<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listNotes } from '@/api'
import type { NoteSummary } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Skeleton from '@/components/Skeleton.vue'

const route = useRoute()
const router = useRouter()
const results = ref<NoteSummary[]>([])
const loading = ref(false)
const q = ref('')

async function doSearch() {
  q.value = (route.query.q as string) || ''
  if (!q.value) {
    results.value = []
    return
  }
  loading.value = true
  try {
    const res = await listNotes({ keyword: q.value, page_size: 30 })
    results.value = res.items
  } finally {
    loading.value = false
  }
}
onMounted(doSearch)
watch(() => route.query.q, doSearch)

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlight(text: string): string {
  const safe = escapeHtml(text || '')
  if (!q.value.trim()) return safe
  const kw = escapeRegExp(q.value.trim())
  const re = new RegExp(`(${kw})`, 'gi')
  return safe.replace(re, '<mark class="hl">$1</mark>')
}

const hasResults = computed(() => !loading.value && results.value.length > 0)
</script>

<template>
  <GlassCard padding="32px">
    <h1 class="page-title">搜索结果：{{ q || '—' }}</h1>
    <Skeleton v-if="loading" :lines="5" />
    <template v-else>
      <div v-if="hasResults" class="list">
        <div
          v-for="n in results"
          :key="n.id"
          class="item"
          @click="router.push({ name: 'note-detail', params: { slug: n.slug } })"
        >
          <h2 class="t" v-html="highlight(n.title)" />
          <p class="s" v-html="highlight(n.summary)" />
        </div>
      </div>
      <EmptyState v-else :text="q ? `未找到「${q}」相关笔记` : '输入关键词开始搜索'" />
    </template>
  </GlassCard>
</template>

<style scoped>
.page-title {
  margin: 0 0 var(--sp-5);
  font-size: var(--fs-lg);
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
:deep(.hl) {
  background: var(--accent-soft);
  color: var(--accent);
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 600;
}
</style>
