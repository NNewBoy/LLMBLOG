<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { MessageCircle, Heart, Reply, Loader2 } from 'lucide-vue-next'
import { listComments, createComment, likeComment } from '@/api'
import type { Comment } from '@/types'
import GlassCard from '@/components/GlassCard.vue'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

const props = defineProps<{ noteId: number }>()

const comments = ref<Comment[]>([])
const total = ref(0)
const page = ref(1)
const page_size = ref(10)
const sort = ref<'latest' | 'hot'>('latest')
const loading = ref(false)
const submitting = ref(false)
const liked = ref<Set<number>>(new Set())

const composer = ref({ nickname: '', content: '', website: '' })
const replyTarget = ref<Comment | null>(null)
const replyForm = ref({ nickname: '', content: '', website: '' })

const hasMore = computed(() => comments.value.length < total.value)

async function load(reset = false) {
  if (reset) {
    page.value = 1
    comments.value = []
  }
  loading.value = true
  try {
    const res = await listComments(props.noteId, page.value, sort.value)
    if (reset) {
      comments.value = res.items
    } else {
      comments.value.push(...res.items)
    }
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  page.value += 1
  await load(false)
}

function switchSort(s: 'latest' | 'hot') {
  if (s === sort.value) return
  sort.value = s
  load(true)
}

async function submit() {
  if (!composer.value.content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  submitting.value = true
  try {
    const c = await createComment(props.noteId, {
      nickname: composer.value.nickname,
      content: composer.value.content,
      website: composer.value.website,
    })
    if (c && c.id) {
      comments.value.unshift(c)
      total.value += 1
      composer.value.content = ''
      ElMessage.success('评论成功')
    }
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || ''
    ElMessage.error(msg || '提交失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

async function submitReply(parent: Comment) {
  if (!replyForm.value.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  submitting.value = true
  try {
    const c = await createComment(props.noteId, {
      nickname: replyForm.value.nickname,
      content: replyForm.value.content,
      parent_id: parent.id,
      website: replyForm.value.website,
    })
    if (c && c.id) {
      if (!parent.replies) parent.replies = []
      parent.replies.push(c)
      replyForm.value.content = ''
      replyTarget.value = null
      ElMessage.success('回复成功')
    }
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || ''
    ElMessage.error(msg || '回复失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

async function like(c: Comment) {
  if (liked.value.has(c.id)) return
  liked.value.add(c.id)
  try {
    const res = await likeComment(c.id)
    c.like_count = res.like_count
  } catch {
    liked.value.delete(c.id)
  }
}

function startReply(c: Comment) {
  replyTarget.value = c
  replyForm.value.content = ''
}

function cancelReply() {
  replyTarget.value = null
}

function fmt(s: string) {
  return new Date(s).toLocaleString('zh-CN', { hour12: false })
}

onMounted(() => load(true))
</script>

<template>
  <GlassCard padding="24px" class="comments">
    <div class="head">
      <h2 class="title">
        <MessageCircle :size="18" /> 评论 <span class="count tabular">{{ total }}</span>
      </h2>
      <div class="sort">
        <button :class="{ on: sort === 'latest' }" @click="switchSort('latest')">最新</button>
        <button :class="{ on: sort === 'hot' }" @click="switchSort('hot')">最热</button>
      </div>
    </div>

    <!-- 评论提交 -->
    <div class="composer">
      <input v-model="composer.nickname" class="input" placeholder="昵称（可选，留空匿名）" maxlength="32" />
      <input v-model="composer.website" class="input hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <textarea v-model="composer.content" class="textarea" rows="3" placeholder="写下你的评论…" maxlength="500" />
      <div class="composer-foot">
        <span class="hint">友善评论，请勿灌水</span>
        <button class="send-btn" :disabled="submitting" @click="submit">
          <Loader2 v-if="submitting" :size="14" class="spin" /> 发表评论
        </button>
      </div>
    </div>

    <!-- 评论列表 -->
    <Skeleton v-if="loading && !comments.length" :lines="4" />
    <template v-else-if="comments.length">
      <div class="list">
        <div v-for="c in comments" :key="c.id" class="item">
          <div class="avatar" :class="{ author: c.is_author }">
            {{ (c.nickname || '匿').slice(0, 1) }}
          </div>
          <div class="body">
            <div class="row">
              <span class="name" :class="{ author: c.is_author }">
                {{ c.nickname || '匿名访客' }}
                <span v-if="c.is_author" class="badge">博主</span>
              </span>
              <span class="time tabular">{{ fmt(c.created_at) }}</span>
            </div>
            <p class="text">{{ c.content }}</p>
            <div class="actions">
              <button class="act" :class="{ liked: liked.has(c.id) }" @click="like(c)">
                <Heart :size="14" /> <span class="tabular">{{ c.like_count }}</span>
              </button>
              <button class="act" @click="startReply(c)">
                <Reply :size="14" /> 回复
              </button>
              <span v-if="c.terminal" class="terminal">{{ c.terminal }}</span>
            </div>

            <!-- 回复输入 -->
            <div v-if="replyTarget && replyTarget.id === c.id" class="reply-box">
              <input v-model="replyForm.nickname" class="input" placeholder="昵称（可选）" maxlength="32" />
              <input v-model="replyForm.website" class="input hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
              <textarea v-model="replyForm.content" class="textarea" rows="2" :placeholder="`回复 @${c.nickname || '匿名访客'}…`" maxlength="500" />
              <div class="reply-foot">
                <button class="ghost-btn" @click="cancelReply">取消</button>
                <button class="send-btn sm" :disabled="submitting" @click="submitReply(c)">回复</button>
              </div>
            </div>

            <!-- 二级回复 -->
            <div v-if="c.replies && c.replies.length" class="replies">
              <div v-for="r in c.replies" :key="r.id" class="item sub">
                <div class="avatar sm" :class="{ author: r.is_author }">
                  {{ (r.nickname || '匿').slice(0, 1) }}
                </div>
                <div class="body">
                  <div class="row">
                    <span class="name" :class="{ author: r.is_author }">
                      {{ r.nickname || '匿名访客' }}
                      <span v-if="r.is_author" class="badge">博主</span>
                    </span>
                    <span class="time tabular">{{ fmt(r.created_at) }}</span>
                  </div>
                  <p class="text">{{ r.content }}</p>
                  <div class="actions">
                    <button class="act" :class="{ liked: liked.has(r.id) }" @click="like(r)">
                      <Heart :size="14" /> <span class="tabular">{{ r.like_count }}</span>
                    </button>
                    <span v-if="r.terminal" class="terminal">{{ r.terminal }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="more">
        <button class="ghost-btn" :disabled="loading" @click="loadMore">
          {{ loading ? '加载中…' : '加载更多' }}
        </button>
      </div>
    </template>
    <EmptyState v-else text="还没有评论，快来抢沙发" />
  </GlassCard>
</template>

<style scoped>
.comments {
  margin-top: var(--sp-5);
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-4);
}
.title {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin: 0;
  font-size: var(--fs-md);
  font-weight: 600;
}
.count {
  color: var(--text-secondary);
  font-size: var(--fs-sm);
}
.sort {
  display: flex;
  gap: var(--sp-1);
}
.sort button {
  padding: 4px var(--sp-3);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  border-radius: var(--radius-pill);
  cursor: pointer;
}
.sort button.on {
  background: var(--accent-soft);
  color: var(--accent);
}

.composer {
  margin-bottom: var(--sp-5);
}
.input {
  width: 100%;
  height: 40px;
  padding: 0 var(--sp-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-strong);
  color: var(--text);
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-2);
}
.input:focus {
  outline: none;
  border-color: var(--accent);
}
.textarea {
  width: 100%;
  padding: var(--sp-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-strong);
  color: var(--text);
  font-size: var(--fs-sm);
  font-family: inherit;
  resize: vertical;
  line-height: 1.6;
}
.textarea:focus {
  outline: none;
  border-color: var(--accent);
}
.hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.composer-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--sp-2);
}
.hint {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}
.send-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 var(--sp-5);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--accent-on);
  font-size: var(--fs-sm);
  font-weight: 600;
  cursor: pointer;
}
.send-btn.sm {
  height: 32px;
  padding: 0 var(--sp-4);
}
.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.send-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}
.item {
  display: flex;
  gap: var(--sp-3);
}
.item.sub {
  gap: var(--sp-2);
  padding-top: var(--sp-3);
}
.avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-md);
  font-weight: 600;
}
.avatar.sm {
  width: 32px;
  height: 32px;
  font-size: var(--fs-sm);
}
.avatar.author {
  background: var(--accent);
  color: var(--accent-on);
}
.body {
  flex: 1;
  min-width: 0;
}
.row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-bottom: 4px;
}
.name {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--text);
}
.name.author {
  color: var(--accent);
}
.badge {
  display: inline-block;
  margin-left: 4px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 600;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: var(--accent-on);
  line-height: 16px;
}
.time {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}
.text {
  margin: 0 0 var(--sp-2);
  font-size: var(--fs-sm);
  line-height: 1.7;
  color: var(--text);
  word-break: break-word;
}
.actions {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.act {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--fs-xs);
  cursor: pointer;
  padding: 2px 0;
}
.act:hover {
  color: var(--accent);
}
.act.liked {
  color: var(--error);
}
.terminal {
  font-size: var(--fs-xs);
  color: var(--text-disabled);
  margin-left: auto;
}

.reply-box {
  margin-top: var(--sp-3);
  padding: var(--sp-3);
  background: var(--surface-hover);
  border-radius: var(--radius-sm);
}
.reply-box .input {
  margin-bottom: var(--sp-2);
}
.reply-foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-2);
  margin-top: var(--sp-2);
}

.replies {
  margin-top: var(--sp-3);
  padding-left: var(--sp-2);
  border-left: 2px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.more {
  margin-top: var(--sp-4);
  text-align: center;
}
.ghost-btn {
  padding: 6px var(--sp-5);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  cursor: pointer;
}
.ghost-btn:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent);
}
.ghost-btn:disabled {
  opacity: 0.6;
}

@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}
@media (max-width: 748px) {
  .comments {
    padding: var(--sp-3) !important;
  }
}
</style>
