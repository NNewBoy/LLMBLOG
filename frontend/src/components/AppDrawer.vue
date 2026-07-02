<script setup lang="ts">
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'

interface DrawerLink {
  to: string
  label: string
  icon?: Component
}

const props = defineProps<{
  modelValue: boolean
  brandTo: string
  brandText: string
  links: DrawerLink[]
  navAriaLabel?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    direction="ltr"
    size="260px"
    :with-header="false"
    class="app-drawer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <RouterLink :to="brandTo" class="drawer-brand" @click="close">
      <span class="brand-mark">L</span>
      <span>{{ brandText }}</span>
    </RouterLink>
    <nav :aria-label="navAriaLabel || '导航'" class="drawer-nav">
      <RouterLink
        v-for="l in links"
        :key="l.to"
        :to="l.to"
        class="drawer-link"
        @click="close"
      >
        <component v-if="l.icon" :is="l.icon" :size="18" />
        <span>{{ l.label }}</span>
      </RouterLink>
    </nav>
  </el-drawer>
</template>

<style scoped>
.drawer-brand {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-weight: 700;
  color: var(--text);
  font-size: var(--fs-md);
  padding: 0 var(--sp-2);
  margin-bottom: var(--sp-4);
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--accent-on);
  font-size: var(--fs-sm);
}
.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}
.drawer-link {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: var(--fs-md);
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.drawer-link:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.drawer-link.router-link-exact-active {
  background: var(--accent-soft);
  color: var(--accent);
  position: relative;
}
.drawer-link.router-link-exact-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 3px;
  background: var(--accent);
}
</style>
