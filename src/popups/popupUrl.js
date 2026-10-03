// URL format for stacked popups. Layer 0 keeps the shframework keys so old
// links keep working; every layer above it namespaces its keys with `p{n}.`:
//
//   ?popup=drawer&comp=ViewTask&title=Task&id=5       <- layer 0
//   &p1.popup=dialog&p1.comp=EditTask&p1.id=5         <- layer 1 (on top)
//
// Layer 0 props are its unprefixed keys (shared with the page's own query,
// as before); layer n props are only its prefixed keys.

const TYPE_ALIASES = {
    dialog: 'dialog',
    modal: 'dialog',
    drawer: 'drawer',
    canvas: 'drawer',
    offcanvas: 'drawer'
}
const SIDE_ALIASES = {
    start: 'start',
    left: 'start',
    end: 'end',
    right: 'end',
    top: 'top',
    bottom: 'bottom'
}

// popup/comp identify the layer; the rest configure the shell but are still
// offered to the component as props
const IDENTITY_KEYS = ['popup', 'popUp', 'comp', 'component']
const CONTROL_KEYS = [...IDENTITY_KEYS, 'title', 'size', 'side', 'position', 'static']
const LAYER_KEY = /^p(\d+)\.(.+)$/

export const normalizeType = (value) => TYPE_ALIASES[String(value ?? '').toLowerCase()] ?? null
export const normalizeSide = (value) => SIDE_ALIASES[String(value ?? '').toLowerCase()] ?? 'end'

const prefix = (index) => (index === 0 ? '' : `p${index}.`)
const single = (value) => (Array.isArray(value) ? value[0] : value)

// `?static` (no value) arrives from vue-router as null
const flag = (raw, key) =>
    key in raw && (raw[key] === null || !['0', 'false', 'no'].includes(String(raw[key]).toLowerCase()))

export function parseQueryLayers (query = {}) {
    const buckets = [{}]
    for (const [key, value] of Object.entries(query)) {
        const match = key.match(LAYER_KEY)
        if (match) {
            (buckets[Number(match[1])] ??= {})[match[2]] = single(value)
        } else {
            buckets[0][key] = single(value)
        }
    }

    const layers = []
    // layers are contiguous: a gap ends the stack
    for (let index = 0; index < buckets.length; index++) {
        const raw = buckets[index]
        const type = raw && normalizeType(raw.popup ?? raw.popUp)
        if (!type) {
            break
        }
        const params = {}
        for (const [key, value] of Object.entries(raw)) {
            if (!IDENTITY_KEYS.includes(key)) {
                params[key] = value
            }
        }
        layers.push({
            index,
            type,
            name: raw.comp ?? raw.component ?? null,
            title: raw.title ?? undefined,
            size: raw.size ?? undefined,
            side: normalizeSide(raw.side ?? raw.position),
            static: flag(raw, 'static'),
            params
        })
    }
    return layers
}

export function buildLayerQuery (index, name, { type, title, size, side, static: isStatic, props = {} } = {}) {
    const p = prefix(index)
    const query = {
        [`${p}popup`]: normalizeType(type) ?? 'dialog',
        [`${p}comp`]: name
    }
    if (title) query[`${p}title`] = title
    if (size) query[`${p}size`] = size
    if (side) query[`${p}side`] = side
    if (isStatic) query[`${p}static`] = '1'
    for (const [key, value] of Object.entries(props)) {
        if (value === undefined || value === null) {
            continue
        }
        if (typeof value === 'object') {
            console.warn(`[ShPopups] prop "${key}" is an object and can't go in the URL; pass an id and load it in the popup`)
            continue
        }
        if (CONTROL_KEYS.includes(key)) {
            console.warn(`[ShPopups] prop "${key}" clashes with a popup option; rename it`)
            continue
        }
        query[`${p}${key}`] = String(value)
    }
    return query
}

// Removes layer `fromIndex` and everything stacked above it. Layer 0's props
// share the page's query, so only the keys known to belong to it (control
// keys + `layer0Keys`, the props its component declares) are dropped.
export function stripLayers (query, fromIndex, layer0Keys = []) {
    const out = {}
    for (const [key, value] of Object.entries(query)) {
        const match = key.match(LAYER_KEY)
        if (match) {
            if (Number(match[1]) >= fromIndex) {
                continue
            }
        } else if (fromIndex === 0 && (CONTROL_KEYS.includes(key) || layer0Keys.includes(key))) {
            continue
        }
        out[key] = value
    }
    return out
}
