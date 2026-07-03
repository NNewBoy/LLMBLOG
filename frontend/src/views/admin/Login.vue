<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Lock, Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import GlassCard from '@/components/GlassCard.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const password = ref('')
const show = ref(false)
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!password.value) {
    error.value = '请输入密码'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await auth.login(password.value)
    const redirect = (route.query.redirect as string) || '/admin/dashboard'
    router.push(redirect)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <GlassCard padding="36px" class="login-card">
      <div class="brand">
        <span class="brand-mark">L</span>
        <h1 class="title">后台登录</h1>
      </div>
      <form @submit.prevent="submit">
        <label class="field-label" for="pwd">密码</label>
        <div class="input-wrap">
          <Lock :size="18" class="input-icon" />
          <input
            id="pwd"
            v-model="password"
            :type="show ? 'text' : 'password'"
            placeholder="请输入后台访问密码"
            autocomplete="current-password"
            :aria-invalid="!!error"
            aria-describedby="pwd-err"
          />
          <button type="button" class="toggle" :aria-label="show ? '隐藏密码' : '显示密码'" @click="show = !show">
            <EyeOff v-if="show" :size="18" /><Eye v-else :size="18" />
          </button>
        </div>
        <p v-if="error" id="pwd-err" class="error" role="alert">{{ error }}</p>
        <p v-else class="hint" />
        <button class="submit" type="submit" :disabled="loading">
          {{ loading ? '登录中…' : '登 录' }}
        </button>
      </form>
    </GlassCard>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-4);
}
.login-card {
  width: min(420px, 100%);
}
.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-6);
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--accent-on);
  font-size: var(--fs-lg);
  font-weight: 700;
}
.title {
  margin: 0;
  font-size: var(--fs-lg);
  font-weight: 600;
}
.field-label {
  display: block;
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--sp-2);
}
.input-wrap {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0 var(--sp-3);
  height: 48px;
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-md);
  background: var(--surface);
}
.input-wrap:focus-within {
  border-color: var(--accent);
}
.input-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}
.input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text);
  font-size: var(--fs-base);
  height: 100%;
}
.toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--sp-2);
}
.error {
  margin: var(--sp-2) 0;
  color: var(--error);
  font-size: var(--fs-sm);
  line-height: var(--fs-ls);
}
.hint {
  margin: var(--sp-2) 0;
  color: var(--text-secondary);
  height: var(--fs-lg);
}
.submit {
  width: 100%;
  height: 48px;
  margin-top: var(--sp-3);
  border: none;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--accent-on);
  font-size: var(--fs-base);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
.submit:hover:not(:disabled) {
  background: var(--accent-hover);
}
.submit:active:not(:disabled) {
  transform: scale(0.98);
}
.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
