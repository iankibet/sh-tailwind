import { computed, getCurrentScope, markRaw, onScopeDispose, reactive, shallowRef, watch } from 'vue'
import { buildLayerQuery, normalizeSide, normalizeType, parseQueryLayers, stripLayers } from './popupUrl.js'
import { propKeys } from './popupProps.js'
import ShPopupForm from '../components/overlay/ShPopupForm.vue'

// Popups live in the URL so they survive refresh, can be linked to and close
// with the Back button. Two sources feed one stack:
//   - route meta:   { path: 'tasks/:id', component, meta: { popup: 'drawer', title } }
//   - query string: ?popup=dialog&comp=EditTask&id=5 (see popupUrl.js)
// Without vue-router the stack is kept in memory and only open() works.

const SUCCESS_CLOSE_DELAY = 600 // let the form's success toast register first

const BUILTINS = {
    ShPopupForm,
    // shframework's ShQueryPopups alias
    ShQueryForm: ShPopupForm,
    ShForm: ShPopupForm
}

const normalizeName = (name) => String(name ?? '').toLowerCase().replace(/[-_\s]/g, '')

const hasComponents = (record) => !!record.components && Object.keys(record.components).length > 0

const sortedQuery = (query) =>
    JSON.stringify(Object.keys(query).sort().map(key => [key, query[key]]))

