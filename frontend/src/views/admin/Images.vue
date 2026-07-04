<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listImages, deleteImage, uploadImage } from '@/api'
import type { ImageItem } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { Upload, Trash2, Copy } from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'

const images = ref<ImageItem[]>([])
const loading = ref(true)
const fileInput = ref<HTMLInputElement>()

async function load() {
  loading.value = true
  const res = await listImages(1, 100)
  images.value = res.items
  loading.value = false
}
onMounted(load)

async function onPick(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const f of Array.from(files)) {
    try {
      await uploadImage(f)
    } catch(err: any) {
      /* handled by interceptor */
      ElMessage.error(f.name + ' ' + err.message)
    }
  }
  ElMessage.success('上传完成')
  ;(e.target as HTMLInputElement).value = ''
  load()
}

async function remove(img: ImageItem) {
  await ElMessageBox.confirm(`确认删除图片 ${img.original_name}？`, '确认', { type: 'warning' })
  await deleteImage(img.id)
  ElMessage.success('已删除')
  load()
}
async function copyUrl(img: ImageItem) {
  await navigator.clipboard.writeText(location.origin + img.url)
  ElMessage.success('已复制地址')
}
</script>

<template>
  <div>
    <div class="head">
      <h1 class="page-title">图片管理</h1>
      <button class="primary-btn" @click="fileInput?.click()">
        <Upload :size="18" /> 上传
      </button>
      <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onPick" />
    </div>
    <GlassCard padding="20px">
      <div v-if="images.length" class="grid">
        <div v-for="img in images" :key="img.id" class="cell">
          <img :src="img.thumb_url || img.url" :alt="img.original_name" loading="lazy" />
          <div class="info">
            <span class="name">{{ img.original_name }}</span>
            <div class="ops">
              <button class="op" aria-label="复制地址" @click="copyUrl(img)"><Copy :size="16" /></button>
              <button class="op danger" aria-label="删除" @click="remove(img)"><Trash2 :size="16" /></button>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else-if="!loading" text="还没有图片" />
    </GlassCard>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-bottom: var(--sp-5);
}
.page-title {
  margin: 0 auto 0 0;
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--sp-4);
}
.cell {
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface-hover);
}
.cell img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
.info {
  padding: var(--sp-2);
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
.name {
  flex: 1;
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.op {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
}
.op:hover {
  background: var(--surface);
  color: var(--text);
}
.op.danger:hover {
  color: var(--error);
}
</style>
