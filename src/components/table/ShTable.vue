<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue'
import { shRepo, shApis, useUserStore, getShConfig, shStorage } from '@iankibetsh/sh-core'
import { useTheme } from '../../theme/useTheme.js'
import { useTableData } from '../../table/useTableData.js'
import { getPath } from '../../table/localQuery.js'
import { startCase } from '../../utils/strings.js'
import ShTablePagination from './ShTablePagination.vue'
import ShSpinner from '../actions/ShSpinner.vue'

const props = defineProps({
    endpoint: { type: String, required: true },
    /**
     * Column schema: strings or objects
     * { name (dot-path ok), label, format ('date'|'datetime'|'number'|'money'),
     *   sortable (default true), component (cell component, gets :row),
     *   show (fn -> bool), class }
     */
    columns: { type: Array, required: true },
    /**
     * Row actions:
     * { label, emit ('edit' -> @edit(row)), handler (fn(row)),
     *   link ('/users/{id}' -> router.push), url ('users/{id}/x' -> POST),
     *   confirm ('message' -> swal confirm before POST),
     *   permission, show (fn(row) -> bool), class }
     */
    actions: { type: Array, default: () => [] },
    // Bulk actions over selected rows: { label, handler(rows), permission, class }
    multiActions: { type: Array, default: () => [] },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: { type: String, default: 'Search' },
    // date range filter (sends from/to like the classic ShTable)
    hasRange: Boolean,
    perPage: Number,
    sortBy: String,
    sortMethod: { type: String, default: 'desc' },
    paginationStyle: String, // 'pages' | 'loadMore'; falls back to ShConfig tablePaginationStyle
    rowLink: String, // '/users/{id}'
    // offline-first IndexedDB cache; null respects ShConfig 'enableTableCache'
    cache: { type: Boolean, default: null },
    networkTimeout: { type: Number, default: 10000 },
    // bump to force a reload
    reload: [Number, String, Boolean],
    emptyMessage: { type: String, default: 'No records found' },
    classes: Object
})

const emit = defineEmits(['rowClick', 'loaded', 'action'])

const t = useTheme('table', computed(() => props.classes))
const userStore = useUserStore()

// vue-router is optional: use the app's router when installed, otherwise
// fall back to a full page navigation
const router = getCurrentInstance()?.appContext.config.globalProperties.$router ?? null
const navigate = (path) => {
    if (router) {
        router.push(path)
    } else {
        window.location.href = path
    }
}

// --- columns -------------------------------------------------------------
const cols = computed(() => props.columns.map(col => {
    const column = typeof col === 'string' ? { name: col } : { ...col }
    column.label = column.label ?? startCase(column.name.split('.').pop())
    column.sortable = column.sortable ?? !column.component
    return column
}).filter(column => (column.show ? column.show() : true)))

// --- query state ----------------------------------------------------------
const perPageStorageKey = () => {
    const url = typeof window !== 'undefined' ? window.location.pathname : 'server'
    return `sh_table_per_page_${url}_${props.endpoint}`.replace(/[^a-z0-9]+/gi, '_').toLowerCase()
}
const initialPerPage = () => {
    const saved = Number(shStorage.getItem(perPageStorageKey()))
    if (saved > 0) return saved
    return Number(props.perPage ?? getShConfig('tablePerPage', 10))
}

const page = ref(1)
const perPage = ref(initialPerPage())
const search = ref('')
const exact = ref(false)
const orderBy = ref(props.sortBy)
const orderMethod = ref(props.sortMethod)
const from = ref(null)
const to = ref(null)
const fromInput = ref('')
const toInput = ref('')

const pageStyle = computed(() =>
    props.paginationStyle ?? getShConfig('tablePaginationStyle', 'pages')
)

const cacheEnabled = computed(() => {
    if (props.cache !== null) return props.cache
    return !!getShConfig('enableTableCache', false)
})

