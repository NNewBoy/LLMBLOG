<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getAdminSettings, updateSettings } from '@/api'
import { ElMessage } from 'element-plus'
import { Plus, Trash2 } from 'lucide-vue-next'
import type { EntryLink } from '@/types'

const form = reactive({
  blogger_name: '',
  blogger_desc: '',
  blogger_avatar: '',
  site_name: '',
  site_desc: '',
  site_favicon: '',
  icp_no: '',
  icp_url: '',
  police_no: '',
  police_url: '',
  police_logo: '',
  new_password: '',
  entry_links: [] as EntryLink[],
})
const saving = ref(false)

onMounted(async () => {
  const s = await getAdminSettings()
  Object.assign(form, s)
})

async function save() {
  saving.value = true
  try {
    const data: any = { ...form }
    if (!data.new_password) delete data.new_password
    await updateSettings(data)
    ElMessage.success('设置已保存')
    form.new_password = ''
  } finally {
    saving.value = false
  }
}

function addEntryLink() {
  form.entry_links.push({ title: '', url: '' })
}

function removeEntryLink(i: number) {
  form.entry_links.splice(i, 1)
}
</script>

<template>
  <div>
    <h1 class="page-title">系统设置</h1>
    <div class="sections">
      <section class="sec">
        <h2 class="sec-title">博主信息</h2>
        <el-form label-width="100px">
          <el-form-item label="博主名称"><el-input v-model="form.blogger_name" /></el-form-item>
          <el-form-item label="博主描述"><el-input v-model="form.blogger_desc" /></el-form-item>
          <el-form-item label="博主头像"><el-input v-model="form.blogger_avatar" placeholder="图片地址" /></el-form-item>
        </el-form>
      </section>
      <section class="sec">
        <h2 class="sec-title">站点信息</h2>
        <el-form label-width="100px">
          <el-form-item label="网站名称"><el-input v-model="form.site_name" /></el-form-item>
          <el-form-item label="网站描述"><el-input v-model="form.site_desc" /></el-form-item>
          <el-form-item label="网站图标"><el-input v-model="form.site_favicon" placeholder="图片地址" /></el-form-item>
        </el-form>
      </section>
      <section class="sec">
        <h2 class="sec-title">备案信息</h2>
        <el-form label-width="120px">
          <el-form-item label="IPC 备案号"><el-input v-model="form.icp_no" /></el-form-item>
          <el-form-item label="IPC 备案网址"><el-input v-model="form.icp_url" /></el-form-item>
          <el-form-item label="公安备案号"><el-input v-model="form.police_no" /></el-form-item>
          <el-form-item label="公安备案网址"><el-input v-model="form.police_url" /></el-form-item>
          <el-form-item label="公安 Logo"><el-input v-model="form.police_logo" /></el-form-item>
        </el-form>
      </section>
      <section class="sec">
        <h2 class="sec-title">入口页配置</h2>
        <p class="sec-hint">配置入口页（/entry）中展示的跳转网页，跳转时会自动附带当前主题参数 theme=dark/light。</p>
        <div v-for="(link, i) in form.entry_links" :key="i" class="entry-row">
          <el-input v-model="link.title" placeholder="名称（如 我的简历）" />
          <el-input v-model="link.url" placeholder="网址（如 https://example.com）" />
          <button class="icon-btn" type="button" aria-label="删除" @click="removeEntryLink(i)">
            <Trash2 :size="18" />
          </button>
        </div>
        <button class="add-btn" type="button" @click="addEntryLink">
          <Plus :size="18" /> 添加链接
        </button>
      </section>
      <section class="sec">
        <h2 class="sec-title">安全</h2>
        <el-form label-width="120px">
          <el-form-item label="修改密码"><el-input v-model="form.new_password" type="password" placeholder="留空不修改" /></el-form-item>
        </el-form>
      </section>
      <div class="actions">
        <button class="primary-btn" :disabled="saving" @click="save">
          {{ saving ? '保存中…' : '保存设置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 var(--sp-5);
  font-size: var(--fs-xl);
}
.sections {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}
.sec {
  padding: var(--sp-5);
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--surface-border);
  backdrop-filter: blur(var(--blur)) saturate(var(--saturate));
}
.sec-title {
  margin: 0 0 var(--sp-4);
  font-size: var(--fs-md);
  color: var(--accent);
}
.actions {
  display: flex;
  justify-content: flex-end;
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
.primary-btn:disabled {
  opacity: 0.6;
}
.sec-hint {
  margin: 0 0 var(--sp-4);
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}
.entry-row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-bottom: var(--sp-2);
}
.entry-row .el-input {
  flex: 1;
}
.icon-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--error);
  cursor: pointer;
  transition: background var(--dur-base) var(--ease-out);
}
.icon-btn:hover {
  background: var(--surface-hover);
}
.add-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  height: 40px;
  padding: 0 var(--sp-4);
  border: 1px dashed var(--surface-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-size: var(--fs-sm);
  transition: background var(--dur-base) var(--ease-out);
}
.add-btn:hover {
  background: var(--accent-soft);
}
</style>
