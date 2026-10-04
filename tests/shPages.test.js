import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { createServer } from 'vite'
import VueRouter from 'vue-router/vite'
import { createPageDefaults, liftPageMeta, pageMeta, shPages } from '../src/vite/index.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), 'fixtures')

// Runs the real plugin over tests/fixtures/pages and returns the generated
// routes flattened to { '/full/path': { name, meta, file, lazy } }.
async function generate (options = {}, plugin = shPages, inspect = null) {
    const server = await createServer({
        root,
        configFile: false,
        logLevel: 'error',
        server: { middlewareMode: true, ws: false, hmr: false },
        plugins: [plugin({ pages: 'pages', root, watch: false, ...options }), vue()]
    })
    try {
        if (inspect) {
            return await inspect(server)
        }
        const { id } = await server.pluginContainer.resolveId('vue-router/auto-routes')
        const loaded = await server.pluginContainer.load(id)
        const code = typeof loaded === 'string' ? loaded : loaded.code
        const source = code
            .replace(/^import (_page_\d+) from '(.*)'$/gm, (_, name, file) => `const ${name} = ${JSON.stringify(file)}`)
            .replace(/^import (_definePage_default_\d+) from .*$/gm, (_, name) => `const ${name} = {}`)
            .replace(/^import .*$/gm, 'const _mergeRouteRecord = (main) => main')
            .replace(/\(\) => import\('(.*)'\)/g, (_, file) => JSON.stringify(`lazy:${file}`))
        const body = source.slice(0, source.indexOf('export function handleHotUpdate') >>> 0)
        const routes = new Function(`${body.replace('export const routes', 'const routes')}\nreturn routes`)()

        const flat = {}
        const walk = (records, base, meta) => records.forEach((record) => {
            const path = record.path.startsWith('/') ? record.path : `${base}/${record.path}`.replace(/\/$/, '')
            const merged = { ...meta, ...record.meta }
            if (record.component) {
                flat[path || '/'] = { name: record.name, meta: merged, file: record.component.split('/pages/')[1], lazy: record.component.startsWith('lazy:') }
            }
            walk(record.children ?? [], path === '/' ? '' : path, merged)
        })
        walk(routes, '', {})
        return flat
    } finally {
        await server.close()
    }
}

test('paths and names follow the files; group folders and components/ add nothing', async () => {
    const routes = await generate()
    assert.deepEqual(
        Object.fromEntries(Object.entries(routes).map(([path, route]) => [path, route.name])),
        {
            '/home': 'home',
            '/notifications/all': 'notifications-all',
            '/users': 'users',
            '/users/:id': 'users-id',
            '/settings/core': 'settings-core',
            '/settings/core/tab/notification-messages': 'settings-core-tab-notification-messages',
            '/settings/core/tab/notification-messages/:slug': 'settings-core-tab-notification-messages-slug',
            '/login': 'login',
            '/reports': 'reports',
            '/users/:id/edit': 'users-id-edit',
            '/tasks': 'tasks',
            '/tasks/:id/view': 'tasks-id-view',
            '/': 'index',
            '/:path(.*)': 'path'
        }
    )
})

test('pages are imported statically unless importMode says otherwise', async () => {
    assert.equal((await generate())['/home'].lazy, false)
    assert.equal((await generate({ importMode: 'async' }))['/home'].lazy, true)
})

test('auth by default, groups flag their pages, (guest) is signed-out', async () => {
    const routes = await generate()
    assert.equal(routes['/home'].meta.auth, true)
    assert.equal(routes['/home'].meta.admin, undefined)
    assert.deepEqual([routes['/users'].meta.auth, routes['/users'].meta.admin], [true, true])
    assert.equal(routes['/reports'].meta.staff, true)
    assert.deepEqual([routes['/login'].meta.auth, routes['/login'].meta.guest], [false, true])
})

