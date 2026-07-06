import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './styles/variables.css'
import './styles/glass.css'
import './styles/global.css'
import './styles/element-overrides.css'

//  ElMessage / ElMessageBox / ElTooltip 是 JS API，unplugin 不会自动注入样式，需手动导入
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/tooltip/style/css'
import 'element-plus/es/components/popper/style/css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
