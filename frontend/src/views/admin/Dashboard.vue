<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, nextTick } from 'vue'
import { getOverview, getVisitors, getTopNotes, getTerminals } from '@/api'
import type { Overview, DayPoint, TerminalPoint, TopNote } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import BaseChart from '@/components/BaseChart.vue'
import { FileText, Users, Eye, MessageCircle, Loader2 } from 'lucide-vue-next'

const ov = ref<Overview | null>(null)
const days = ref(30)
const visitors = ref<DayPoint[]>([])
const terminals = ref<TerminalPoint[]>([])
const topNotes = ref<TopNote[]>([])

const loadingOverview = ref(false)
const loadingVisitors = ref(false)
const loadingTerminals = ref(false)
const loadingTop = ref(false)
const visitorErr = ref('')
const terminalErr = ref('')
const topErr = ref('')

const visitorRef = ref<InstanceType<typeof BaseChart>>()
const terminalRef = ref<InstanceType<typeof BaseChart>>()
const topRef = ref<InstanceType<typeof BaseChart>>()

const cards = [
  { key: 'note_count', label: '笔记总数', icon: FileText },
  { key: 'uv', label: '总访客数', icon: Users },
  { key: 'pv', label: '总访问数', icon: Eye },
  { key: 'comment_count', label: '评论总数', icon: MessageCircle },
] as const

const reduceMotion = computed(
  () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)

const visitorOption = computed(() => {
  const c = themeColors()
  const dates = visitors.value.map((d) => d.date.slice(5))
  const pvs = visitors.value.map((d) => d.pv)
  const uvs = visitors.value.map((d) => d.uv)
  return {
    color: ['#6366f1', '#22c55e'],
    textStyle: { color: c.text, fontSize: 12 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.surface,
      borderColor: c.border,
      textStyle: { color: c.text },
    },
    legend: {
      data: ['访问量 PV', '访客数 UV'],
      top: 0,
      textStyle: { color: c.textSecondary },
    },
    grid: { left: 40, right: 20, top: 36, bottom: 28 },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: c.border } },
      axisLabel: { color: c.textSecondary, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: c.border } },
      axisLabel: { color: c.textSecondary, fontSize: 11 },
    },
    animation: !reduceMotion.value,
    series: [
      {
        name: '访问量 PV',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: pvs,
        areaStyle: { opacity: 0.15 },
        lineStyle: { width: 2 },
      },
      {
        name: '访客数 UV',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: uvs,
        lineStyle: { width: 2 },
      },
    ],
  }
})

const terminalOption = computed(() => {
  const c = themeColors()
  const data = terminals.value.slice(0, 6)
  return {
    color: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7'],
    textStyle: { color: c.text, fontSize: 12 },
    tooltip: {
      trigger: 'item',
      backgroundColor: c.surface,
      borderColor: c.border,
      textStyle: { color: c.text },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 8,
      top: 'center',
      textStyle: { color: c.textSecondary, fontSize: 11 },
    },
    animation: !reduceMotion.value,
    series: [
      {
        type: 'pie',
        radius: ['42%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: c.surface, borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data,
      },
    ],
  }
})

const topOption = computed(() => {
  const c = themeColors()
  const data = topNotes.value
    .slice()
    .reverse()
    .map((n) => ({
      value: n.view_count,
      name: n.title.length > 16 ? n.title.slice(0, 16) + '…' : n.title,
    }))
  return {
    color: ['#6366f1'],
    textStyle: { color: c.text, fontSize: 12 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: c.surface,
      borderColor: c.border,
      textStyle: { color: c.text },
    },
    grid: { left: 8, right: 40, top: 10, bottom: 10, containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: c.border } },
      axisLabel: { color: c.textSecondary, fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: data.map((d) => d.name),
      axisLine: { lineStyle: { color: c.border } },
      axisLabel: { color: c.textSecondary, fontSize: 11 },
    },
    animation: !reduceMotion.value,
    series: [
      {
        type: 'bar',
        data: data.map((d) => d.value),
        barWidth: '55%',
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', color: c.textSecondary, fontSize: 11 },
      },
    ],
  }
})

function themeColors() {
  const s = getComputedStyle(document.documentElement)
  return {
    text: s.getPropertyValue('--text').trim() || '#1a1f2e',
    textSecondary: s.getPropertyValue('--text-secondary').trim() || '#4a5568',
    border: s.getPropertyValue('--border').trim() || 'rgba(15,23,42,0.08)',
    surface: (s.getPropertyValue('--surface-strong').trim() || '#fff'),
  }
}

async function loadOverview() {
  loadingOverview.value = true
  try {
    ov.value = await getOverview()
  } finally {
    loadingOverview.value = false
  }
}

async function loadVisitors() {
  loadingVisitors.value = true
  visitorErr.value = ''
  try {
    visitors.value = await getVisitors(days.value)
  } catch {
    visitorErr.value = '加载失败'
  } finally {
    loadingVisitors.value = false
  }
}

