// Pure helpers that run a table query (search/sort/paginate) against the
// offline row pool, returning the same shape as a Laravel paginator so the
// table renders identically online and offline.

export function getPath (record, path) {
    if (!record || !path || typeof path !== 'string') {
        return ''
    }
    return path.split('.').reduce((obj, key) => (obj ? obj[key] : ''), record)
}

function rowMatches (row, term, exact, depth = 0) {
    if (row === null || typeof row === 'undefined') {
        return false
    }
    if (typeof row === 'object') {
        if (depth > 2) {
            return false
        }
        return Object.values(row).some(value => rowMatches(value, term, exact, depth + 1))
    }
    const text = String(row).toLowerCase()
    return exact ? text === term : text.includes(term)
}

export function localQuery (rows, { search, exact, orderBy, orderMethod, page, perPage } = {}) {
    let filtered = rows

    if (search) {
        const term = String(search).toLowerCase()
        filtered = rows.filter(row => rowMatches(row, term, !!exact))
    }

    if (orderBy) {
        const direction = orderMethod === 'asc' ? 1 : -1
        filtered = [...filtered].sort((a, b) => {
            const left = getPath(a, orderBy)
            const right = getPath(b, orderBy)
            if (typeof left === 'number' && typeof right === 'number') {
                return (left - right) * direction
            }
            return String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true }) * direction
        })
    }

    const total = filtered.length
    const limit = Math.max(1, Number(perPage) || 10)
    const lastPage = Math.max(1, Math.ceil(total / limit))
    const currentPage = Math.min(Math.max(1, Number(page) || 1), lastPage)
    const start = (currentPage - 1) * limit

    return {
        data: filtered.slice(start, start + limit),
        total,
        per_page: limit,
        current_page: currentPage,
        last_page: lastPage,
        from: total === 0 ? 0 : start + 1
    }
}
