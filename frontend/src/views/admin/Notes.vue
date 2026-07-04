<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { listNotes, deleteNote, togglePin, getNote } from '@/api'
import type { NoteSummary } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { Plus, Pencil, Pin, PinOff, Trash2, Upload, Download } from 'lucide-vue-next'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const tipEffect = computed(() => (themeStore.theme === 'light' ? 'light' : 'dark'))
const router = useRouter()
const notes = ref<NoteSummary[]>([])
const loading = ref(true)
const importInput = ref<HTMLInputElement | null>(null)

async function load() {
  loading.value = true
  const res = await listNotes({ page_size: 50 })
  notes.value = res.items
  loading.value = false
}
onMounted(load)

async function pin(n: NoteSummary) {
  await togglePin(n.id)
  ElMessage.success(n.is_pinned ? '已取消置顶' : '已置顶')
  load()
}
async function remove(n: NoteSummary) {
  await ElMessageBox.confirm(`确认删除《${n.title}》？此操作可回收。`, '确认', { type: 'warning' })
  await deleteNote(n.id)
  ElMessage.success('已删除')
  load()
}

// 导入 Markdown 文件
function onImportClick() {
  importInput.value?.click()
}

async function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
    ElMessage.warning('请选择 .md 或 .markdown 文件')
    input.value = ''
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('Markdown 文件不能超过 10MB')
    input.value = ''
    return
  }
  const text = await file.text()
  // 用文件名（去扩展名）作为标题，通过 query 传递 markdown 内容
  const title = file.name.replace(/\.(md|markdown)$/i, '')
  router.push({ name: 'admin-note-new', query: { md_title: title, md_content: text } })
  input.value = ''
}

// 导出单个笔记为 Markdown 文件
async function exportMarkdown(n: NoteSummary) {
  try {
    const note = await getNote(n.slug || String(n.id))
    let md = note.content
    // 如果有标题，在内容前加一级标题
    if (note.title && !md.startsWith('# ')) {
      md = `# ${note.title}\n\n${md}`
    }
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.title || note.slug || note.id}.md`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('已导出')
  } catch {
    ElMessage.error('导出失败')
  }
}
</script>

<template>
  <div>
    <div class="head">
      <h1 class="page-title">笔记管理</h1>
      <div class="head-actions">
        <button class="ghost-btn" @click="onImportClick">
          <Upload :size="18" /> 导入 Markdown
        </button>
        <input ref="importInput" type="file" accept=".md,.markdown" class="hidden-input" @change="onImportFile" />
        <button class="primary-btn" @click="router.push('/admin/notes/new')">
          <Plus :size="18" /> 新建笔记
        </button>
      </div>
    </div>
    <GlassCard padding="0">
      <el-table :data="notes" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="120" />
        <el-table-column prop="author" label="作者" align="center" min-width="60" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="{ row }">
            <span class="badge" :class="row.status">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="查看" align="center" width="60" prop="view_count" />
        <el-table-column label="创建时间" align="center" width="90">
          <template #default="{ row }">{{ new Date(row.created_at).toLocaleDateString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" :effect="tipEffect" placement="top">
              <Pencil :size="16" class="act-icon act-edit"
                @click="router.push(`/admin/notes/${row.id}/edit`)" />
            </el-tooltip>
            <el-tooltip content="导出 Markdown" :effect="tipEffect" placement="top">
              <Download :size="16" class="act-icon act-export" @click="exportMarkdown(row)" />
            </el-tooltip>
            <el-tooltip :content="row.is_pinned ? '取消置顶' : '置顶'" :effect="tipEffect" placement="top">
              <component :is="row.is_pinned ? PinOff : Pin" :size="16"
                class="act-icon act-toggle" @click="pin(row)" />
            </el-tooltip>
            <el-tooltip content="删除" :effect="tipEffect" placement="top">
              <Trash2 :size="16" class="act-icon act-del" @click="remove(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </GlassCard>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-bottom: var(--sp-5);
}
.head-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.hidden-input {
  display: none;
}
.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  height: 44px;
  padding: 0 var(--sp-4);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-weight: 500;
  transition: background var(--dur-fast) var(--ease-out);
}
.ghost-btn:hover {
  background: var(--surface-hover);
}
.page-title {
  margin: 0;
  font-size: var(--fs-xl);
}
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  height: 44px;
  padding: 0 var(--sp-4);
  border: none;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--accent-on);
  cursor: pointer;
  font-weight: 600;
}
.primary-btn:hover {
  background: var(--accent-hover);
}
.badge {
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  background: var(--surface-hover);
  color: var(--accent);
}
.badge.published {
  color: var(--success);
}
.badge.draft {
  color: var(--info);
}
.badge.hidden {
  color: var(--text-secondary);
}
.act-icon {
  cursor: pointer;
  vertical-align: middle;
  transition: opacity var(--dur-fast) var(--ease-out);
}
.act-icon:not(:last-child) {
  margin-right: var(--sp-3);
}
.act-icon:hover {
  opacity: 0.7;
}
.act-edit {
  color: var(--accent);
}
.act-export {
  color: var(--info);
}
.act-toggle {
  color: var(--text-secondary);
}
.act-del {
  color: var(--error);
}
</style>
