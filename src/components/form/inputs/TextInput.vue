<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: [String, Number],
    placeholder: String,
    isInvalid: Boolean,
    disabled: Boolean
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
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="emit('clearValidationErrors')"
    >
</template>
