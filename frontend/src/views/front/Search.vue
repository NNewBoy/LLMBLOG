<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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
</script>

<template>
  <GlassCard padding="32px">
    <h2 class="page-title">搜索结果：{{ q || '—' }}</h2>
    <Skeleton v-if="loading" :lines="5" />
    <template v-else>
      <div v-if="results.length" class="list">
        <div
          v-for="n in results"
          :key="n.id"
          class="item"
          @click="router.push({ name: 'note-detail', params: { slug: n.slug } })"
        >
          <h3 class="t">{{ n.title }}</h3>
          <p class="s">{{ n.summary }}</p>
        </div>
      </div>
      <EmptyState v-else text="未找到相关笔记" />
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
}
</style>