const buildQuery = () => {
    const params = {
        order_by: orderBy.value,
        order_method: orderMethod.value,
        per_page: perPage.value,
        page: page.value,
        filter_value: search.value,
        paginated: true,
        from: from.value,
        to: to.value,
        exact: exact.value || null
    }
    Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === '' || typeof params[key] === 'undefined') {
            delete params[key]
        }
    })
    return { endpoint: props.endpoint, params }
}

const { records, meta, status, error, offline, fromCache, load } =
    useTableData({
        query: buildQuery,
        cacheEnabled: () => cacheEnabled.value,
        networkTimeout: () => props.networkTimeout
    })

const reloadData = async ({ append = false } = {}) => {
    const response = await load({ append })
    if (response) {
        emit('loaded', response)
    }
}
reloadData()

// --- search / filters ------------------------------------------------------
let searchTimer = null
const onSearchInput = () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        page.value = 1
        reloadData()
    }, 500)
}
onBeforeUnmount(() => clearTimeout(searchTimer))

// HTML date input (yyyy-mm-dd) -> backend format (MM/dd/yyyy)
const toBackendDate = (value) => {
    if (!value) return null
    const [y, m, d] = value.split('-')
    return `${m}/${d}/${y}`
}
const rangeChanged = () => {
    from.value = toBackendDate(fromInput.value)
    to.value = toBackendDate(toInput.value)
    page.value = 1
    reloadData()
}

const sortBy = (column) => {
    if (!column.sortable) return
    if (orderBy.value === column.name) {
        orderMethod.value = orderMethod.value === 'desc' ? 'asc' : 'desc'
    } else {
        orderBy.value = column.name
        orderMethod.value = 'desc'
    }
    reloadData()
}

const changePage = (newPage) => {
    page.value = newPage
    reloadData()
}
const changePerPage = (value) => {
    perPage.value = value
    page.value = 1
    shStorage.setItem(perPageStorageKey(), value)
    reloadData()
}
const loadMore = () => {
    page.value++
    reloadData({ append: true })
}

watch(() => props.reload, () => reloadData())
watch(() => props.endpoint, () => {
    page.value = 1
    perPage.value = initialPerPage()
    reloadData()
})

// --- cell rendering ---------------------------------------------------------
const cellValue = (row, column) => {
    const value = getPath(row, column.name)
    if (value === null || typeof value === 'undefined' || value === '') {
        return ''
    }
    switch (column.format) {
    case 'date':
        return shRepo.formatDate(value, 'll')
    case 'datetime':
        return shRepo.formatDate(value)
    case 'number':
        return shRepo.formatNumber(value)
    case 'money':
        return shRepo.formatNumber(value, 2)
    default:
        return value
    }
}

// --- actions -----------------------------------------------------------------
const allowed = (item) => !item.permission || userStore.isAllowedTo(item.permission)
const visibleActions = (row) =>
    props.actions.filter(action => allowed(action) && (action.show ? action.show(row) : true))
const activeMultiActions = computed(() => props.multiActions.filter(allowed))

const fillPlaceholders = (template, row) =>
    String(template).replace(/\{(.*?)\}/g, (_, key) => getPath(row, key))

const runAction = async (action, row) => {
    if (action.handler) {
        return action.handler(row)
    }
    if (action.emit) {
        emit('action', action.emit, row)
        emit(action.emit, row)
        return
    }
    if (action.link) {
        return navigate(fillPlaceholders(action.link, row))
    }
    if (action.url) {
        const url = fillPlaceholders(action.url, row)
        if (action.confirm) {
            const res = await shRepo.runPlainRequest(url, action.confirm, action.label, action.data)
            if (res.isConfirmed && res.value?.success) {
                shRepo.showToast(res.value.response?.message ?? 'Action successful')
                reloadData()
            } else if (res.isConfirmed) {
                shRepo.showToast(action.failMessage ?? 'Action failed', 'error')
            }
            return
        }
        try {
            const res = await shApis.doPost(url, action.data)
            shRepo.showToast(res.data?.message ?? 'Action successful')
            reloadData()
        } catch (reason) {
            shRepo.showToast(reason.response?.data?.message ?? 'Action failed', 'error')
        }
    }
}

