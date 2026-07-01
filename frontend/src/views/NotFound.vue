<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="nf">
    <h1 class="code">404</h1>
    <p class="text">页面走丢了</p>
    <button class="back" @click="router.push('/')">返回首页</button>
  </div>
</template>

<style scoped>
.nf {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  color: var(--text-secondary);
}
.code {
  font-size: 96px;
  margin: 0;
  color: var(--accent);
  font-weight: 700;
}
.text {
  margin: 0;
}
.back {
  margin-top: var(--sp-2);
  height: 44px;
  padding: 0 var(--sp-5);
  border: none;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--accent-on);
  cursor: pointer;
  font-weight: 600;
}
</style>
