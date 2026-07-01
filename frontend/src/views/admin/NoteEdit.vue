<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { getNote, createNote, updateNote, listTags } from '@/api'
import type { Tag } from '@/types'
import VditorEditor from '@/components/VditorEditor.vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Save, Cloud } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const tags = ref<Tag[]>([])
const saving = ref(false)

const form = ref({
  title: '',
  author: '博主',
  summary: '',
  content: '',
  status: 'published' as 'draft' | 'published' | 'hidden',
  is_pinned: false,
  slug: '',
  tag_ids: [] as number[],
})

// 草稿 / 脏标记
const dirty = ref(false)
const loaded = ref(false)
const lastAutoSave = ref('')
const draftKey = computed(() => `llmblog-draft-${route.params.id || 'new'}`)
let autoSaveTimer: number | null = null
const AUTO_SAVE_MS = 30000

watch(
  form,
  () => {
    if (!loaded.value) return
    dirty.value = true
    scheduleAutoSave()
  },
  { deep: true },
)

function scheduleAutoSave() {
  if (autoSaveTimer) return
  autoSaveTimer = window.setTimeout(() => {
    saveDraft()
    autoSaveTimer = null
  }, AUTO_SAVE_MS)
}

function saveDraft() {
  if (!dirty.value) return
  try {
    localStorage.setItem(
      draftKey.value,
      JSON.stringify({ ...form.value, ts: Date.now() }),
    )
    lastAutoSave.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  } catch {
    /* storage full / unavailable */
  }
}

function clearDraft() {
  localStorage.removeItem(draftKey.value)
  lastAutoSave.value = ''
}

function restoreDraft(): boolean {
  const raw = localStorage.getItem(draftKey.value)
  if (!raw) return false
  try {
    const d = JSON.parse(raw)
    const ts = d.ts || 0
    delete d.ts
    Object.assign(form.value, d)
    ElMessage.info(`已恢复未保存的草稿（${new Date(ts).toLocaleTimeString('zh-CN', { hour12: false })}）`)
    return true
  } catch {
    return false
  }
}

onMounted(async () => {
  tags.value = await listTags()
  if (isEdit.value) {
    const n = await getNote(route.params.id as string)
    form.value = {
      title: n.title,
      author: n.author,
      summary: n.summary,
      content: n.content,
      status: n.status,
      is_pinned: n.is_pinned,
      slug: n.slug,
      tag_ids: n.tags.map((t) => t.id),
    }
    await nextTick()
    loaded.value = true
  } else {
    const restored = restoreDraft()
    await nextTick()
    loaded.value = true
    if (restored) dirty.value = true
  }
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
})

onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  }
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
    e.preventDefault()
    save()
  }
}

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (dirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onBeforeRouteLeave((_to, _from, next) => {
  if (dirty.value && !window.confirm('有未保存的修改，确定离开？')) {
    return next(false)
  }
  next()
})

async function save() {
  if (!form.value.title) {
    ElMessage.warning('请输入标题')
    return
  }
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await updateNote(Number(route.params.id), form.value)
      dirty.value = false
      clearDraft()
      ElMessage.success('已保存')
    } else {
      await createNote(form.value)
      clearDraft()
      ElMessage.success('已创建')
      router.push('/admin/notes')
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <button class="back" @click="router.push('/admin/notes')">
      <ArrowLeft :size="16" /> 返回列表
    </button>
    <div class="head-row">
      <h1 class="page-title">{{ isEdit ? '编辑笔记' : '新建笔记' }}</h1>
      <span v-if="lastAutoSave" class="autosave-hint">
        <Cloud :size="14" /> 草稿已存 {{ lastAutoSave }}
      </span>
    </div>

    <div class="form-row">
      <el-input v-model="form.title" placeholder="标题" size="large" />
    </div>
    <div class="form-row grid2">
      <el-input v-model="form.author" placeholder="作者" />
      <el-input v-model="form.slug" placeholder="Slug（留空用 ID）" />
    </div>
    <div class="form-row grid2">
      <el-select v-model="form.tag_ids" multiple placeholder="标签" style="width: 100%">
        <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
      </el-select>
      <el-select v-model="form.status" style="width: 100%">
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
        <el-option label="隐藏" value="hidden" />
      </el-select>
    </div>
    <div class="form-row">
      <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="摘要（留空自动生成）" />
    </div>
    <div class="form-row">
      <el-checkbox v-model="form.is_pinned">置顶</el-checkbox>
    </div>
    <div class="form-row">
      <VditorEditor v-model="form.content" />
    </div>
    <div class="actions">
      <span class="hint">Ctrl/⌘ + S 快速保存</span>
      <button class="primary-btn" :disabled="saving" @click="save">
        <Save v-if="!saving" :size="16" /> {{ saving ? '保存中…' : '保存' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-3);
}
.back:hover {
  color: var(--accent);
}
.head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  margin-bottom: var(--sp-5);
  flex-wrap: wrap;
}
.page-title {
  margin: 0;
  font-size: var(--fs-xl);
}
.autosave-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}
.form-row {
  margin-bottom: var(--sp-4);
}
.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-4);
}
@media (max-width: 768px) {
  .grid2 {
    grid-template-columns: 1fr;
  }
}
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: var(--sp-5);
  gap: var(--sp-3);
}
.actions .hint {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 var(--sp-6);
  border: none;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--accent-on);
  cursor: pointer;
  font-weight: 600;
}
.primary-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
