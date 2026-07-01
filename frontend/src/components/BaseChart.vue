<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
])

const props = defineProps<{ option: echarts.EChartsCoreOption; height?: string }>()
const el = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

function getThemeColors() {
  const s = getComputedStyle(document.documentElement)
  return {
    text: s.getPropertyValue('--text').trim() || '#1a1f2e',
    textSecondary: s.getPropertyValue('--text-secondary').trim() || '#4a5568',
    border: s.getPropertyValue('--border').trim() || 'rgba(15,23,42,0.08)',
    accent: s.getPropertyValue('--accent').trim() || '#6366f1',
  }
}

function init() {
  if (!el.value) return
  chart = echarts.init(el.value)
  chart.setOption(props.option)
  resizeObserver = new ResizeObserver(() => chart?.resize())
  resizeObserver.observe(el.value)
}

function applyTheme() {
  if (!chart) return
  const c = getThemeColors()
  const base = props.option as any
  base.textStyle = { color: c.text }
  base.color = base.color || ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7']
  chart.setOption(base, true)
}

watch(
  () => props.option,
  (opt) => {
    chart?.setOption(opt, true)
  },
  { deep: true },
)

onMounted(init)
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})

defineExpose({ refreshTheme: applyTheme })
</script>

<template>
  <div ref="el" class="chart" :style="{ height: height || '300px' }" role="img" aria-label="图表" />
</template>

<style scoped>
.chart {
  width: 100%;
}
</style>
