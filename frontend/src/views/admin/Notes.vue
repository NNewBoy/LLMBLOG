<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listNotes, deleteNote, togglePin } from '@/api'
import type { NoteSummary } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { Plus } from 'lucide-vue-next'
import { ElMessageBox, ElMessage } from 'element-plus'

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
      <h2 class="page-title">笔记管理</h2>
      <button class="primary-btn" @click="router.push('/admin/notes/new')">
        <Plus :size="18" /> 新建笔记
      </button>
    </div>
    <GlassCard padding="0">
      <el-table :data="notes" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="180" />
        <el-table-column prop="author" label="作者" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="badge" :class="row.status">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="查看" width="80" prop="view_count" />
        <el-table-column label="创建时间" width="120">
          <template #default="{ row }">{{ new Date(row.created_at).toLocaleDateString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/admin/notes/${row.id}/edit`)">编辑</el-button>
            <el-button link @click="pin(row)">{{ row.is_pinned ? '取消置顶' : '置顶' }}</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
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
</style>
