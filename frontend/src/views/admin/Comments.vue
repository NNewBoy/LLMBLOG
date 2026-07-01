<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listAllComments, toggleCommentHide, deleteComment } from '@/api'
import GlassCard from '@/components/GlassCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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
    <h2 class="page-title">评论管理</h2>
    <GlassCard padding="0">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="note_title" label="笔记" min-width="160" />
        <el-table-column label="昵称" width="120">
          <template #default="{ row }">
            <span :class="{ author: row.is_author }">{{ row.nickname }}</span>
            <span v-if="row.is_author" class="badge">博主</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="terminal" label="终端" width="140" />
        <el-table-column prop="like_count" label="赞" width="60" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <span class="badge" :class="row.status">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="140">
          <template #default="{ row }">{{ new Date(row.created_at).toLocaleString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link @click="toggleHide(row)">{{ row.status === 'hidden' ? '显示' : '隐藏' }}</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
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
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  background: var(--accent-soft);
  color: var(--accent);
  margin-left: 4px;
}
.badge.hidden {
  background: var(--surface-hover);
  color: var(--text-secondary);
}
.badge.normal {
  color: var(--success);
}
</style>