async function loadTerminals() {
  loadingTerminals.value = true
  terminalErr.value = ''
  try {
    terminals.value = await getTerminals(days.value)
  } catch {
    terminalErr.value = '加载失败'
  } finally {
    loadingTerminals.value = false
  }
}

async function loadTop() {
  loadingTop.value = true
  topErr.value = ''
  try {
    topNotes.value = await getTopNotes(5)
  } catch {
    topErr.value = '加载失败'
  } finally {
    loadingTop.value = false
  }
}

async function changeDays(d: number) {
  days.value = d
  await Promise.all([loadVisitors(), loadTerminals()])
}

function refreshAllCharts() {
  nextTick(() => {
    visitorRef.value?.refreshTheme()
    terminalRef.value?.refreshTheme()
    topRef.value?.refreshTheme()
  })
}

// 主题切换时刷新图表配色
const themeObserver = new MutationObserver(() => refreshAllCharts())

onMounted(async () => {
  await Promise.all([loadOverview(), loadVisitors(), loadTerminals(), loadTop()])
  if (document.documentElement) {
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  }
})

onBeforeUnmount(() => themeObserver.disconnect())
</script>

<template>
  <div>
    <h1 class="page-title">分析概览</h1>

    <!-- 统计卡片 -->
    <div class="grid">
      <GlassCard v-for="c in cards" :key="c.key" padding="24px" interactive>
        <div class="stat">
          <component :is="c.icon" :size="24" class="stat-icon" />
          <div>
            <div class="stat-num tabular">
              <Loader2 v-if="loadingOverview" :size="18" class="spin" />
              <template v-else>{{ ov ? (ov as any)[c.key] : '—' }}</template>
            </div>
            <div class="stat-label">{{ c.label }}</div>
          </div>
        </div>
      </GlassCard>
    </div>

    <!-- 访客趋势 -->
    <GlassCard padding="20px" class="chart-card">
      <div class="chart-head">
        <h2 class="chart-title">访客趋势</h2>
        <div class="days-toggle" role="group" aria-label="时间范围">
          <button v-for="d in [7, 30, 90]" :key="d" :class="{ on: days === d }" @click="changeDays(d)">
            {{ d }}天
          </button>
        </div>
      </div>
      <div v-if="loadingVisitors" class="chart-loading">
        <Loader2 :size="24" class="spin" /> 加载中…
      </div>
      <div v-else-if="visitorErr" class="chart-empty">{{ visitorErr }}</div>
      <div v-else-if="!visitors.length" class="chart-empty">暂无访问数据</div>
      <BaseChart v-else ref="visitorRef" :option="visitorOption" height="300px"
        :aria-label="`近${days}天访客趋势折线图`" />
    </GlassCard>

    <!-- 终端分布 + Top 笔记 -->
    <div class="grid2">
      <GlassCard padding="20px" class="chart-card">
        <h2 class="chart-title">终端分布</h2>
        <div v-if="loadingTerminals" class="chart-loading">
          <Loader2 :size="24" class="spin" /> 加载中…
        </div>
        <div v-else-if="terminalErr" class="chart-empty">{{ terminalErr }}</div>
        <div v-else-if="!terminals.length" class="chart-empty">暂无终端数据</div>
        <BaseChart v-else ref="terminalRef" :option="terminalOption" height="280px"
          aria-label="终端分布饼图" />
      </GlassCard>

      <GlassCard padding="20px" class="chart-card">
        <h2 class="chart-title">热门笔记 Top 5</h2>
        <div v-if="loadingTop" class="chart-loading">
          <Loader2 :size="24" class="spin" /> 加载中…
        </div>
        <div v-else-if="topErr" class="chart-empty">{{ topErr }}</div>
        <div v-else-if="!topNotes.length" class="chart-empty">暂无笔记数据</div>
        <BaseChart v-else ref="topRef" :option="topOption" height="280px"
          aria-label="热门笔记浏览量条形图" />
      </GlassCard>
    </div>
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
  flex-shrink: 0;
}
.stat-num {
  font-size: var(--fs-xl);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
}
.stat-label {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

.chart-card {
  margin-bottom: var(--sp-5);
}
.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-bottom: var(--sp-3);
}
.chart-title {
  margin: 0;
  font-size: var(--fs-md);
  font-weight: 600;
}
.days-toggle {
  display: flex;
  gap: 4px;
}
.days-toggle button {
  padding: 4px var(--sp-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--fs-xs);
  cursor: pointer;
  transition: all var(--dur-fast);
}
.days-toggle button.on {
  background: var(--accent);
  color: var(--accent-on);
  border-color: var(--accent);
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-5);
}
@media (max-width: 1024px) {
  .grid2 {
    grid-template-columns: 1fr;
  }
}

.chart-loading,
.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  height: 280px;
  color: var(--text-secondary);
  font-size: var(--fs-sm);
}
.chart-loading[style*='300px'],
.chart-empty[style*='300px'] {
  height: 300px;
}

.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}
</style>