const onRowClick = (row) => {
    emit('rowClick', row)
    if (props.rowLink) {
        navigate(fillPlaceholders(props.rowLink, row))
    }
}

// --- multi select ---------------------------------------------------------------
const selected = ref([])
const allSelected = computed(() =>
    records.value.length > 0 && selected.value.length === records.value.length
)
const toggleAll = () => {
    selected.value = allSelected.value ? [] : records.value.map(r => r.id)
}
const toggleOne = (id) => {
    const index = selected.value.indexOf(id)
    if (index > -1) {
        selected.value.splice(index, 1)
    } else {
        selected.value.push(id)
    }
}
const runMultiAction = (action) => {
    const rows = records.value.filter(r => selected.value.includes(r.id))
    action.handler?.(rows)
    selected.value = []
}

const colSpan = computed(() =>
    cols.value.length +
    (activeMultiActions.value.length ? 1 : 0) +
    (props.actions.length ? 1 : 0)
)

defineExpose({ reload: () => reloadData(), records })
</script>

<template>
    <div :class="t.wrapper">
        <div v-if="searchable || hasRange" :class="t.toolbar">
            <div v-if="searchable" class="flex w-full items-center gap-3 md:w-auto">
                <input
                    v-model="search"
                    type="search"
                    :placeholder="searchPlaceholder"
                    :class="t.search"
                    @input="onSearchInput"
                >
                <label v-if="search.length > 1" :class="t.exactLabel">
                    <input v-model="exact" type="checkbox" :class="t.checkbox" @change="reloadData()">
                    Exact
                </label>
            </div>
            <div v-if="hasRange" :class="t.rangeWrapper">
                <input v-model="fromInput" type="date" :class="t.rangeInput" @change="rangeChanged">
                <span class="text-xs text-gray-400">to</span>
                <input v-model="toInput" type="date" :class="t.rangeInput" @change="rangeChanged">
            </div>
        </div>

        <div v-if="offline" :class="t.offline">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM3.34 17.25h17.32c1.16 0 1.88-1.25 1.3-2.25L13.3 4.5c-.58-1-2.02-1-2.6 0L2.04 15c-.58 1 .14 2.25 1.3 2.25z" />
            </svg>
            <span>You appear to be offline — showing cached results. Search and pagination run on cached data.</span>
        </div>

        <div v-if="status === 'error' && !records.length" :class="t.error">{{ error }}</div>

        <div v-else-if="status === 'loading' && !records.length" :class="t.loading">
            <ShSpinner class="size-6" />
        </div>

        <template v-else>
            <!-- desktop table -->
            <div :class="t.container">
                <table :class="t.table">
                    <thead :class="t.thead">
                        <tr>
                            <th v-if="activeMultiActions.length" :class="t.th" class="w-10">
                                <input type="checkbox" :class="t.checkbox" :checked="allSelected" @change="toggleAll">
                            </th>
                            <th v-for="column in cols" :key="column.name" :class="t.th">
                                <a v-if="column.sortable" :class="t.sortBtn" @click="sortBy(column)">
                                    {{ column.label }}
                                    <span v-if="orderBy === column.name">{{ orderMethod === 'desc' ? '↓' : '↑' }}</span>
                                </a>
                                <template v-else>{{ column.label }}</template>
                            </th>
                            <th v-if="actions.length" :class="t.th" class="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody :class="t.tbody">
                        <tr v-if="!records.length">
                            <td :colspan="colSpan" :class="t.empty">
                                <slot name="empty">{{ emptyMessage }}</slot>
                            </td>
                        </tr>
                        <tr
                            v-for="(row, index) in records"
                            :key="row.id ?? index"
                            :class="[t.tr, rowLink ? t.trClickable : '']"
                            @click="onRowClick(row)"
                        >
                            <td v-if="activeMultiActions.length" :class="t.td" @click.stop>
                                <input
                                    type="checkbox"
                                    :class="t.checkbox"
                                    :checked="selected.includes(row.id)"
                                    @change="toggleOne(row.id)"
                                >
                            </td>
                            <td v-for="column in cols" :key="column.name" :class="[t.td, column.class]">
                                <slot :name="`cell-${column.name}`" :row="row" :value="cellValue(row, column)" :index="index">
                                    <component :is="column.component" v-if="column.component" :row="row" :value="getPath(row, column.name)" />
                                    <span v-else-if="column.format === 'money'" :class="t.money">{{ cellValue(row, column) }}</span>
                                    <span v-else v-html="cellValue(row, column)" />
                                </slot>
                            </td>
                            <td v-if="actions.length" :class="t.actionsCell" @click.stop>
                                <slot name="actions" :row="row">
                                    <a
                                        v-for="action in visibleActions(row)"
                                        :key="action.label"
                                        :class="[t.actionBtn, action.class]"
                                        @click="runAction(action, row)"
                                    >
                                        {{ action.label }}
                                    </a>
                                </slot>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- mobile cards -->
            <div :class="t.cards">
                <p v-if="!records.length" :class="t.empty">
                    <slot name="empty">{{ emptyMessage }}</slot>
                </p>
                <div
                    v-for="(row, index) in records"
                    :key="row.id ?? index"
                    :class="[t.card, rowLink ? t.trClickable : '']"
                    @click="onRowClick(row)"
                >
                    <label v-if="activeMultiActions.length" :class="t.exactLabel" class="mb-2" @click.stop>
                        <input
                            type="checkbox"
                            :class="t.checkbox"
                            :checked="selected.includes(row.id)"
                            @change="toggleOne(row.id)"
                        >
                        Select
                    </label>
                    <template v-for="column in cols" :key="column.name">
                        <p :class="t.cardLabel">{{ column.label }}</p>
                        <div :class="t.cardValue">
                            <slot :name="`cell-${column.name}`" :row="row" :value="cellValue(row, column)" :index="index">
                                <component :is="column.component" v-if="column.component" :row="row" :value="getPath(row, column.name)" />
                                <span v-else-if="column.format === 'money'" :class="t.money">{{ cellValue(row, column) }}</span>
                                <span v-else v-html="cellValue(row, column)" />
                            </slot>
                        </div>
                    </template>
                    <div v-if="actions.length" class="mt-2" @click.stop>
                        <slot name="actions" :row="row">
                            <a
                                v-for="action in visibleActions(row)"
                                :key="action.label"
                                :class="[t.actionBtn, action.class]"
                                @click="runAction(action, row)"
                            >
                                {{ action.label }}
                            </a>
                        </slot>
                    </div>
                </div>
            </div>

            <ShTablePagination
                v-if="meta && records.length"
                :meta="meta"
                :per-page="perPage"
                :mode="pageStyle"
                :loading="status === 'loading'"
                :theme="t.pagination"
                @page="changePage"
                @per-page="changePerPage"
                @load-more="loadMore"
            />
        </template>

        <div v-if="selected.length && activeMultiActions.length" :class="t.multiBar">
            <div class="text-sm text-gray-700 dark:text-gray-200">
                <span :class="t.multiCount">{{ selected.length }}</span>
                selected
            </div>
            <div class="flex items-center gap-2">
                <button
                    v-for="action in activeMultiActions"
                    :key="action.label"
                    type="button"
                    :class="[t.multiBtn, action.class]"
                    @click="runMultiAction(action)"
                >
                    {{ action.label }}
                </button>
                <button type="button" :class="t.multiBtn" @click="selected = []">Cancel</button>
            </div>
        </div>
    </div>
</template>
