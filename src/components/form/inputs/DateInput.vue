<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: String,
    isInvalid: Boolean,
    disabled: Boolean,
    withTime: Boolean,
    min: String,
    max: String
})
const emit = defineEmits(['update:modelValue', 'clearValidationErrors'])

const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})
</script>

<template>
    <input
        v-model="model"
        :type="withTime ? 'datetime-local' : 'date'"
        :min="min"
        :max="max"
        :disabled="disabled"
        @focus="emit('clearValidationErrors')"
    >
</template>
