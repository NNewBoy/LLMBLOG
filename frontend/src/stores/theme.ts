import { defineStore } from 'pinia'
import { ref } from 'vue'

type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const stored = localStorage.getItem('theme') as Theme | null
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = ref<Theme>(stored || (prefersDark ? 'dark' : 'light'))

  function apply(t: Theme) {
    document.documentElement.setAttribute('data-theme', t)
  }
  apply(theme.value)

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    apply(theme.value)
  }

  return { theme, toggle }
})
