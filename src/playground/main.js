import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { ShTailwind } from '../index.js'
import './app.css'

const app = createApp(App)
app.use(createPinia())
app.use(ShTailwind, {
    baseApiUrl: import.meta.env.VITE_APP_API_URL ?? 'http://localhost:8000/api/'
})
app.mount('#app')
