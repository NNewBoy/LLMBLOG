<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Eye, MessageCircle, Pin } from 'lucide-vue-next'
import type { NoteSummary } from '@/types'

defineProps<{ note: NoteSummary }>()
const router = useRouter()

function open(slug: string) {
  router.push({ name: 'note-detail', params: { slug } })
}
function goTag(e: MouseEvent) {
  e.stopPropagation()
  router.push({ name: 'tags' })
}
function fmt(d: string) {
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
</script>

<template>
  <article class="note-card glass glass-interactive" tabindex="0" @click="open(note.slug)" @keyup.enter="open(note.slug)">
    <div v-if="note.is_pinned" class="pin">
      <Pin :size="14" /> 置顶
    </div>
    <h3 class="title">{{ note.title }}</h3>
    <div class="meta">
      <span class="tabular">{{ fmt(note.created_at) }}</span>
      <span class="dot"><Eye :size="14" /> <span class="tabular">{{ note.view_count }}</span></span>
      <span class="dot"><MessageCircle :size="14" /> <span class="tabular">{{ note.comment_count }}</span></span>
    </div>
    <p class="summary">{{ note.summary }}</p>
    <div v-if="note.tags?.length" class="tags">
      <span v-for="t in note.tags" :key="t.id" class="tag" @click="goTag">{{ t.name }}</span>
    </div>
  </article>
</template>

<style scoped>
.note-card {
  position: relative;
  padding: var(--sp-5);
  cursor: pointer;
}
.pin {
  position: absolute;
  top: var(--sp-4);
  right: var(--sp-4);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px var(--sp-2);
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: var(--fs-xs);
  font-weight: 600;
}
.title {
  margin: 0 0 var(--sp-2);
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
}
.meta {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  color: var(--text-secondary);
  font-size: var(--fs-xs);
  margin-bottom: var(--sp-3);
}
.dot {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.summary {
  margin: 0 0 var(--sp-3);
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}
.tag {
  padding: 2px var(--sp-3);
  border-radius: var(--radius-pill);
  background: var(--surface-hover);
  color: var(--text-secondary);
  font-size: var(--fs-xs);
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.tag:hover {
  background: var(--accent-soft);
  color: var(--accent);
}
</style>