export function createPopupManager (app, popups = {}) {
    const registry = new Map()
    const register = (name, source) => {
        registry.set(normalizeName(name), { name, source, component: null, promise: null })
    }
    Object.entries(BUILTINS).forEach(([name, component]) => register(name, component))
    Object.entries(popups).forEach(([name, source]) => register(name, source))

    // resolved lazily: app.use(router) may run after app.use(ShTailwind)
    const getRouter = () => app.config.globalProperties.$router ?? null

    const memory = shallowRef([])
    const entries = reactive([])
    const listeners = new Set()
    const callbacks = new Map()
    let uid = 0
    let attached = false

    const queryKey = (layer) => `q${layer.index}:${layer.type}:${normalizeName(layer.name)}`

    const routeLayer = (route) => {
        const leaf = route.matched[route.matched.length - 1]
        const meta = route.meta ?? {}
        const type = normalizeType(meta.popup ?? meta.popUp)
        if (!leaf || !type) {
            return null
        }
        return {
            key: `route:${leaf.path}`,
            source: 'route',
            index: -1,
            type,
            name: leaf.name ?? leaf.path,
            component: leaf.components?.default && markRaw(leaf.components.default),
            title: typeof meta.title === 'function' ? meta.title(route) : meta.title,
            size: meta.size,
            side: normalizeSide(meta.side ?? meta.position),
            static: !!meta.static,
            params: { ...route.params }
        }
    }

    const stack = computed(() => {
        const router = getRouter()
        if (!router) {
            return memory.value
        }
        const route = router.currentRoute.value
        const layers = []
        const fromRoute = routeLayer(route)
        if (fromRoute) {
            layers.push(fromRoute)
        }
        for (const layer of parseQueryLayers(route.query)) {
            layers.push({ ...layer, source: 'query', key: queryKey(layer) })
        }
        return layers
    })

    // --- component resolution ------------------------------------------------

    const lookup = (layer) => (layer.source === 'route' ? null : registry.get(normalizeName(layer.name)))

    // Returns the component (sync when already known) or a promise for it.
    // null means the name isn't registered.
    function resolve (layer) {
        if (layer.source === 'route') {
            return layer.component ?? null
        }
        const item = lookup(layer)
        if (!item) {
            return null
        }
        if (item.component) {
            return item.component
        }
        const { source } = item
        // defineAsyncComponent() result: unwrap it so declared props are visible
        const loader = typeof source === 'function'
            ? source
            : source.__asyncLoader ?? null
        if (!loader) {
            item.component = markRaw(source)
            return item.component
        }
        item.promise ??= Promise.resolve(loader()).then(mod => {
            item.component = markRaw(mod?.default ?? mod)
            return item.component
        }).catch(error => {
            item.promise = null // allow a retry on next open
            throw error
        })
        return item.promise
    }

    // --- navigation ------------------------------------------------------------

    function parentLocation (route) {
        const back = route.meta?.back
        if (back) {
            return typeof back === 'function' ? back(route) : back
        }
        // nearest ancestor that renders something; `matched` ends with the popup
        for (let i = route.matched.length - 2; i >= 0; i--) {
            const record = route.matched[i]
            if (!hasComponents(record)) {
                continue
            }
            const path = record.path.replace(/:(\w+)(\([^)]*\))?[?*+]?/g, (_, key) => route.params[key] ?? '')
            return path.replace(/\/{2,}/g, '/') || '/'
        }
        return '/'
    }

    const layer0Keys = (layers) => {
        const layer = layers.find(l => l.source === 'query' && l.index === 0)
        const component = layer && lookup(layer)?.component
        return component ? propKeys(component, layer.params) : []
    }

    function navigateWithout (layer) {
        const router = getRouter()
        if (!router) {
            memory.value = memory.value.filter(l => l.index < layer.index)
            return
        }
        const route = router.currentRoute.value
        const layers = stack.value
        const target = layer.source === 'route'
            ? { path: parentLocation(route), query: stripLayers(route.query, 0, layer0Keys(layers)) }
            : { path: route.path, query: stripLayers(route.query, layer.index, layer.index === 0 ? layer0Keys(layers) : []), hash: route.hash }

        // If the previous history entry is exactly where we're going, go Back
        // so the popup doesn't leave a forward entry behind. Opened from a
        // fresh load or an external link, replace instead (Back would leave the app).
        const isTop = layers[layers.length - 1]?.key === layer.key
        const back = typeof window !== 'undefined' ? window.history.state?.back : null
        if (isTop && back) {
            const a = router.resolve(back)
            const b = router.resolve(target)
            if (a.path === b.path && sortedQuery(a.query) === sortedQuery(b.query)) {
                return router.back()
            }
        }
        return router.replace(target)
    }

    // --- entries (what the host renders) -------------------------------------

    function sync (layers) {
        const keys = new Set(layers.map(l => l.key))
        for (const entry of entries) {
            if (!entry.closing && !keys.has(entry.key)) {
                entry.closing = true
                entry.reason ??= 'navigation'
                entry.open = false
            }
        }
        for (const layer of layers) {
            const entry = entries.find(e => e.key === layer.key && !e.closing)
            if (entry) {
                entry.layer = layer
            } else {
                entries.push({ uid: ++uid, key: layer.key, layer, open: true, closing: false, reason: null, result: undefined })
            }
        }
    }

    function closeEntry (entry, reason = 'dismiss', result) {
        if (!entry || entry.closing) {
            return
        }
        entry.closing = true
        entry.reason = reason
        entry.result = result
        entry.open = false
        navigateWithout(entry.layer)
    }

    // after the leave transition: drop it and tell whoever is listening
    function finalize (entry) {
        const index = entries.indexOf(entry)
        if (index >= 0) {
            entries.splice(index, 1)
        }
        const info = { name: entry.layer.name, reason: entry.reason ?? 'dismiss', result: entry.result, layer: entry.layer }
        const callback = callbacks.get(entry.key)
        if (callback) {
            callbacks.delete(entry.key)
            callback(info)
        }
        listeners.forEach(fn => fn(info))
    }

    // Called by <ShPopups /> in its setup scope so the watcher dies with it
    function attach () {
        if (attached) {
            console.warn('[ShPopups] mounted more than once; mount a single <ShPopups /> in App.vue')
        }
        attached = true
        watch(stack, sync, { immediate: true })
        onScopeDispose(() => {
            attached = false
        })
    }

    // Per-entry context for the content: overrides the shell's
    // SH_DIALOG_CONTEXT so a nested ShForm's success closes through the URL.
    function contextFor (entry) {
        return {
            close: (result) => closeEntry(entry, 'closed', result),
            requestClose: (reason) => {
                if (reason === 'success') {
                    setTimeout(() => closeEntry(entry, 'success'), SUCCESS_CLOSE_DELAY)
                    return
                }
                closeEntry(entry, reason)
            }
        }
    }

    // --- public API --------------------------------------------------------------

    function location (name, options = {}) {
        const router = getRouter()
        if (!router) {
            return null
        }
        const route = router.currentRoute.value
        const index = parseQueryLayers(route.query).length
        return {
            path: route.path,
            query: { ...route.query, ...buildLayerQuery(index, name, options) },
            hash: route.hash
        }
    }

    function open (name, options = {}) {
        const { onClose, ...rest } = options
        const router = getRouter()
        if (!router) {
            const index = memory.value.length
            const layer = {
                key: `m${index}:${normalizeName(name)}`,
                source: 'memory',
                index,
                type: normalizeType(rest.type) ?? 'dialog',
                name,
                title: rest.title,
                size: rest.size,
                side: normalizeSide(rest.side),
                static: !!rest.static,
                params: { ...(rest.props ?? {}), ...(rest.title ? { title: rest.title } : {}) }
            }
            onClose && callbacks.set(layer.key, onClose)
            memory.value = [...memory.value, layer]
            return Promise.resolve()
        }
        const target = location(name, rest)
        if (onClose) {
            const index = parseQueryLayers(router.currentRoute.value.query).length
            callbacks.set(queryKey({ index, type: normalizeType(rest.type) ?? 'dialog', name }), onClose)
        }
        return router.push(target)
    }

    const topEntry = () => [...entries].reverse().find(e => !e.closing)

    return {
        // public
        stack,
        open,
        close: (result) => closeEntry(topEntry(), 'closed', result),
        closeAll: () => {
            const first = entries.find(e => !e.closing)
            first && closeEntry(first, 'closed')
        },
        location,
        href: (name, options) => {
            const target = location(name, options)
            return target ? getRouter().resolve(target).href : '#'
        },
        onClosed: (fn) => {
            listeners.add(fn)
            const off = () => listeners.delete(fn)
            getCurrentScope() && onScopeDispose(off)
            return off
        },
        register,
        // host internals
        entries,
        attach,
        resolve,
        contextFor,
        dismiss: (entry) => closeEntry(entry, 'dismiss'),
        finalize
    }
}
