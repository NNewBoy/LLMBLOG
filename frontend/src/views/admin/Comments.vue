<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { listAllComments, toggleCommentHide, deleteComment } from '@/api'
import GlassCard from '@/components/GlassCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { Eye, EyeOff, Trash2 } from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const tipEffect = computed(() => (themeStore.theme === 'light' ? 'light' : 'dark'))
const list = ref<any[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await listAllComments({ page: 1, page_size: 50 })
    list.value = res.items
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function toggleHide(c: any) {
  await toggleCommentHide(c.id)
  ElMessage.success('已更新')
  load()
}
async function remove(c: any) {
  await ElMessageBox.confirm('确认删除该评论？', '确认', { type: 'warning' })
  await deleteComment(c.id)
  ElMessage.success('已删除')
  load()
}
</script>

<template>
  <div>
    <h1 class="page-title">评论管理</h1>
    <GlassCard padding="0">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="note_title" label="笔记" width="120" />
        <el-table-column label="昵称" width="120">
          <template #default="{ row }">
            <span :class="{ author: row.is_author }">{{ row.nickname }}</span>
            <span v-if="row.is_author" class="badge">博主</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="120" show-overflow-tooltip />
        <el-table-column prop="terminal" label="终端" align="center" width="100" />
        <el-table-column prop="like_count" label="赞" align="center" width="50" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="{ row }">
            <span class="badge" :class="row.status">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间" align="center" width="140">
          <template #default="{ row }">{{ new Date(row.created_at).toLocaleString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="90" fixed="right">
          <template #default="{ row }">
            <el-tooltip :content="row.status === 'hidden' ? '显示' : '隐藏'" :effect="tipEffect" placement="top">
              <component :is="row.status === 'hidden' ? Eye : EyeOff" :size="16"
                class="act-icon act-toggle" @click="toggleHide(row)" />
            </el-tooltip>
            <el-tooltip content="删除" :effect="tipEffect" placement="top">
              <Trash2 :size="16" class="act-icon act-del" @click="remove(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <EmptyState v-if="!loading && !list.length" text="还没有评论" />
    </GlassCard>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 var(--sp-5);
  font-size: var(--fs-xl);
}
.author {
  color: var(--accent);
  font-weight: 600;
}
.badge {
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  background: var(--surface-hover);
  color: var(--accent);
}
.badge.hidden {
  background: var(--surface-hover);
  color: var(--text-secondary);
}
.badge.normal {
  color: var(--success);
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
.act-toggle {
  color: var(--text-secondary);
}
.act-del {
  color: var(--error);
}
</style>
