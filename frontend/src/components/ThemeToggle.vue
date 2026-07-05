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
    <Sun v-if="theme.theme === 'dark'" class="theme-icon" :size="18" />
    <Moon v-else class="theme-icon" :size="18" />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: var(--fs-sm);
  transition: background var(--dur-base) var(--ease-out);
}
.theme-toggle:hover {
  color: var(--accent);
  background: var(--accent-soft);
  border-color: var(--accent);
}
.theme-icon {
  transition: transform 0.3s ease;
}
.theme-toggle:hover .theme-icon {
  transform: rotate(30deg);
}
</style>