test('title and breadcrumbs come from the URL', async () => {
    const routes = await generate()
    assert.equal(routes['/home'].meta.title, 'Home')
    assert.equal(routes['/home'].meta.breadcrumbs, undefined)
    assert.equal(routes['/notifications/all'].meta.title, 'All')
    assert.deepEqual(routes['/notifications/all'].meta.breadcrumbs, [{ label: 'Notifications' }])
    assert.deepEqual(routes['/users/:id'].meta.breadcrumbs, [{ label: 'Users', to: '/users' }])
    assert.deepEqual(routes['/settings/core'].meta.breadcrumbs, [{ label: 'Settings' }])
    assert.deepEqual(routes['/settings/core/tab/notification-messages/:slug'].meta, {
        auth: true,
        admin: true,
        title: 'Notification messages',
        breadcrumbs: [
            { label: 'Settings' },
            { label: 'Core', to: '/settings/core' },
            { label: 'Notification messages', to: '/settings/core/tab/notification-messages' }
        ]
    })
})

test('a <route> block wins over the defaults', async () => {
    const routes = await generate()
    assert.equal(routes['/login'].meta.title, 'Sign in')
    assert.deepEqual(routes['/tasks/:id/view'].meta, {
        auth: true,
        admin: true,
        popup: 'drawer',
        title: 'View',
        breadcrumbs: [{ label: 'Tasks', to: '/tasks' }]
    })
})

test('rewrites do not pile up breadcrumbs, and pick up new pages', async () => {
    // the bare vue-router plugin, so the defaults are applied by hand below
    let tree
    await generate(
        { routesFolder: 'pages', exclude: ['**/components/**'], dts: false, beforeWriteFiles: (root) => { tree = root } },
        ({ pages, ...options }) => VueRouter(options)
    )
    const record = [...tree].find(node => node.fullPath === '/users/:id')
    const apply = createPageDefaults({ meta: { auth: true } })
    apply(tree)
    apply(tree)
    assert.deepEqual(record.meta.breadcrumbs, [{ label: 'Users', to: '/users' }])

    // the list page goes away: the crumb loses its link instead of gaining a copy
    const withoutList = { [Symbol.iterator]: () => [...tree].filter(node => node.fullPath !== '/users' || !node.component)[Symbol.iterator]() }
    apply(withoutList)
    assert.deepEqual(record.meta.breadcrumbs, [{ label: 'Users' }])
    assert.equal(record.meta.admin, true)
})

test('meta and groups options replace the conventions', async () => {
    const routes = await generate({ meta: { auth: true, layout: 'app' }, groups: { staff: { role: 'staff' } } })
    assert.equal(routes['/home'].meta.layout, 'app')
    assert.equal(routes['/reports'].meta.role, 'staff')
    assert.equal(routes['/reports'].meta.staff, undefined)
    assert.equal(routes['/login'].meta.guest, true)
})

test('pageMeta works on its own', () => {
    assert.deepEqual(
        pageMeta('/orders/:id/items', 'pages/(admin)/orders/[id]/items.vue', new Set(['/orders', '/orders/:id'])),
        { admin: true, title: 'Items', breadcrumbs: [{ label: 'Orders', to: '/orders' }] }
    )
})

test('definePage shorthand: keys outside meta become meta', async () => {
    const code = await generate({}, shPages, async (server) =>
        (await server.transformRequest('/pages/(staff)/reports/index.vue?definePage&vue')).code)
    const page = (await import(`data:text/javascript,${encodeURIComponent(code)}`)).default
    assert.deepEqual(page, {
        meta: {
            title: 'Administrators',
            description: 'Review administrator accounts.',
            breadcrumbs: [
                { label: 'Dashboard', to: '/' },
                { label: 'Administrators', to: '/admins' }
            ]
        }
    })
})

test('liftPageMeta keeps route options and lets an explicit meta win', () => {
    assert.deepEqual(
        liftPageMeta({ name: 'team', alias: '/crew', title: 'Team', meta: { title: 'Our team', admin: true } }),
        { name: 'team', alias: '/crew', meta: { title: 'Our team', admin: true } }
    )
    assert.deepEqual(liftPageMeta({ meta: { title: 'Plain' } }), { meta: { title: 'Plain' } })
    assert.deepEqual(liftPageMeta({ name: 'only-name' }), { name: 'only-name' })
})
