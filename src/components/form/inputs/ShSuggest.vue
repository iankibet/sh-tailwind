<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { shApis } from '@iankibetsh/sh-core'
import { normalizeOptions } from '../../../utils/normalizeOptions.js'
import { useTheme } from '../../../theme/useTheme.js'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    modelValue: [String, Number, Array],
    placeholder: { type: String, default: 'Type to search...' },
    isInvalid: Boolean,
    disabled: Boolean,
    // inline data array, or remote url searched with { all: 1, filter_value }
    options: Array,
    url: String,
    multiple: Boolean,
    // allow submitting free text that matches no option
    allowCustom: Boolean,
    // optional component rendered per option (receives :option)
    optionTemplate: [Object, Function]
})
const emit = defineEmits(['update:modelValue', 'clearValidationErrors'])

const t = useTheme('inputs')
const root = ref(null)
const search = ref('')
const open = ref(false)
const loading = ref(false)
const highlighted = ref(-1)
const remote = ref([])
const selected = ref([]) // [{ id, label }]

const items = computed(() => {
    const source = normalizeOptions(props.options ?? remote.value)
    const picked = new Set(selected.value.map(s => s.id))
    let list = source.filter(option => !picked.has(option.id))
    if (props.options && search.value) {
        const term = search.value.toLowerCase()
        list = list.filter(option => option.label.toLowerCase().includes(term))
    }
    return list
})

let debounceTimer = null
const remoteSearch = () => {
    if (!props.url) {
        return
    }
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        loading.value = true
        shApis.doGet(props.url, { all: 1, filter_value: search.value }).then(res => {
            const rows = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
            remote.value = rows
        }).finally(() => {
            loading.value = false
        })
    }, 300)
}

const emitValue = () => {
    if (props.multiple) {
        emit('update:modelValue', selected.value.map(s => s.id))
    } else {
        emit('update:modelValue', selected.value[0]?.id ?? null)
    }
}

const pick = (option) => {
    if (props.multiple) {
        selected.value.push(option)
    } else {
        selected.value = [option]
        open.value = false
    }
    search.value = ''
    highlighted.value = -1
    emitValue()
}

const remove = (option) => {
    selected.value = selected.value.filter(s => s.id !== option.id)
    emitValue()
}

const submitCustom = () => {
    if (!props.allowCustom || !search.value) {
        return
    }
    pick({ id: search.value, label: search.value })
}

const onInput = () => {
    open.value = true
    emit('clearValidationErrors')
    if (props.url) {
        remoteSearch()
    }
}

const onKeydown = (e) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault()
        open.value = true
        highlighted.value = Math.min(highlighted.value + 1, items.value.length - 1)
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        highlighted.value = Math.max(highlighted.value - 1, 0)
    } else if (e.key === 'Enter') {
        e.preventDefault()
        if (highlighted.value >= 0 && items.value[highlighted.value]) {
            pick(items.value[highlighted.value])
        } else {
            submitCustom()
        }
    } else if (e.key === 'Escape') {
        open.value = false
    } else if (e.key === 'Backspace' && !search.value && selected.value.length) {
        remove(selected.value[selected.value.length - 1])
    }
}

// Map incoming model ids back to badges once data is available
const initializeExisting = () => {
    const incoming = props.modelValue
    if (incoming === null || typeof incoming === 'undefined' || incoming === '') {
        return
    }
    const ids = Array.isArray(incoming) ? incoming : [incoming]
    const source = normalizeOptions(props.options ?? remote.value)
    selected.value = ids.map(id =>
        source.find(option => option.id === id) ?? { id, label: String(id) }
    )
}

const onOutsidePointer = (e) => {
    if (root.value && !root.value.contains(e.target)) {
        open.value = false
    }
}

watch(() => props.options, initializeExisting)

onMounted(() => {
    document.addEventListener('pointerdown', onOutsidePointer)
    initializeExisting()
    if (props.url && !props.options) {
        remoteSearch()
    }
})

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onOutsidePointer)
    clearTimeout(debounceTimer)
})
</script>

<template>
    <div ref="root" :class="t.suggest.wrapper">
        <div v-if="multiple && selected.length" :class="t.suggest.badges">
            <span v-for="option in selected" :key="option.id" :class="t.suggest.badge">
                {{ option.label }}
                <span :class="t.suggest.badgeRemove" @click="remove(option)">&times;</span>
            </span>
        </div>
        <input
            v-bind="$attrs"
            v-model="search"
            type="text"
            :placeholder="!multiple && selected.length ? selected[0].label : placeholder"
            :disabled="disabled"
            autocomplete="off"
            @input="onInput"
            @keydown="onKeydown"
            @focus="open = true; emit('clearValidationErrors')"
        >
        <div v-if="open && !disabled" :class="t.suggest.dropdown">
            <div v-if="loading" :class="t.suggest.empty">Searching...</div>
            <template v-else-if="items.length">
                <div
                    v-for="(option, index) in items"
                    :key="option.id"
                    :class="index === highlighted ? t.suggest.optionActive : t.suggest.option"
                    @pointerdown.prevent="pick(option)"
                    @mouseenter="highlighted = index"
                >
                    <component :is="optionTemplate" v-if="optionTemplate" :option="option.raw ?? option" />
                    <template v-else>{{ option.label }}</template>
                </div>
            </template>
            <div v-else-if="allowCustom && search" :class="t.suggest.option" @pointerdown.prevent="submitCustom">
                Use "{{ search }}"
            </div>
            <div v-else :class="t.suggest.empty">No matches</div>
        </div>
    </div>
</template>
