<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { Sun, Moon } from 'lucide-vue-next'

const theme = useThemeStore()
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="theme.theme === 'light' ? '切换到深色主题' : '切换到浅色主题'"
    @click="theme.toggle()"
  >
    <Sun v-if="theme.theme === 'dark'" :size="20" />
    <Moon v-else :size="20" />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-pill);
  background: var(--surface);
  backdrop-filter: blur(var(--blur)) saturate(var(--saturate));
  color: var(--text);
  cursor: pointer;
  transition: background var(--dur-base) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
.theme-toggle:hover {
  background: var(--surface-hover);
  transform: rotate(15deg);
}
.theme-toggle:active {
  transform: scale(0.92);
}
</style>
