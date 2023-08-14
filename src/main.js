import { createApp } from 'vue'
import { createPinia } from 'pinia'
import global from '@/global'

import App from './App.vue'

import '@/utils/index'

import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(global)
app.use(router)

app.mount('#app')
