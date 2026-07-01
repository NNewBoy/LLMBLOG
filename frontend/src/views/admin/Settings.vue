<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getAdminSettings, updateSettings } from '@/api'
import { ElMessage } from 'element-plus'

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
</style>
