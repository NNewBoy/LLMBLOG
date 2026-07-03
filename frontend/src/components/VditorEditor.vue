<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { uploadImage } from '@/api'
import { useThemeStore } from '@/stores/theme'

const props = defineProps<{ modelValue: string; mode?: 'ir' | 'wysiwyg' | 'sv' }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const el = ref<HTMLElement>()
let vd: any = null
const themeStore = useThemeStore()
const loading = ref(true)

onMounted(async () => {
  const Vditor = (await import('vditor')).default
  await import('vditor/dist/index.css')
  vd = new Vditor(el.value!, {
    value: props.modelValue,
    mode: props.mode || 'ir',
    height: 480,
    toolbar: [
      'headings', 'bold', 'italic', 'strike', '|',
      'quote', 'line', 'code', 'inline-code', 'link', 'list', 'ordered-list', 'check', '|',
      'table', 'record', 'emoji', 'info', 'sub', 'sup', 'br', '|',
      'undo', 'redo', '|', 'edit-mode', 'preview', 'outline', 'fullscreen',
    ],
    cache: { enable: false },
    cdn: '/vditor',
    theme: themeStore.theme === 'dark' ? 'dark' : 'classic',
    preview: {
      theme: { current: themeStore.theme },
      hljs: { lineNumber: true, style: themeStore.theme === 'dark' ? 'github-dark' : 'github' },
    },
    upload: {
      url: '/api/v1/images/upload',
      fieldName: 'file',
      accept: 'image/*',
      handler(files: File[]): Promise<null> {
        return Promise.all(files.map((f) => uploadImage(f))).then((res) => {
          const succMap: Record<string, string> = {}
          res.forEach((r) => (succMap[r.filename] = r.url))
          vd?.vditor?.insertValue(Object.keys(succMap).map((k) => `![${k}](${succMap[k]})`).join('\n'))
          return null
        })
      },
    },
    input: (val: string) => emit('update:modelValue', val),
    after: () => { loading.value = false },
  })
})

watch(
  () => props.modelValue,
  (v) => {
    if (!loading.value && v !== vd?.getValue()) vd?.setValue(v)
  },
)

watch(() => themeStore.theme, (t) => {
  if (loading.value) return
  const isDark = t === 'dark'
  vd.setTheme(isDark ? 'dark' : 'classic', t, isDark ? 'github-dark' : 'github')
})

onBeforeUnmount(() => {
  vd?.destroy()
  vd = null
})
</script>

<template>
  <div class="vditor-wrap">
    <div v-if="loading" class="vditor-loading">
      <Loader2 :size="20" class="spin" /> 编辑器加载中…
    </div>
    <div ref="el" />
  </div>
</template>

<style scoped>
.vditor-wrap {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  min-height: 480px;
}
.vditor-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  height: 480px;
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-md);
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
:deep(.vditor) {
  border-radius: var(--radius-md);
}
</style>
