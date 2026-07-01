<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { uploadImage } from '@/api'
import { useThemeStore } from '@/stores/theme'

const props = defineProps<{ modelValue: string; mode?: 'ir' | 'wysiwyg' | 'sv' }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const el = ref<HTMLElement>()
let vd: any = null
const themeStore = useThemeStore()

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
          vd.insertValue(Object.keys(succMap).map((k) => `![${k}](${succMap[k]})`).join('\n'))
          return null
        })
      },
    },
    input: (val: string) => emit('update:modelValue', val),
  })
})

watch(
  () => props.modelValue,
  (v) => {
    if (vd && v !== vd.getValue()) vd.setValue(v)
  },
)

watch(() => themeStore.theme, (t) => {
  if (!vd) return
  const isDark = t === 'dark'
  vd.setTheme(isDark ? 'dark' : 'classic', t, isDark ? 'github-dark' : 'github')
})

onBeforeUnmount(() => {
  vd?.destroy()
  vd = null
})
</script>

<template>
  <div ref="el" class="vditor-wrap" />
</template>

<style scoped>
.vditor-wrap {
  border-radius: var(--radius-md);
  overflow: hidden;
}
:deep(.vditor) {
  border-radius: var(--radius-md);
}
</style>
