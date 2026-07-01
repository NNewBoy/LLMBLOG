import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSettings } from '@/api'
import type { SiteSettings } from '@/types'

const fallback: SiteSettings = {
  blogger_name: '博主',
  blogger_desc: '一个记录与分享的角落',
  blogger_avatar: '',
  social_links: {},
  site_favicon: '',
  site_name: '个人笔记博客',
  site_desc: '',
  site_keywords: '',
  icp_no: '',
  icp_url: '',
  police_no: '',
  police_url: '',
  police_logo: '',
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<SiteSettings>({ ...fallback })
  const loaded = ref(false)

  async function load() {
    if (loaded.value) return settings.value
    try {
      const data = await getSettings()
      settings.value = { ...fallback, ...data }
      if (data.site_name) document.title = data.site_name
    } catch {
      settings.value = { ...fallback }
    }
    loaded.value = true
    return settings.value
  }

  return { settings, loaded, load }
})
