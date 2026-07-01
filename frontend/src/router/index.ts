import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
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

export default router
