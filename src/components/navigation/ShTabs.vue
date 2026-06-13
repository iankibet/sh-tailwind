<script setup>
import { computed, getCurrentInstance, onMounted, ref, resolveComponent, watch } from 'vue'
import { shApis, useUserStore } from '@iankibetsh/sh-core'
import { useTheme } from '../../theme/useTheme.js'
import { startCase } from '../../utils/strings.js'

/**
 * A single, unified tabs component that replaces shframework's ShTabs +
 * ShDynamicTabs. It supports three content strategies and degrades gracefully
 * when vue-router is not installed.
 *
 *  - slots:     define `#tab-<key>` named slots (or a default slot) and ShTabs
 *               owns the active state. Most flexible.
 *  - component: give a tab a `component` and it is rendered/swapped in place.
 *  - router:    set `router` (or a `baseUrl`) and the active tab is driven by
 *               the route (`/{base}/tab/{key}`) with a nested <router-view>.
 *
 * A tab is a string, an object, or a function (called with `data`):
 *   'pending'
 *   { key, label, component, icon, count, badge, permission, validator, disabled }
 */
const props = defineProps({
    tabs: { type: Array, required: true },
    // active tab key — supports v-model:tab. Null = uncontrolled (ShTabs owns it).
    modelValue: { type: String, default: null },
    // passed to tab functions / validators and bound to rendered content
    data: { type: Object, default: () => ({}) },
    // counts shown as a bubble: object map { key: n } or an API endpoint string
    counts: { type: [Object, String], default: null },
    variant: { type: String, default: 'underline' }, // underline | pills | boxed
    // URL sync for inline modes: 'none' | 'query'
    sync: { type: String, default: 'none' },
    queryKey: { type: String, default: 'tab' },
    // router mode: render a nested <router-view> instead of inline content
    router: { type: Boolean, default: false },
    baseUrl: { type: String, default: null },
    // only mount a panel the first time it becomes active
    lazy: { type: Boolean, default: false },
    emptyMessage: { type: String, default: 'No tabs available' },
    forbiddenMessage: { type: String, default: '403 — not allowed' },
    classes: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'change'])

defineOptions({ inheritAttrs: false })

const base = useTheme('tabs', computed(() => props.classes))
const t = computed(() => {
    const variant = base.value[props.variant]
    return variant ? { ...base.value, ...variant } : base.value
})

const userStore = useUserStore()

// --- optional router -------------------------------------------------------
const $router = getCurrentInstance()?.appContext.config.globalProperties.$router ?? null
const routerMode = computed(() => !!(props.router || props.baseUrl) && !!$router)
const route = computed(() => $router?.currentRoute.value ?? null)
const RouterLink = $router ? resolveComponent('RouterLink') : null
const RouterView = $router ? resolveComponent('RouterView') : null

// --- normalise + filter tabs ----------------------------------------------
const slugify = (value) => String(value).trim().replace(/\s+/g, '_').toLowerCase()

const tabList = computed(() =>
    (props.tabs ?? [])
        .map(raw => {
            const tab = typeof raw === 'string'
                ? { key: raw }
                : typeof raw === 'function'
                    ? { ...raw(props.data) }
                    : { ...raw }
            tab.key = tab.key ?? tab.name ?? (tab.label ? slugify(tab.label) : '')
            tab.label = tab.label ?? startCase(tab.key)
            return tab
        })
        .filter(tab => {
            if (tab.validator && !tab.validator(props.data)) return false
            if (tab.permission && !userStore.isAllowedTo(tab.permission)) return false
            return true
        })
)

const hidden = computed(() => props.tabs.length > 0 && tabList.value.length === 0)

// --- counts ----------------------------------------------------------------
const fetchedCounts = ref({})
const countFor = (tab) => {
    const value = fetchedCounts.value[tab.key]
        ?? (props.counts && typeof props.counts === 'object' ? props.counts[tab.key] : undefined)
        ?? tab.count ?? tab.counts ?? tab.badge
    return value === 0 || value ? value : null
}

// --- active state (single source of truth) ---------------------------------
const activeKey = ref(null)
const activeTab = computed(() => tabList.value.find(tab => tab.key === activeKey.value) ?? null)

const mountedKeys = ref([])
const isMounted = (tab) => !props.lazy || mountedKeys.value.includes(tab.key)
const markMounted = (key) => { if (key && !mountedKeys.value.includes(key)) mountedKeys.value.push(key) }

const select = (tab) => {
    if (!tab || tab.disabled || tab.key === activeKey.value) return
    activeKey.value = tab.key
    markMounted(tab.key)
    emit('update:modelValue', tab.key)
    emit('change', tab.key, tab)
    if (props.sync === 'query' && $router && route.value) {
        $router.replace({ query: { ...route.value.query, [props.queryKey]: tab.key } })
    }
}

// keep internal state in sync with external v-model changes
watch(() => props.modelValue, (value) => {
    if (value != null && value !== activeKey.value && tabList.value.some(tab => tab.key === value)) {
        activeKey.value = value
        markMounted(value)
    }
})

