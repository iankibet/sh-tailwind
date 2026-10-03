// URL values are strings; popup components declare real prop types. Only
// declared props are passed (undeclared keys would otherwise fall through as
// HTML attributes, e.g. `id="5"` on the root element), coerced to the type
// the component asked for.

export const camelize = (value) => String(value).replace(/[-_](\w)/g, (_, c) => c.toUpperCase())

export function declaredProps (component) {
    const props = component?.props
    if (!props) {
        return {}
    }
    if (Array.isArray(props)) {
        return Object.fromEntries(props.map(name => [camelize(name), null]))
    }
    return Object.fromEntries(Object.entries(props).map(([name, def]) => [camelize(name), def]))
}

const typesOf = (def) => {
    const type = def && typeof def === 'object' && !Array.isArray(def) ? def.type : def
    if (type == null) {
        return []
    }
    return Array.isArray(type) ? type : [type]
}

const NUMERIC = /^-?\d+(\.\d+)?$/

export function coerce (value, def) {
    const types = typesOf(def)
    if (value === null) {
        // `?flag` with no value
        return types.includes(Boolean) ? true : ''
    }
    // already typed (programmatic open without a router)
    if (typeof value !== 'string' || !types.length || types.includes(String)) {
        return value
    }
    if (types.includes(Number) && NUMERIC.test(value)) {
        return Number(value)
    }
    if (types.includes(Boolean)) {
        return !['', '0', 'false', 'no'].includes(value.toLowerCase())
    }
    if (types.includes(Array)) {
        return value.split(',').map(v => v.trim()).filter(Boolean)
    }
    if (types.includes(Object)) {
        try {
            return JSON.parse(value)
        } catch {
            return value
        }
    }
    return value
}

export function pickProps (component, params = {}) {
    const declared = declaredProps(component)
    const out = {}
    for (const [key, value] of Object.entries(params)) {
        const name = camelize(key)
        if (name in declared) {
            out[name] = coerce(value, declared[name])
        }
    }
    return out
}

export const propKeys = (component, params = {}) => {
    const declared = declaredProps(component)
    return Object.keys(params).filter(key => camelize(key) in declared)
}
