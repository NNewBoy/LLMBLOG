<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { listNotes, deleteNote, togglePin } from '@/api'
import type { NoteSummary } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { Plus, Pencil, Pin, PinOff, Trash2 } from 'lucide-vue-next'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const tipEffect = computed(() => (themeStore.theme === 'light' ? 'light' : 'dark'))
const router = useRouter()
const notes = ref<NoteSummary[]>([])
const loading = ref(true)

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
</script>

<template>
  <div>
    <div class="head">
      <h1 class="page-title">笔记管理</h1>
      <button class="primary-btn" @click="router.push('/admin/notes/new')">
        <Plus :size="18" /> 新建笔记
      </button>
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
        <el-table-column label="操作" align="center" width="120" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" :effect="tipEffect" placement="top">
              <Pencil :size="16" class="act-icon act-edit"
                @click="router.push(`/admin/notes/${row.id}/edit`)" />
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
      <EmptyState v-if="!loading && !notes.length" text="还没有笔记" />
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
.act-toggle {
  color: var(--text-secondary);
}
.act-del {
  color: var(--error);
}
</style>