// --- router mode helpers ---------------------------------------------------
const cleanBase = computed(() =>
    (props.baseUrl ?? route.value?.path ?? '').replace(/\/tab\/[^/]+\/?$/, '')
)
const tabLink = (tab) => `${cleanBase.value}/tab/${tab.key}`
const routerActiveKey = computed(() => {
    const path = route.value?.path ?? ''
    return tabList.value.find(tab => path.includes(`/tab/${tab.key}`))?.key ?? null
})

// --- init ------------------------------------------------------------------
onMounted(() => {
    if (typeof props.counts === 'string') {
        shApis.doGet(props.counts).then(res => { fetchedCounts.value = { ...res.data } }).catch(() => {})
    }
    if (tabList.value.length === 0) return

    if (routerMode.value) {
        if (!routerActiveKey.value) $router.replace(tabLink(tabList.value[0]))
        return
    }

    let initial = props.modelValue
    if (!initial && props.sync === 'query') initial = route.value?.query[props.queryKey]
    if (!tabList.value.some(tab => tab.key === initial)) initial = tabList.value[0].key

    activeKey.value = initial
    markMounted(initial)
    if (props.modelValue == null) emit('update:modelValue', initial)
    if (props.sync === 'query' && $router && route.value?.query[props.queryKey] !== initial) {
        $router.replace({ query: { ...route.value.query, [props.queryKey]: initial } })
    }
})

// --- keyboard navigation (roving tabindex) ---------------------------------
const tabRefs = ref([])
const focusTab = (index) => tabRefs.value[index]?.focus()
const enabledStep = (from, dir) => {
    const n = tabList.value.length
    for (let step = 1; step <= n; step++) {
        const index = (from + dir * step % n + n) % n
        if (!tabList.value[index].disabled) return index
    }
    return from
}
const onKeydown = (event, index) => {
    const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    let next
    if (event.key in map) next = enabledStep(index, map[event.key])
    else if (event.key === 'Home') next = tabList.value.findIndex(tab => !tab.disabled)
    else if (event.key === 'End') next = tabList.value.length - 1 - [...tabList.value].reverse().findIndex(tab => !tab.disabled)
    else return
    event.preventDefault()
    select(tabList.value[next])
    focusTab(next)
}

const isActive = (tab) => (routerMode.value ? routerActiveKey.value : activeKey.value) === tab.key

defineExpose({ active: activeKey, select })
</script>

<template>
    <div v-if="hidden" :class="t.empty">{{ forbiddenMessage }}</div>
    <div v-else-if="!tabList.length" :class="t.empty">{{ emptyMessage }}</div>

    <div v-else>
        <div :class="t.nav" role="tablist">
            <template v-for="(tab, index) in tabList" :key="tab.key">
                <!-- router mode: real links so tabs are deep-linkable & SEO friendly -->
                <component
                    :is="RouterLink"
                    v-if="routerMode"
                    :ref="el => (tabRefs[index] = el?.$el ?? el)"
                    :to="tabLink(tab)"
                    role="tab"
                    :aria-selected="isActive(tab)"
                    :tabindex="isActive(tab) ? 0 : -1"
                    :class="[isActive(tab) ? t.tabActive : t.tab, tab.class]"
                    @keydown="onKeydown($event, index)"
                >
                    <component :is="tab.icon" v-if="tab.icon" :class="t.icon" />
                    {{ tab.label }}
                    <span v-if="countFor(tab) != null" :class="isActive(tab) ? t.countActive : t.count">{{ countFor(tab) }}</span>
                </component>

                <!-- inline mode: buttons drive local state -->
                <button
                    v-else
                    :ref="el => (tabRefs[index] = el)"
                    type="button"
                    role="tab"
                    :aria-selected="isActive(tab)"
                    :tabindex="isActive(tab) ? 0 : -1"
                    :disabled="tab.disabled"
                    :class="[isActive(tab) ? t.tabActive : t.tab, tab.class]"
                    @click="select(tab)"
                    @keydown="onKeydown($event, index)"
                >
                    <component :is="tab.icon" v-if="tab.icon" :class="t.icon" />
                    {{ tab.label }}
                    <span v-if="countFor(tab) != null" :class="isActive(tab) ? t.countActive : t.count">{{ countFor(tab) }}</span>
                </button>
            </template>
        </div>

        <!-- router mode: nested route renders the panel -->
        <div v-if="routerMode" :class="t.panel" role="tabpanel">
            <component :is="RouterView" v-bind="$attrs" :data="data" />
        </div>

        <!-- inline mode: component / slot content, kept alive via v-show -->
        <div v-else :class="t.panel" role="tabpanel" tabindex="0">
            <template v-for="tab in tabList" :key="tab.key">
                <div v-if="isMounted(tab)" v-show="tab.key === activeKey">
                    <component :is="tab.component" v-if="tab.component" v-bind="$attrs" :data="data" />
                    <slot v-else :name="`tab-${tab.key}`" :tab="tab" :active="tab.key === activeKey">
                        <slot :tab="tab" :active="tab.key === activeKey" />
                    </slot>
                </div>
            </template>
        </div>
    </div>
</template>
