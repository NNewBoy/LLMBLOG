import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 轻量导航进度条（无外部依赖）
let progressTimer: number | null = null
let progressEl: HTMLDivElement | null = null

function ensureProgressEl(): HTMLDivElement {
  if (!progressEl) {
    progressEl = document.createElement('div')
    progressEl.style.cssText =
      'position:fixed;top:0;left:0;height:3px;z-index:99999;' +
      'background:linear-gradient(90deg,var(--accent, #4f46e5),var(--accent-hover, #6366f1));' +
      'width:0;transition:width 300ms ease-out;pointer-events:none'
    document.body.appendChild(progressEl)
  }
  return progressEl
}

function startProgress() {
  const bar = ensureProgressEl()
  bar.style.transition = 'none'
  bar.style.width = '0'
  // force reflow
  bar.getBoundingClientRect()
  bar.style.transition = 'width 8s cubic-bezier(0.1, 0.7, 0.3, 1)'
  bar.style.width = '80%'
}

function finishProgress() {
  if (!progressEl) return
  progressEl.style.transition = 'width 200ms ease-in'
  progressEl.style.width = '100%'
  progressTimer = window.setTimeout(() => {
    if (progressEl) {
      progressEl.style.transition = 'none'
      progressEl.style.width = '0'
    }
    progressTimer = null
  }, 250)
}

const routes: RouteRecordRaw[] = [
  { path: '/entry', name: 'entry', component: () => import('@/views/front/Entry.vue') },
  {
    path: '/',
    component: () => import('@/layouts/FrontLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/front/Home.vue') },
      { path: 'tags', name: 'tags', component: () => import('@/views/front/Tags.vue') },
      { path: 'timeline', name: 'timeline', component: () => import('@/views/front/Timeline.vue') },
      { path: 'search', name: 'search', component: () => import('@/views/front/Search.vue') },
      { path: 'note/:slug', name: 'note-detail', component: () => import('@/views/front/NoteDetail.vue') },
    ],
  },
  { path: '/admin/login', name: 'admin-login', component: () => import('@/views/admin/Login.vue') },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'notes', name: 'admin-notes', component: () => import('@/views/admin/Notes.vue') },
      { path: 'notes/new', name: 'admin-note-new', component: () => import('@/views/admin/NoteEdit.vue') },
      { path: 'notes/:id/edit', name: 'admin-note-edit', component: () => import('@/views/admin/NoteEdit.vue') },
      { path: 'images', name: 'admin-images', component: () => import('@/views/admin/Images.vue') },
      { path: 'tags', name: 'admin-tags', component: () => import('@/views/admin/Tags.vue') },
      { path: 'comments', name: 'admin-comments', component: () => import('@/views/admin/Comments.vue') },
      { path: 'settings', name: 'admin-settings', component: () => import('@/views/admin/Settings.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, saved) {
    return saved || { top: 0 }
  },
})

router.beforeEach((to) => {
  startProgress()
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isAuthed) return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'admin-login') {
    const auth = useAuthStore()
    if (auth.isAuthed) return { name: 'admin-dashboard' }
  }
  return true
})

router.afterEach(() => {
  finishProgress()
})

export default router
