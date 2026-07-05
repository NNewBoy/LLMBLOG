<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { ElScrollbar } from 'element-plus'
import 'element-plus/es/components/scrollbar/style/css'
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Tags,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  Menu as MenuIcon,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'
import AppDrawer from '@/components/AppDrawer.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const drawerOpen = ref(false)
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

// 侧边栏折叠状态（仅桌面端），记忆用户偏好
const SIDEBAR_KEY = 'llmblog-admin-sidebar-collapsed'
const collapsed = ref(localStorage.getItem(SIDEBAR_KEY) === '1')
function toggleSidebar() {
  collapsed.value = !collapsed.value
  localStorage.setItem(SIDEBAR_KEY, collapsed.value ? '1' : '0')
  // 侧边栏 CSS transition 结束后通知图表 resize（220ms + 余量）
  setTimeout(() => window.dispatchEvent(new Event('resize')), 250)
}

const menu = [
  { to: '/admin/dashboard', label: '分析概览', icon: LayoutDashboard },
  { to: '/admin/notes', label: '笔记管理', icon: FileText },
  { to: '/admin/images', label: '图片管理', icon: ImageIcon },
  { to: '/admin/tags', label: '标签管理', icon: Tags },
  { to: '/admin/comments', label: '评论管理', icon: MessageSquare },
  { to: '/admin/settings', label: '系统设置', icon: SettingsIcon },
]

function logout() {
  auth.logout()
  router.push('/admin/login')
}

// 路由切换时重置滚动位置到顶部
watch(() => route.path, () => {
  nextTick(() => scrollbarRef.value?.setScrollTop(0))
})
</script>

<template>
  <a href="#main-content" class="skip-link">跳到主内容</a>
  <div class="admin-shell" :class="{ 'sidebar-collapsed': collapsed }">
    <aside id="admin-sidebar" class="admin-sidebar glass">
      <RouterLink to="/admin/dashboard" class="admin-brand" aria-label="LLMBLOG 后台首页">
        <div class="brand-icon-border">
          <span class="brand-mark">L</span>
        </div>
        <span class="brand-text">LLMBLOG 后台</span>
      </RouterLink>
      <nav aria-label="后台导航">
        <RouterLink
          v-for="m in menu"
          :key="m.to"
          :to="m.to"
          class="admin-link"
          :aria-label="collapsed ? m.label : undefined"
          :title="collapsed ? m.label : undefined"
        >
          <div class="icon-border">
            <component :is="m.icon" :size="18" />
          </div>
          <span class="admin-link-label">{{ m.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- 移动端抽屉侧栏 -->
    <AppDrawer
      v-model="drawerOpen"
      brand-to="/admin/dashboard"
      brand-text="LLMBLOG 后台"
      :links="menu"
      nav-aria-label="后台导航"
    />

    <div class="admin-main">
      <div class="admin-topbar-wrapper">
        <header class="admin-topbar glass">
          <button class="icon-btn hamburger" aria-label="打开菜单" @click="drawerOpen = true">
            <MenuIcon :size="22" />
          </button>
          <button
            class="icon-btn sidebar-toggle"
            :aria-expanded="!collapsed"
            aria-controls="admin-sidebar"
            :aria-label="collapsed ? '展开侧边栏' : '折叠侧边栏'"
            @click="toggleSidebar"
          >
            <component :is="collapsed ? ChevronsRight : ChevronsLeft" :size="20" />
          </button>
          <div class="topbar-spacer" />
          <ThemeToggle />
          <button class="icon-btn logout" aria-label="退出登录" @click="logout">
            <LogOut :size="18" />
            <span class="logout-text">退出</span>
          </button>
        </header>
      </div>

      <ElScrollbar ref="scrollbarRef" class="admin-scroll">
        <main id="main-content" class="admin-content">
          <RouterView v-slot="{ Component }">
            <component :is="Component" />
          </RouterView>
        </main>
      </ElScrollbar>
    </div>
  </div>
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
.admin-shell {
  display: flex;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  --sidebar-w: 240px;
}
.admin-shell.sidebar-collapsed {
  --sidebar-w: 72px;
}
.admin-sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  border-radius: 0;
  border-top: none;
  border-bottom: none;
  border-left: none;
  padding: var(--sp-5) var(--sp-3);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  overflow-y: auto;
  transition: width var(--dur-base) var(--ease-out);
}
.admin-brand {
  display: flex;
  align-items: center;
  height: 28px;
  line-height: 28px;
  font-size: var(--fs-md);
  font-weight: 700;
  color: var(--text);
  padding: 0 var(--sp-2);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.brand-icon-border {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--accent-on);
  font-size: var(--fs-sm);
}
.brand-text {
  padding-left: var(--sp-3);
}
.admin-link {
  display: flex;
  align-items: center;
  height: calc(var(--fs-md) + var(--sp-4) * 2);
  line-height: var(--fs-md);
  padding: var(--sp-4) var(--sp-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--fs-md);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.admin-link:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.admin-link.router-link-exact-active {
  background: var(--accent-soft);
  color: var(--accent);
  position: relative;
}
.admin-link.router-link-exact-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 3px;
  background: var(--accent);
}
.admin-link-label {
  padding-left: var(--sp-3);
}
.icon-border {
  width: var(--fs-md);
  height: var(--fs-md);
}
.admin-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.admin-topbar-wrapper {
  position: fixed;
  left: var(--sidebar-w);
  right: 0;
  top: 0;
  z-index: var(--z-navbar);
  padding: var(--sp-4) var(--sp-5);
  background: transparent;
  transition: left var(--dur-base) var(--ease-out);
}
.admin-topbar {
  height: var(--navbar-h);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: 0 var(--sp-5);
}
.topbar-spacer {
  flex: 1;
}
.icon-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: 44px;
  padding: 0 var(--sp-3);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-size: var(--fs-sm);
  transition: background var(--dur-fast) var(--ease-out);
}
.icon-btn:hover {
  background: var(--surface-hover);
}
.hamburger {
  display: none;
}
.sidebar-toggle {
  display: inline-flex;
}
/* 折叠态：仅显示图标，隐藏文字并居中 */
.admin-shell.sidebar-collapsed .admin-brand {
  justify-content: flex-start;
}
.admin-shell.sidebar-collapsed .brand-text {
  display: none;
}
.admin-shell.sidebar-collapsed .admin-link {
  justify-content: flex-start;
}
.admin-shell.sidebar-collapsed .admin-link-label {
  display: none;
}
.admin-scroll {
  flex: 1;
  min-height: 0;
}
.admin-content {
  padding: var(--distance-nav-h) var(--sp-5) var(--sp-6);
}

@media (max-width: 768px) {
  .admin-topbar-wrapper {
    left: 0;
    padding: var(--sp-3) var(--sp-4);
  }
  .admin-content {
    padding: var(--distance-nav-h-mobile) var(--sp-4) var(--sp-5);
  }
  .admin-sidebar {
    display: none;
  }
  .hamburger {
    display: inline-flex;
  }
  .sidebar-toggle {
    display: none;
  }
  .logout-text {
    display: none;
  }
}
</style>
