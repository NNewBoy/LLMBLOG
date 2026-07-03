<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElScrollbar } from 'element-plus'
import { Dot, Shield } from 'lucide-vue-next'
import AppNavbar from '@/components/AppNavbar.vue'
import GlassCard from '@/components/GlassCard.vue'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const settings = useSettingsStore()
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
// 详情页自行渲染右侧 TOC，隐藏通用侧边栏
const showSidebar = computed(() => !route.name || route.name !== 'note-detail')

// 路由切换时重置滚动位置到顶部
watch(() => route.path, () => {
  nextTick(() => scrollbarRef.value?.setScrollTop(0))
})
</script>

<template>
  <a href="#main-content" class="skip-link">跳到主内容</a>
  <AppNavbar />
  <main id="main-content" class="layout-main">
    <el-scrollbar ref="scrollbarRef">
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
      <!-- 备案信息 -->
      <footer v-if="settings.settings.icp_no || settings.settings.police_no" class="layout-footer">
        <a v-if="settings.settings.icp_no" :href="settings.settings.icp_url || '#'" class="footer-link" target="_blank" rel="noopener">
          {{ settings.settings.icp_no }}
        </a>
        <Dot v-if="settings.settings.icp_no && settings.settings.police_no" :size="16" class="footer-sep" />
        <a v-if="settings.settings.police_no" :href="settings.settings.police_url || '#'" class="footer-link" target="_blank" rel="noopener">
          <img v-if="settings.settings.police_logo" :src="settings.settings.police_logo" alt="公安备案" class="footer-police-img" />
          <Shield v-else :size="14" class="footer-police-icon" />
          {{ settings.settings.police_no }}
        </a>
      </footer>
    </el-scrollbar>
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
  height: 100vh;
  height: 100dvh;
}
.layout-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--distance-nav-h) var(--sp-5) var(--sp-6);
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
  top: var(--distance-nav-h);
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
  .layout-container {
    padding: var(--distance-nav-h-mobile) var(--sp-4) var(--sp-5);
  }
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
.layout-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--sp-4) var(--sp-5) var(--sp-5);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}
.layout-footer a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  transition: color var(--dur-fast) var(--ease-out);
}
.layout-footer a:hover {
  color: var(--accent);
}
.footer-link {
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 1em;
}
.footer-sep {
  color: var(--text-disabled);
  flex-shrink: 0;
}
.footer-police-icon {
  flex-shrink: 0;
}
.footer-police-img {
  width: 16px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
}
</style>
