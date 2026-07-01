<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNote, createNote, updateNote, listTags } from '@/api'
import type { Tag } from '@/types'
import VditorEditor from '@/components/VditorEditor.vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from 'lucide-vue-next'

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
  }
})

async function save() {
  if (!form.value.title) {
    ElMessage.warning('请输入标题')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await updateNote(Number(route.params.id), form.value)
      ElMessage.success('已保存')
    } else {
      await createNote(form.value)
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
    <h2 class="page-title">{{ isEdit ? '编辑笔记' : '新建笔记' }}</h2>

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
      <button class="primary-btn" :disabled="saving" @click="save">
        {{ saving ? '保存中…' : '保存' }}
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
.page-title {
  margin: 0 0 var(--sp-5);
  font-size: var(--fs-xl);
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
  margin-top: var(--sp-5);
}
.primary-btn {
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
}
</style>
