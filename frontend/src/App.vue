<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
onMounted(() => settings.load())
</script>

<template>
  <a href="#main-content" class="skip-link">跳到主内容</a>
  <RouterView />
</template>
