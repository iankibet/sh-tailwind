import { ref } from 'vue'
import { shApis } from '@iankibetsh/sh-core'
import tableCache from './tableCache.js'
import { localQuery } from './localQuery.js'

/**
 * Table data engine with an offline-first cache:
 * 1. Cached snapshot of the exact query renders instantly (stale-while-revalidate).
 * 2. Network response replaces it, refreshes the snapshot and merges rows
 *    into the endpoint's offline pool.
 * 3. When the network fails or times out (no HTTP response), the query -
 *    including search, sort and pagination - runs locally against the pool
 *    and the result is flagged `offline`.
 *
 * `query()` must return { endpoint, params } where params carry the Laravel
 * contract keys (page, per_page, filter_value, order_by, ...).
 */
export function useTableData ({ query, cacheEnabled = () => false, networkTimeout = () => 10000 }) {
    const records = ref([])
    const meta = ref(null) // Laravel paginator shape
    const status = ref('loading') // loading | done | error
    const error = ref('')
    const offline = ref(false)
    const fromCache = ref(false)

    let requestSeq = 0

    const queryKey = (endpoint, params) =>
        endpoint + '|' + JSON.stringify(params)

    const apply = (response, { append = false } = {}) => {
        if (append) {
            records.value.push(...(response.data ?? []))
        } else {
            records.value = response.data ?? []
        }
        meta.value = {
            total: response.total ?? records.value.length,
            per_page: response.per_page,
            current_page: response.current_page ?? 1,
            last_page: response.last_page ?? 1,
            from: response.from ?? 1
        }
        status.value = 'done'
    }

    const load = async ({ append = false } = {}) => {
        const seq = ++requestSeq
        const { endpoint, params } = query()
        const key = queryKey(endpoint, params)
        const useCache = !!cacheEnabled()
        let showedCached = false

        if (!records.value.length) {
            status.value = 'loading'
        }

        // 1. Instant render from the exact-query snapshot
        if (useCache && !append) {
            const cached = await tableCache.getPage(key)
            if (cached && seq === requestSeq) {
                apply(cached)
                fromCache.value = true
                showedCached = true
            }
        }

        // 2. Network attempt (bounded so a dead connection falls back fast)
        try {
            const res = await shApis.doGet(endpoint, params, { timeout: networkTimeout() })
            if (seq !== requestSeq) {
                return
            }
            const response = res.data?.data ?? res.data
            apply(response, { append })
            offline.value = false
            fromCache.value = false
            error.value = ''
            if (useCache) {
                tableCache.setPage(key, response)
                tableCache.mergeRows(endpoint, response.data)
            }
            return response
        } catch (reason) {
            if (seq !== requestSeq) {
                return
            }
            // Server answered (4xx/5xx): a real error, not an offline situation
            if (reason.response) {
                if (!showedCached) {
                    status.value = 'error'
                    error.value = `${reason.response.status}: ${reason.response.statusText} (${endpoint})`
                }
                return
            }
            // 3. Network unreachable or timed out: run the query locally
            offline.value = true
            if (showedCached) {
                return
            }
            if (useCache) {
                const pool = await tableCache.getRows(endpoint)
                if (seq !== requestSeq) {
                    return
                }
                if (pool.length) {
                    apply(localQuery(pool, {
                        search: params.filter_value,
                        exact: params.exact,
                        orderBy: params.order_by,
                        orderMethod: params.order_method,
                        page: params.page,
                        perPage: params.per_page
                    }), { append: false })
                    fromCache.value = true
                    return
                }
            }
            status.value = 'error'
            error.value = 'You appear to be offline and there is no cached data yet'
        }
    }

    return { records, meta, status, error, offline, fromCache, load }
}
