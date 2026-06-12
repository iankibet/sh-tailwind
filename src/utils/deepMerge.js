const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

export function deepMerge (base, override) {
    if (!isPlainObject(base)) {
        return override ?? base
    }
    const out = { ...base }
    if (!isPlainObject(override)) {
        return out
    }
    Object.keys(override).forEach(key => {
        if (isPlainObject(base[key]) && isPlainObject(override[key])) {
            out[key] = deepMerge(base[key], override[key])
        } else {
            out[key] = override[key]
        }
    })
    return out
}
