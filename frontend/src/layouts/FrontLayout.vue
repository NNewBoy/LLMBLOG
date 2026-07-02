<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import GlassCard from '@/components/GlassCard.vue'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const settings = useSettingsStore()
// 详情页自行渲染右侧 TOC，隐藏通用侧边栏
const showSidebar = computed(() => !route.name || route.name !== 'note-detail')
</script>

<template>
  <a href="#main-content" class="skip-link">跳到主内容</a>
  <AppNavbar />
  <main id="main-content" class="layout-main">
    <div class="layout-container" :class="{ 'has-sidebar': showSidebar }">
      <div class="layout-content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
      <aside v-if="showSidebar" class="layout-sidebar" aria-label="侧边栏">
        <GlassCard padding="20px" class="profile-card">
          <div class="profile">
            <img
              v-if="settings.settings.blogger_avatar"
              :src="settings.settings.blogger_avatar"
              alt="博主头像"
              class="avatar"
            />
            <div v-else class="avatar avatar-placeholder">
              {{ (settings.settings.blogger_name || 'B').slice(0, 1) }}
            </div>
            <h2 class="name">{{ settings.settings.blogger_name }}</h2>
            <p class="desc">{{ settings.settings.blogger_desc }}</p>
          </div>
        </GlassCard>
        <GlassCard padding="20px">
          <h2 class="widget-title">关于</h2>
          <p class="widget-text">
            欢迎来到 {{ settings.settings.site_name }}。这里记录学习与思考。
          </p>
        </GlassCard>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.skip-link {
  position: fixed;
  top: -100px;
  left: var(--sp-3);
  z-index: var(--z-toast);
  padding: var(--sp-2) var(--sp-4);
  background: var(--accent);
  color: var(--accent-on);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--fs-sm);
  transition: top var(--dur-fast) var(--ease-out);
}
.skip-link:focus {
  top: var(--sp-3);
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.layout-main {
  padding-top: var(--navbar-h);
  min-height: 100vh;
  min-height: 100dvh;
}
.layout-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--sp-6) var(--sp-4);
  display: grid;
  gap: var(--sp-6);
}
.has-sidebar {
  grid-template-columns: 1fr 280px;
}
.layout-content {
  min-width: 0;
}
.layout-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  position: sticky;
  top: calc(var(--navbar-h) + var(--sp-5));
  align-self: start;
  max-height: calc(100vh - var(--navbar-h) - var(--sp-8));
  overflow: auto;
}
.layout-sidebar .glass {
  box-shadow: none;
}
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--sp-2);
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-pill);
  object-fit: cover;
}
.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--accent-on);
  font-size: var(--fs-lg);
  font-weight: 700;
}
.name {
  margin: var(--sp-1) 0 0;
  font-size: var(--fs-md);
  font-weight: 600;
}
.desc {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--fs-sm);
}
.widget-title {
  margin: 0 0 var(--sp-2);
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.widget-text {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}
@media (max-width: 1024px) {
  .has-sidebar {
    grid-template-columns: 1fr;
  }
  .layout-sidebar {
    position: static;
    max-height: none;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .layout-sidebar > * {
    flex: 1 1 240px;
  }
}
@media (max-width: 768px) {
  .layout-sidebar {
    display: none;
  }
}
</style>
