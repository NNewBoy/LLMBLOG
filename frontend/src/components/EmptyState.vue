<script setup lang="ts">
import { NotebookPen } from 'lucide-vue-next'
withDefaults(defineProps<{ text?: string; icon?: any }>(), { text: '暂无内容' })
</script>

<template>
  <div class="empty">
    <component :is="icon || NotebookPen" :size="40" class="empty-icon" />
    <p class="empty-text">{{ text }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-7) var(--sp-4);
  color: var(--text-secondary);
}
.empty-icon {
  opacity: 0.4;
}
.empty-text {
  margin: 0;
  font-size: var(--fs-sm);
}
</style>
