<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: [String, Number],
    placeholder: String,
    isInvalid: Boolean,
    disabled: Boolean,
    min: [Number, String],
    max: [Number, String],
    step: [Number, String]
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
        type="number"
        :min="min"
        :max="max"
        :step="step"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="emit('clearValidationErrors')"
    >
</template>
