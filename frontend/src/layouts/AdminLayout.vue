<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
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

const auth = useAuthStore()
const router = useRouter()
const drawerOpen = ref(false)

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
</script>

<template>
  <a href="#main-content" class="skip-link">跳到主内容</a>
  <div class="admin-shell">
    <aside class="admin-sidebar glass" :class="{ open: drawerOpen }">
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
          @click="drawerOpen = false"
        >
          <component :is="m.icon" :size="18" />
          <span>{{ m.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <div class="admin-main">
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

      <main id="main-content" class="admin-content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="drawerOpen" class="admin-scrim" @click="drawerOpen = false" />
      </Transition>
    </Teleport>
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
  min-height: 100vh;
  min-height: 100dvh;
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
  position: sticky;
  top: 0;
  height: 100vh;
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
}
.admin-topbar {
  height: var(--navbar-h);
  border-radius: 0;
  border-top: none;
  border-left: none;
  border-right: none;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: 0 var(--sp-5);
  position: sticky;
  top: 0;
  z-index: var(--z-navbar);
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
  border: none;
  background: transparent;
}
.admin-content {
  padding: var(--sp-6);
  flex: 1;
}
.admin-scrim {
  display: none;
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-drawer);
    transform: translateX(-100%);
    transition: transform var(--dur-base) var(--ease-out);
    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
    height: 100vh;
  }
  .admin-sidebar.open {
    transform: translateX(0);
  }
  .hamburger {
    display: inline-flex;
  }
  .logout-text {
    display: none;
  }
  .admin-content {
    padding: var(--sp-4);
  }
  .admin-scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: var(--z-drawer);
    background: rgba(0, 0, 0, 0.48);
  }
}
@media (max-width: 375px) {
  .admin-content {
    padding: var(--sp-3);
  }
}
</style>
