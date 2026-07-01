<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, MessageCircle, ArrowLeft } from 'lucide-vue-next'
import { getNote } from '@/api'
import type { NoteDetail } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import Skeleton from '@/components/Skeleton.vue'

const route = useRoute()
const router = useRouter()
const note = ref<NoteDetail | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    note.value = await getNote(route.params.slug as string)
  } catch {
    note.value = null
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => route.params.slug, load)
</script>

<template>
  <div class="detail">
    <GlassCard v-if="loading" padding="32px">
      <Skeleton :lines="8" />
    </GlassCard>
    <template v-else-if="note">
      <GlassCard padding="32px" class="article">
        <button class="back" @click="router.back()">
          <ArrowLeft :size="16" /> 返回
        </button>
        <h1 class="title">{{ note.title }}</h1>
        <div class="meta">
          <span>{{ note.author }}</span>
          <span class="tabular">{{ new Date(note.created_at).toLocaleDateString('zh-CN') }}</span>
          <span><Eye :size="14" /> <span class="tabular">{{ note.view_count }}</span></span>
          <span><MessageCircle :size="14" /> <span class="tabular">{{ note.comment_count }}</span></span>
        </div>
        <div class="tags">
          <span v-for="t in note.tags" :key="t.id" class="tag">{{ t.name }}</span>
        </div>
        <div class="content">{{ note.content }}</div>
        <p class="md-hint">（M2 将接入 Markdown 渲染 / 目录 / 评论）</p>
      </GlassCard>
    </template>
    <GlassCard v-else padding="48px" class="empty">
      <p>笔记不存在或已隐藏。</p>
      <button class="back" @click="router.push('/')">返回首页</button>
    </GlassCard>
  </div>
</template>

<style scoped>
.article {
  position: relative;
}
.back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-4);
  padding: var(--sp-2);
}
.back:hover {
  color: var(--accent);
}
.title {
  margin: 0 0 var(--sp-3);
  font-size: var(--fs-xl);
  font-weight: 700;
  line-height: 1.3;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-3);
}
.meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-bottom: var(--sp-5);
}
.tag {
  padding: 2px var(--sp-3);
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: var(--fs-xs);
}
.content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.8;
  color: var(--text);
  font-size: var(--fs-base);
}
.md-hint {
  margin-top: var(--sp-6);
  color: var(--text-secondary);
  font-size: var(--fs-xs);
}
.empty {
  text-align: center;
  color: var(--text-secondary);
}
.empty .back {
  margin-top: var(--sp-3);
  justify-content: center;
}
</style>
