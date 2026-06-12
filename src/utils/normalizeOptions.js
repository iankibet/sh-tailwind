// Coerce arbitrary backend rows into { id, label } pairs, matching the
// lenient shapes shframework's SelectInput accepted.
export function normalizeOptions (items) {
    if (!Array.isArray(items)) {
        return []
    }
    return items.map(item => {
        if (item === null || typeof item === 'undefined') {
            return null
        }
        if (typeof item !== 'object') {
            return { id: item, label: String(item) }
        }
        const id = item.id ?? item.key ?? item.value ?? item.name
        const label = item.label ?? item.name ?? item.option ?? item.value ?? String(id)
        return { id, label, raw: item }
    }).filter(Boolean)
}
