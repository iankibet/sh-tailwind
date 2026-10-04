// Naming and meta conventions behind shPages(). Pure functions, no vite or
// vue-router imports, so they can be tested and reused on their own.

const GROUP_RE = /^\((.+)\)$/

const isParam = (segment) => segment.startsWith(':')

// 'access-logs' -> 'Access logs'
export const segmentLabel = (segment) => {
    const words = segment.replace(/[-_]+/g, ' ').trim()
    return words.charAt(0).toUpperCase() + words.slice(1)
}

// '(admin)' folders a page file sits in, outermost first
export const groupsOf = (file) =>
    file.split(/[\\/]/).map(part => part.match(GROUP_RE)?.[1]).filter(Boolean)

// The route name is the URL with dashes: /users -> 'users', /users/:id ->
// 'users-id'. Group folders and `index` add nothing. A page that also wraps an
// index child (users.vue + users/index.vue) gets '-parent' so both stay unique.
export function routeName (node) {
    const parts = []
    for (let current = node; current && !current.isRoot(); current = current.parent) {
        const raw = current.value.rawSegment
        if (raw === 'index' || GROUP_RE.test(raw)) {
            continue
        }
        const part = current.value.subSegments
            .map(segment => (typeof segment === 'string' ? segment : segment.paramName))
            .join('')
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        if (part) {
            parts.unshift(part)
        }
    }
    const name = parts.join('-') || 'index'
    return node.value.components.size && node.children.has('index') ? `${name}-parent` : name
}

// Default meta for the page at `fullPath` ('/settings/core/tab/messages/:slug'):
//   - `meta` for every page, then each group folder's meta ({ [group]: true }
//     unless `groups` says otherwise)
//   - title: the last named segment ('Messages')
//   - breadcrumbs: the named segments above it, linked when a page lives there.
//     Params and ShTabs' `tab` segment are skipped; they still count in links.
export function pageMeta (fullPath, file, pagePaths, { meta = {}, groups = {}, tabSegment = 'tab' } = {}) {
    const result = { ...meta }
    for (const group of groupsOf(file)) {
        Object.assign(result, groups[group] ?? { [group]: true })
    }

    const segments = fullPath.split('/').filter(Boolean)
    const trail = []
    segments.forEach((segment, index) => {
        if (isParam(segment) || segment === tabSegment) {
            return
        }
        const path = '/' + segments.slice(0, index + 1).join('/')
        const crumb = { label: segmentLabel(segment) }
        if (pagePaths.has(path) && !path.includes(':')) {
            crumb.to = path
        }
        trail.push(crumb)
    })

    const own = trail.pop()
    if (own) {
        result.title = own.label
    }
    // a record page (/users/:id) sits under its list, which stays in the trail
    if (own && isParam(segments[segments.length - 1] ?? '')) {
        trail.push(own)
    }
    if (trail.length) {
        result.breadcrumbs = trail
    }
    return result
}

// definePage() shorthand: anything that is not a route option is page meta, so
//   definePage({ title: 'Admins', breadcrumbs: [{ label: 'Home', href: '/' }] })
// means definePage({ meta: { title, breadcrumbs } }). An explicit `meta` wins,
// and a crumb's `href` is read as `to`. Runs in the browser: shPages() inlines
// this function into each page's definePage module, so it must stay
// self-contained (no outer references).
export function liftPageMeta (page) {
    if (!page || typeof page !== 'object') {
        return page
    }
    const routeKeys = ['name', 'path', 'alias', 'redirect', 'meta', 'props', 'params', 'beforeEnter', 'children', 'component', 'components']
    const record = {}
    const lifted = {}
    for (const key of Object.keys(page)) {
        (routeKeys.includes(key) ? record : lifted)[key] = page[key]
    }
    const meta = { ...lifted, ...page.meta }
    if (Array.isArray(meta.breadcrumbs)) {
        meta.breadcrumbs = meta.breadcrumbs.map((crumb) => {
            if (!crumb || crumb.href === undefined || crumb.to !== undefined) {
                return crumb
            }
            const { href, ...rest } = crumb
            return { ...rest, to: href }
        })
    }
    if (Object.keys(meta).length) {
        record.meta = meta
    }
    return record
}
