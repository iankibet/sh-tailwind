import VueRouter from 'vue-router/vite'
import { liftPageMeta, pageMeta, routeName } from './pageRoutes.js'

// File-based routes for the sh stack: vue-router's own plugin (vue-router >= 5)
// with the stack's conventions filled in, so a page file is all a new screen
// needs.
//
//   pages/users/index.vue              -> /users          name 'users'
//   pages/users/[id].vue               -> /users/:id      name 'users-id'
//   pages/(admin)/reports/index.vue    -> /reports        meta.admin = true
//   pages/(guest)/login/index.vue      -> /login          meta.guest = true, no auth
//   pages/users/components/Card.vue    -> not a route
//
// Every page gets `meta.auth`, a `meta.title` and `meta.breadcrumbs` from its
// URL; a page overrides any of it with `definePage({ meta })`, or the shorthand
// `definePage({ title })`. Pages are imported statically (`importMode: 'async'`
// code-splits them).
//
//   plugins: [shPages(), vue()]   // before vue()
//
// Anything else in `options` goes straight to vue-router's plugin.
export function shPages (options = {}) {
    const {
        pages = 'resources/js/pages',
        exclude = [],
        meta = { auth: true },
        groups = {},
        tabSegment = 'tab',
        beforeWriteFiles,
        ...routerOptions
    } = options

    const conventions = {
        meta,
        // (guest)/ pages are the signed-out ones; any other group is just a flag
        groups: { guest: { guest: true, auth: false }, ...groups },
        tabSegment
    }
    const applyDefaults = createPageDefaults(conventions)

    return [VueRouter({
        routesFolder: pages,
        exclude: ['**/components/**', ...[].concat(exclude)],
        importMode: 'sync',
        dts: false,
        getRouteName: routeName,
        ...routerOptions,
        async beforeWriteFiles (root) {
            applyDefaults(root)
            await beforeWriteFiles?.(root)
        }
    }), pageMetaShorthand()]
}

// vue-router lifts each definePage() argument into its own module
// (`page.vue?definePage&…`, `export default { … }`). This wraps that export in
// liftPageMeta() so keys outside `meta` still reach the route's meta.
function pageMetaShorthand () {
    return {
        name: 'sh-tailwind:page-meta',
        enforce: 'post',
        transform (code, id) {
            if (!/[?&]definePage\b/.test(id) || !/^export default /m.test(code)) {
                return null
            }
            return {
                code: `const __shLiftPageMeta = ${liftPageMeta.toString()}\n` +
                    code.replace(/^export default /m, 'const __shPage = ') +
                    '\nexport default __shLiftPageMeta(__shPage)\n',
                map: null
            }
        }
    }
}

// Returns the function that fills in each page's default meta. vue-router calls
// it on every rewrite with the same tree, and its addToMeta() concatenates
// arrays, so a page is only touched again when its defaults changed, and then
// its meta is replaced rather than merged. Meta from a <route> block is kept.
export function createPageDefaults (conventions = {}) {
    const written = new Map() // page file -> { keys, json } this preset last wrote

    return (root) => {
        const nodes = [...root]
        const pagePaths = new Set(nodes.filter(node => node.component).map(node => node.fullPath))
        for (const node of nodes) {
            if (!node.component) {
                continue
            }
            const previous = written.get(node.component)
            const current = node.meta
            const add = {}
            for (const [key, value] of Object.entries(pageMeta(node.fullPath, node.component, pagePaths, conventions))) {
                if (previous?.keys.includes(key) || !(key in current)) {
                    add[key] = value
                }
            }
            const json = JSON.stringify(add)
            if (previous?.json === json) {
                continue
            }
            if (previous) {
                const kept = Object.fromEntries(Object.entries(current).filter(([key]) => !previous.keys.includes(key)))
                node.meta = { ...kept, ...add }
            } else {
                node.addToMeta(add)
            }
            written.set(node.component, { keys: Object.keys(add), json })
        }
    }
}

export { liftPageMeta, pageMeta, routeName }
export default shPages
