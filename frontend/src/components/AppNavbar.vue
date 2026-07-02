<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Menu as MenuIcon, Search as SearchIcon } from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'
import AppDrawer from './AppDrawer.vue'

const showDrawer = ref(false)
const showSearch = ref(false)
const keyword = ref('')
const router = useRouter()

const links = [
  { to: '/', label: '首页', exact: true },
  { to: '/tags', label: '标签' },
  { to: '/timeline', label: '时间线' },
]

function onSearch() {
  if (keyword.value.trim()) {
    router.push({ name: 'search', query: { q: keyword.value.trim() } })
    showSearch.value = false
    showDrawer.value = false
    keyword.value = ''
  }
}
</script>

<template>
  <div class="navbar-wrapper">
    <header class="navbar glass">
      <div class="navbar-inner">
        <button class="icon-btn hamburger" aria-label="打开菜单" @click="showDrawer = true">
          <MenuIcon :size="22" />
        </button>

        <RouterLink to="/" class="brand" aria-label="返回首页">
          <span class="brand-mark">L</span>
          <span class="brand-text">LLMBLOG</span>
        </RouterLink>

        <nav class="nav-links" aria-label="主导航">
          <RouterLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            class="nav-link"
            :class="{ active: l.exact ? $route.path === l.to : $route.path.startsWith(l.to) && l.to !== '/' }"
            >{{ l.label }}</RouterLink
          >
        </nav>

        <div class="nav-tools">
          <button class="icon-btn" aria-label="搜索" @click="showSearch = true">
            <SearchIcon :size="20" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  </div>

  <!-- 移动端抽屉 -->
  <AppDrawer
    v-model="showDrawer"
    brand-to="/"
    brand-text="LLMBLOG"
    :links="links"
    nav-aria-label="移动导航"
  />

  <!-- 搜索弹层 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showSearch" class="search-overlay" @click.self="showSearch = false">
        <div class="search-box glass">
          <SearchIcon :size="20" class="search-icon" />
          <input
            v-model="keyword"
            type="search"
            placeholder="搜索笔记…"
            aria-label="搜索笔记"
            autofocus
            @keyup.enter="onSearch"
          />
          <button class="icon-btn" aria-label="关闭搜索" @click="showSearch = false">Esc</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-navbar);
  padding: var(--sp-4) var(--sp-5);
  background: transparent;
}
.navbar {
  height: var(--navbar-h);
  border-radius: 16px;
}
.navbar-inner {
  margin: 0 auto;
  height: 100%;
  padding: 0 var(--sp-5);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.brand {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  color: var(--text);
  font-weight: 700;
  font-size: var(--fs-md);
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--accent-on);
}
.brand-text {
  letter-spacing: 0.5px;
}
.nav-links {
  display: flex;
  gap: var(--sp-2);
  margin-left: var(--sp-3);
}
.nav-link {
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  position: relative;
  transition: color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}
.nav-link:hover {
  color: var(--text);
  background: var(--surface-hover);
}
.nav-link.active {
  color: var(--accent);
}
.nav-link.active::after {
  content: '';
  position: absolute;
  left: var(--sp-3);
  right: var(--sp-3);
  bottom: 2px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
}
.nav-tools {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
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
.drawer-brand {
  margin-bottom: var(--sp-4);
}
.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}
.drawer-link {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: var(--fs-md);
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.drawer-link:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.drawer-link.router-link-exact-active {
  background: var(--accent-soft);
  color: var(--accent);
  position: relative;
}
.drawer-link.router-link-exact-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 3px;
  background: var(--accent);
}

.search-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
}
.search-box {
  width: min(640px, 92vw);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
}
.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text);
  font-size: var(--fs-md);
  height: 44px;
}
.search-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .navbar-wrapper {
    padding: var(--sp-3) var(--sp-4);
  }
  .hamburger {
    display: inline-flex;
  }
  .nav-links {
    display: none;
  }
  .brand-text {
    display: none;
  }
}
</style>
