<script setup>
import { computed, onMounted, ref } from 'vue'
import { shApis } from '@iankibetsh/sh-core'
import { normalizeOptions } from '../../../utils/normalizeOptions.js'

const props = defineProps({
    modelValue: [String, Number],
    placeholder: String,
    isInvalid: Boolean,
    disabled: Boolean,
    // inline array of options, or omit and provide url
    options: Array,
    // remote source; fetched with { all: 1 } like shframework's SelectInput
    url: String
})
const emit = defineEmits(['update:modelValue', 'clearValidationErrors'])

const remoteOptions = ref([])
const loading = ref(false)

const items = computed(() => normalizeOptions(props.options ?? remoteOptions.value))

const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

onMounted(() => {
    if (!props.options && props.url) {
        loading.value = true
        shApis.doGet(props.url, { all: 1 }).then(res => {
            const rows = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
            remoteOptions.value = rows
        }).finally(() => {
            loading.value = false
        })
    }
})
</script>

<template>
    <select
        v-model="model"
        :disabled="disabled || loading"
        @focus="emit('clearValidationErrors')"
    >
        <option :value="null" disabled>{{ loading ? 'Loading...' : (placeholder || 'Select...') }}</option>
        <option v-for="option in items" :key="option.id" :value="option.id">{{ option.label }}</option>
    </select>
</template>
