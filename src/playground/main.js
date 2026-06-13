import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { getApiClient } from '@iankibetsh/sh-core'
import App from './App.vue'
import { ShTailwind } from '../index.js'
import { localQuery } from '../table/localQuery.js'
import { demoUsers } from './demoData.js'
import './app.css'

const app = createApp(App)
app.use(createPinia())
app.use(ShTailwind, {
    baseApiUrl: import.meta.env.VITE_APP_API_URL ?? 'http://localhost:8000/api/'
})

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

app.mount('#app')
