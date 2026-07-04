<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { Editor } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import math from '@bytemd/plugin-math-ssr'
import mermaid from '@bytemd/plugin-mermaid'
import zhHans from 'bytemd/locales/zh_Hans.json'
import { uploadImage } from '@/api'
import { useThemeStore } from '@/stores/theme'
import { ElMessage } from 'element-plus'
import { loadHighlightTheme } from '@/utils/markdown'

import 'bytemd/dist/index.css'
import 'katex/dist/katex.css'
import 'codemirror/theme/material-darker.css'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const themeStore = useThemeStore()

const isDark = computed(() => themeStore.theme === 'dark')

const plugins = computed(() => [
  gfm(),
  highlight(),
  mediumZoom(),
  math(),
  mermaid(),
])

// CodeMirror 主题：深色用 material-darker，浅色用默认
const editorConfig = computed(() => ({
  theme: isDark.value ? 'material-darker' : 'default',
}))

function handleChange(v: string) {
  emit('update:modelValue', v)
}

async function handleUploadImages(files: File[]) {
  const results: { title: string; url: string }[] = []
  for (const file of files) {
    try {
      const res = await uploadImage(file)
      results.push({ title: res.filename, url: res.url })
    } catch (err: any) {
      ElMessage.error(err?.message || '图片上传失败')
    }
  }
  return results
}

// 初始化并跟随主题切换 highlight.js + github-markdown 主题
onMounted(() => loadHighlightTheme(themeStore.theme === 'dark' ? 'dark' : 'light'))
watch(() => themeStore.theme, (t) => loadHighlightTheme(t === 'dark' ? 'dark' : 'light'))
</script>

<template>
  <div class="bytemd-wrap" :class="{ 'bytemd-dark': isDark }">
    <Editor
      :key="themeStore.theme"
      :value="modelValue"
      :plugins="plugins"
      :locale="zhHans"
      :editor-config="editorConfig"
      :upload-images="handleUploadImages"
      @change="handleChange"
    />
  </div>
</template>

<style scoped>
.bytemd-wrap {
  border-radius: var(--radius-md);
  overflow: hidden;
}
.bytemd-wrap :deep(.bytemd) {
  height: 480px;
  border-color: var(--surface-border);
}
.bytemd-wrap :deep(.bytemd-fullscreen) {
  z-index: 9999;
}

/* 工具栏 + 容器 + 状态栏深色模式（ByteMD 无内置深色支持） */
.bytemd-dark :deep(.bytemd) {
  background: var(--bg);
  color: var(--text);
  border-color: var(--border);
}
.bytemd-dark :deep(.bytemd-toolbar) {
  background: var(--surface-hover);
  border-bottom-color: var(--border);
}
.bytemd-dark :deep(.bytemd-toolbar-icon svg) {
  color: var(--text-secondary);
}
.bytemd-dark :deep(.bytemd-toolbar-icon:hover) {
  background: var(--surface);
}
.bytemd-dark :deep(.bytemd-status) {
  border-top-color: var(--border);
  color: var(--text-secondary);
}
.bytemd-dark :deep(.bytemd-split .bytemd-preview) {
  border-left-color: var(--border);
}
</style>
