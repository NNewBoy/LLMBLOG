<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getOverview } from '@/api'
import type { Overview } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import { FileText, Users, Eye, MessageCircle } from 'lucide-vue-next'

const ov = ref<Overview | null>(null)
const cards = ref([
  { key: 'note_count', label: '笔记总数', icon: FileText },
  { key: 'uv', label: '总访客数', icon: Users },
  { key: 'pv', label: '总访问数', icon: Eye },
  { key: 'comment_count', label: '评论总数', icon: MessageCircle },
])
onMounted(async () => {
  ov.value = await getOverview()
})
</script>

<template>
  <div>
    <h2 class="page-title">分析概览</h2>
    <div class="grid">
      <GlassCard v-for="c in cards" :key="c.key" padding="24px" interactive>
        <div class="stat">
          <component :is="c.icon" :size="24" class="stat-icon" />
          <div>
            <div class="stat-num tabular">{{ ov ? (ov as any)[c.key] : '—' }}</div>
            <div class="stat-label">{{ c.label }}</div>
          </div>
        </div>
      </GlassCard>
    </div>
    <GlassCard padding="24px" class="chart-ph">
      <p class="ph">访客量日线图将在 M3 接入 ECharts</p>
    </GlassCard>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 var(--sp-5);
  font-size: var(--fs-xl);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--sp-4);
  margin-bottom: var(--sp-5);
}
.stat {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.stat-icon {
  color: var(--accent);
}
.stat-num {
  font-size: var(--fs-xl);
  font-weight: 700;
}
.stat-label {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}
.chart-ph .ph {
  margin: 0;
  text-align: center;
  color: var(--text-secondary);
  padding: var(--sp-7);
}
</style>
