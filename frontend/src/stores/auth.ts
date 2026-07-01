import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, sha256Hex } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(sessionStorage.getItem('admin_token') || '')
  const isAuthed = computed(() => !!token.value)

  async function login(password: string) {
    const pre = await sha256Hex(password)
    const res = await apiLogin(pre)
    token.value = res.token
    sessionStorage.setItem('admin_token', res.token)
    return res
  }

  function logout() {
    token.value = ''
    sessionStorage.removeItem('admin_token')
  }

  return { token, isAuthed, login, logout }
})
