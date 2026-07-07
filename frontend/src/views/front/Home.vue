<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listNotes } from '@/api'
import type { NoteSummary } from '@/types'
import NoteCard from '@/components/NoteCard.vue'
import GlassCard from '@/components/GlassCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Skeleton from '@/components/Skeleton.vue'

const notes = ref<NoteSummary[]>([])
const loading = ref(true)
const page = ref(1)
const total = ref(0)
const pageSize = 10
const loadingMore = ref(false)

async function load(reset = false) {
  if (reset) {
    page.value = 1
    loading.value = true
  }
  const res = await listNotes({ page: page.value, page_size: pageSize })
  if (reset) notes.value = res.items
  else notes.value = [...notes.value, ...res.items]
  total.value = res.total
  loading.value = false
  loadingMore.value = false
}

async function more() {
  if (notes.value.length >= total.value || loadingMore.value) return
  loadingMore.value = true
  page.value += 1
  await load(false)
}

import { recordEntryClick } from '@/api'

onMounted(() => {
  load(true)
  recordEntryClick('/').catch(() => {})
})
</script>

<template>
  <div class="home">
    <h1 class="sr-only">最新笔记</h1>
    <div v-if="loading" class="list">
      <GlassCard v-for="i in 3" :key="i" padding="24px">
        <Skeleton :lines="4" />
      </GlassCard>
    </div>
    <div v-else-if="notes.length" class="list">
      <NoteCard v-for="n in notes" :key="n.id" :note="n" />
      <div v-if="notes.length < total" class="more-wrap">
        <button class="more" :disabled="loadingMore" @click="more">
          {{ loadingMore ? '加载中…' : '加载更多' }}
        </button>
      </div>
    </div>
    <EmptyState v-else text="还没有笔记，去后台写第一篇吧" />
  </div>
</template>

<style scoped>
.home .list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}
.more-wrap {
  display: flex;
  justify-content: center;
  padding: var(--sp-4);
}
.more {
  min-width: 120px;
  height: 44px;
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-size: var(--fs-sm);
  transition: background var(--dur-fast) var(--ease-out);
}
.more:hover:not(:disabled) {
  background: var(--surface-hover);
}
.more:disabled {
  opacity: 0.6;
}
</style>
