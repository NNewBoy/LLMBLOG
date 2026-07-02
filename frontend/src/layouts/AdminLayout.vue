<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { ElScrollbar } from 'element-plus'
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Tags,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  Menu as MenuIcon,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'
import AppDrawer from '@/components/AppDrawer.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const drawerOpen = ref(false)
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

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
  <div class="admin-shell">
    <aside class="admin-sidebar glass">
      <RouterLink to="/admin/dashboard" class="admin-brand">
        <span class="brand-mark">L</span>
        <span>LLMBLOG 后台</span>
      </RouterLink>
      <nav aria-label="后台导航">
        <RouterLink
          v-for="m in menu"
          :key="m.to"
          :to="m.to"
          class="admin-link"
        >
          <component :is="m.icon" :size="18" />
          <span>{{ m.label }}</span>
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
          <div class="topbar-spacer" />
          <ThemeToggle />
          <button class="icon-btn logout" aria-label="退出登录" @click="logout">
            <LogOut :size="18" />
            <span class="logout-text">退出</span>
          </button>
        </header>
      </div>

      <el-scrollbar ref="scrollbarRef" class="admin-scroll">
        <main id="main-content" class="admin-content">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </main>
      </el-scrollbar>
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
}
.admin-sidebar {
  width: 240px;
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
}
.admin-brand {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-weight: 700;
  color: var(--text);
  padding: 0 var(--sp-2);
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--accent-on);
  font-size: var(--fs-sm);
}
.admin-link {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
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
  left: 240px;
  right: 0;
  top: 0;
  z-index: var(--z-navbar);
  padding: var(--sp-4) var(--sp-5);
  background: transparent;
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
  .logout-text {
    display: none;
  }
}
</style>
