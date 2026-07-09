<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getTimeline } from '@/api'
import GlassCard from '@/components/GlassCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Skeleton from '@/components/Skeleton.vue'

const data = ref<Record<string, Record<string, any[]>>>({})
const loading = ref(true)
const router = useRouter()

const sortedYears = computed(() =>
  Object.keys(data.value).sort((a, b) => Number(b) - Number(a)),
)

onMounted(async () => {
  try {
    data.value = await getTimeline()
  } finally {
    loading.value = false
  }
})
function fmt(d: string) {
  return new Date(d).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}
</script>

<template>
  <GlassCard padding="24px" class="timeline-card">
    <h1 class="page-title">时间线</h1>
    <Skeleton v-if="loading" :lines="6" />
    <template v-else>
      <div v-if="sortedYears.length" class="years">
        <section v-for="year in sortedYears" :key="year" class="year">
          <h2 class="year-title">{{ year }}</h2>
          <div v-for="(items, month) in data[year]" :key="month" class="month">
            <h3 class="month-title">{{ month }} 月</h3>
            <ul class="items">
              <li v-for="n in items" :key="n.id" @click="router.push({ name: 'note-detail', params: { slug: n.slug } })">
                <span class="date tabular">{{ fmt(n.created_at) }}</span>
                <span class="t">{{ n.title }}</span>
                <span class="v tabular">{{ n.view_count }} 次</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <EmptyState v-else text="还没有笔记" />
    </template>
  </GlassCard>
</template>

<style scoped>
.page-title {
  margin: 0 0 var(--sp-5);
  font-size: var(--fs-lg);
}
.years {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}
.year {
  border-left: 3px solid var(--accent);
  padding-left: var(--sp-4);
}
.year-title {
  margin: 0 0 var(--sp-3);
  font-size: var(--fs-md);
  color: var(--accent);
}
.month {
  margin-bottom: var(--sp-4);
}
.month-title {
  margin: 0 0 var(--sp-2);
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}
.items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.items li {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--fs-sm);
  transition: background var(--dur-fast) var(--ease-out);
}
.items li:hover {
  background: var(--surface-hover);
}
.date {
  color: var(--text-secondary);
  flex-shrink: 0;
  width: 56px;
}
.t {
  flex: 1;
  color: var(--text);
}
.v {
  color: var(--text-secondary);
  font-size: var(--fs-xs);
}
@media (max-width: 748px) {
  .timeline-card {
    padding: var(--sp-3) !important;
  }
}
</style>
