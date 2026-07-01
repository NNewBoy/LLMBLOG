<script setup lang="ts">
withDefaults(defineProps<{ lines?: number; height?: string }>(), { lines: 3, height: '16px' })
</script>

<template>
  <div class="skeleton-wrap">
    <div
      v-for="i in lines"
      :key="i"
      class="skeleton-line"
      :style="{ height, width: i === lines ? '60%' : '100%' }"
    />
  </div>
</template>

<style scoped>
.skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.skeleton-line {
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--border) 0%,
    var(--surface-hover) 50%,
    var(--border) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton-line { animation: none; }
}
</style>
