<script setup lang="ts">
withDefaults(
  defineProps<{
    interactive?: boolean
    padding?: string
  }>(),
  { interactive: false, padding: '24px' },
)
</script>

<template>
  <div class="glass" :class="{ 'glass-interactive': interactive }" :style="{ padding }">
    <slot />
  </div>
</template>
