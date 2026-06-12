import { shStorage } from '@iankibetsh/sh-core'

// Revamped table cache. Two stores:
// - 'pages': exact query snapshots (endpoint+page+search+sort+range) for
//   instant stale-while-revalidate rendering.
// - 'rows':  a merged pool of every row ever fetched per endpoint, so
//   search/sort/pagination can run fully offline when the network is slow
//   or unreachable.
const DB_NAME = 'sh_tw_table_cache'
const PAGES_STORE = 'pages'
const ROWS_STORE = 'rows'
const DB_VERSION = 1
// Cap the offline pool per endpoint so the cache can't grow unbounded
const MAX_POOL_ROWS = 3000

let dbPromise = null

function getDB () {
    if (dbPromise) {
        return dbPromise
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(PAGES_STORE)) {
                db.createObjectStore(PAGES_STORE)
            }
            if (!db.objectStoreNames.contains(ROWS_STORE)) {
                db.createObjectStore(ROWS_STORE)
            }
        }
        request.onsuccess = (event) => resolve(event.target.result)
        request.onerror = (event) => reject(event.target.error)
    })
    return dbPromise
}

// Cache entries are scoped per logged-in user so shared devices never leak
// another account's rows
function userPrefix () {
    try {
        const user = shStorage.getItem('user')
        return user?.id ? `u${user.id}_` : ''
    } catch (err) {
        return ''
    }
}

function tx (storeName, mode, run) {
    return getDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)
        const request = run(store)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })).catch(error => {
        console.error('[sh-tailwind] table cache error', error)
        return undefined
    })
}

export async function getPage (key) {
    const entry = await tx(PAGES_STORE, 'readonly', store => store.get(userPrefix() + key))
    return entry?.response ?? null
}

export function setPage (key, response) {
    return tx(PAGES_STORE, 'readwrite', store =>
        store.put({ response, timestamp: Date.now() }, userPrefix() + key)
    )
}

export async function getRows (endpoint) {
    const entry = await tx(ROWS_STORE, 'readonly', store => store.get(userPrefix() + endpoint))
    return entry?.rows ?? []
}

// Upsert freshly fetched rows into the endpoint's offline pool (merged by id)
export async function mergeRows (endpoint, newRows) {
    if (!Array.isArray(newRows) || !newRows.length) {
        return
    }
    const existing = await getRows(endpoint)
    const byId = new Map()
    existing.forEach(row => {
        if (row && typeof row.id !== 'undefined') {
            byId.set(row.id, row)
        }
    })
    newRows.forEach(row => {
        if (row && typeof row.id !== 'undefined') {
            byId.set(row.id, row)
        }
    })
    let rows = [...byId.values()]
    if (rows.length > MAX_POOL_ROWS) {
        rows = rows.slice(rows.length - MAX_POOL_ROWS)
    }
    return tx(ROWS_STORE, 'readwrite', store =>
        store.put({ rows, timestamp: Date.now() }, userPrefix() + endpoint)
    )
}

export async function clearTableCache () {
    await tx(PAGES_STORE, 'readwrite', store => store.clear())
    await tx(ROWS_STORE, 'readwrite', store => store.clear())
}

export default {
    getPage,
    setPage,
    getRows,
    mergeRows,
    clear: clearTableCache
}
