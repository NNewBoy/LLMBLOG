<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listTags } from '@/api'
import type { Tag } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const tags = ref<Tag[]>([])
const loading = ref(true)
const router = useRouter()

onMounted(async () => {
  try {
    tags.value = await listTags()
  } finally {
    loading.value = false
  }
})
function maxCount() {
  return Math.max(1, ...tags.value.map((t) => t.note_count || 0))
}
function fontSize(c: number) {
  return 14 + Math.round(((c || 0) / maxCount()) * 14)
}
</script>

<template>
  <GlassCard padding="32px">
    <h1 class="page-title">标签</h1>
    <div v-if="tags.length" class="cloud">
      <button
        v-for="t in tags"
        :key="t.id"
        class="cloud-tag"
        :style="{ fontSize: fontSize(t.note_count || 0) + 'px' }"
      >
        {{ t.name }} <span class="count">{{ t.note_count }}</span>
      </button>
    </div>
    <EmptyState v-else text="还没有标签" />
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
}
.cloud-tag {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  border: none;
  background: var(--surface-hover);
  color: var(--text);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.cloud-tag:hover {
  background: var(--accent-soft);
  color: var(--accent);
}
.count {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}
</style>
