import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { getApiClient } from '@iankibetsh/sh-core'
import App from './App.vue'
import { ShTailwind, tokenTheme } from '../index.js'
import { localQuery } from '../table/localQuery.js'
import { demoUsers } from './demoData.js'
import DemoUserCard from './popups/DemoUserCard.vue'
import './app.css'

// Router exists only so ShPopups can drive overlays from the URL. The page
// lives in App.vue (no <router-view>), so the child route renders only as a popup.
const router = createRouter({
    history: createWebHistory(),
    routes: [{
        path: '/',
        component: { render: () => null },
        children: [{
            path: 'users/:id/peek',
            component: () => import('./popups/DemoRoutePopup.vue'),
            meta: { popup: 'drawer', title: 'Route popup', size: 'sm' }
        }]
    }]
})

const app = createApp(App)
app.use(createPinia())
app.use(ShTailwind, {
    baseApiUrl: import.meta.env.VITE_APP_API_URL ?? 'http://localhost:8000/api/',
    preset: tokenTheme,
    popups: {
        DemoUserCard,
        DemoEditUser: () => import('./popups/DemoEditUser.vue')
    }
})
app.use(router)

// --- Playground-only mock so ShTable has data without a backend.
// Reuses localQuery so the server-style search/sort/pagination is real.
const client = getApiClient()
const realGet = client.get.bind(client)
client.get = async (endpoint, config = {}) => {
    if (endpoint === 'demo/users') {
        const p = config.params ?? {}
        const paginator = localQuery(demoUsers, {
            search: p.filter_value,
            exact: p.exact,
            orderBy: p.order_by,
            orderMethod: p.order_method,
            page: p.page,
            perPage: p.per_page
        })
        // shape: response.data.data = Laravel paginator
        return { data: { data: paginator } }
    }
    return realGet(endpoint, config)
}
const realPost = client.post.bind(client)
client.post = async (endpoint, data, config) => {
    if (endpoint === 'demo/users/update' || endpoint === 'demo/tasks') {
        await new Promise(r => setTimeout(r, 300))
        return { data: { message: 'Saved' } }
    }
    return realPost(endpoint, data, config)
}

app.mount('#app')
