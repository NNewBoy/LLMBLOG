<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue'
import { listTags, createTag, updateTag, deleteTag } from '@/api'
import type { Tag } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const tipEffect = computed(() => (themeStore.theme === 'light' ? 'light' : 'dark'))
const tags = ref<Tag[]>([])
const dialog = ref(false)
const editing = ref<Tag | null>(null)
const form = reactive({ name: '', description: '', color: '' })

async function load() {
  tags.value = await listTags()
}
onMounted(load)

function openNew() {
  editing.value = null
  form.name = ''
  form.description = ''
  form.color = ''
  dialog.value = true
}
function openEdit(t: Tag) {
  editing.value = t
  form.name = t.name
  form.description = t.description || ''
  form.color = t.color || ''
  dialog.value = true
}
async function submit() {
  if (!form.name) return ElMessage.warning('请输入名称')
  if (editing.value) {
    await updateTag(editing.value.id, { ...form })
    ElMessage.success('已更新')
  } else {
    await createTag({ ...form })
    ElMessage.success('已创建')
  }
  dialog.value = false
  load()
}
async function remove(t: Tag) {
  await ElMessageBox.confirm(`确认删除标签「${t.name}」？关联关系将一并删除。`, '确认', { type: 'warning' })
  await deleteTag(t.id)
  ElMessage.success('已删除')
  load()
}
</script>

<template>
  <div>
    <div class="head">
      <h1 class="page-title">标签管理</h1>
      <button class="primary-btn" @click="openNew"><Plus :size="18" /> 新建标签</button>
    </div>
    <GlassCard padding="0">
      <el-table :data="tags" style="width: 100%">
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="120" />
        <el-table-column label="颜色" align="center" width="60">
          <template #default="{ row }">
            <span v-if="row.color" class="swatch" :style="{ background: row.color }"></span>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column prop="note_count" label="笔记数" align="center" width="70" />
        <el-table-column label="操作" align="center" width="90" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" :effect="tipEffect" placement="top">
              <Pencil :size="16" class="act-icon act-edit" @click="openEdit(row as Tag)" />
            </el-tooltip>
            <el-tooltip content="删除" :effect="tipEffect" placement="top">
              <Trash2 :size="16" class="act-icon act-del" @click="remove(row as Tag)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </GlassCard>

    <el-dialog v-model="dialog" :title="editing ? '编辑标签' : '新建标签'" width="420px">
      <el-form label-width="64px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" /></el-form-item>
        <el-form-item label="颜色"><el-color-picker v-model="form.color" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
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
.swatch {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
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
.act-del {
  color: var(--error);
}
</style>
